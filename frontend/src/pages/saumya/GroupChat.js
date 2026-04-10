import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./GroupChat.css";
import {
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
} from "../../utils/chatApi";
import {
  searchChatUsers,
  createOrOpenDirectChat,
} from "../../utils/chatUserApi";
import socket from "../../utils/socket";

function GroupChat() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const currentUser = {
    id: storedUser._id || storedUser.id || "",
    name:
      storedUser.name ||
      storedUser.fullName ||
      storedUser.username ||
      "Saumya",
    avatar: (
      storedUser.name ||
      storedUser.fullName ||
      storedUser.username ||
      "S"
    )
      .charAt(0)
      .toUpperCase(),
    status: "online",
  };

  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedChat?._id) {
      loadMessages(selectedChat._id);
      setMembers(selectedChat.members || []);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat?._id) return;

    socket.emit("join_group", selectedChat._id);

    const handleReceiveMessage = (message) => {
      if (message.groupId !== selectedChat._id) return;

      setMessages((prev) => {
        const exists = prev.some(
          (item) => (item._id || item.id) === (message._id || message.id)
        );
        if (exists) return prev;
        return [...prev, message];
      });

      setGroups((prev) =>
        prev.map((group) =>
          group._id === selectedChat._id
            ? { ...group, lastMessage: message.text || "New message" }
            : group
        )
      );
    };

    const handleUserTyping = (data) => {
      if (
        data.groupId === selectedChat._id &&
        data.userId !== currentUser.id &&
        data.userName
      ) {
        setTypingUser(`${data.userName} is typing...`);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.groupId === selectedChat._id) {
        setTypingUser("");
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [selectedChat?._id, currentUser.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const data = await getMyGroups();

      const groupList = Array.isArray(data) ? data : data.groups || [];
      setGroups(groupList);

      if (groupList.length > 0) {
        setSelectedChat((prev) => prev || groupList[0]);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadMessages = async (groupId) => {
    try {
      setLoadingMessages(true);
      const data = await getGroupMessages(groupId);
      const messageList = Array.isArray(data) ? data : data.messages || [];
      setMessages(messageList);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const emitStopTyping = () => {
    if (!selectedChat?._id) return;

    socket.emit("stop_typing", {
      groupId: selectedChat._id,
      userId: currentUser.id,
      userName: currentUser.name,
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat?._id) return;

    try {
      const payload = {
        text: messageInput.trim(),
        type: "text",
      };

      const savedMessage = await sendGroupMessage(selectedChat._id, payload);

      socket.emit("send_message", {
        ...savedMessage,
        groupId: selectedChat._id,
      });

      setMessages((prev) => {
        const exists = prev.some(
          (item) =>
            (item._id || item.id) === (savedMessage._id || savedMessage.id)
        );
        if (exists) return prev;
        return [...prev, savedMessage];
      });

      setGroups((prev) =>
        prev.map((group) =>
          group._id === selectedChat._id
            ? { ...group, lastMessage: savedMessage.text || "New message" }
            : group
        )
      );

      setMessageInput("");
      setShowEmojiPicker(false);
      setTypingUser("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      emitStopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!selectedChat?._id) return;

    if (value.trim()) {
      socket.emit("typing", {
        groupId: selectedChat._id,
        userId: currentUser.id,
        userName: currentUser.name,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping();
      }, 1200);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping();
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat?._id) return;

    const isImage = file.type.startsWith("image/");
    const fileUrl = URL.createObjectURL(file);

    const previewMessage = {
      _id: Date.now().toString(),
      groupId: selectedChat._id,
      sender: {
        _id: currentUser.id,
        name: currentUser.name,
      },
      createdAt: new Date().toISOString(),
      type: isImage ? "image" : "file",
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileUrl,
    };

    setMessages((prev) => [...prev, previewMessage]);

    e.target.value = "";
  };

  const handleUserSearch = async (value) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchedUsers([]);
      setSearchingUsers(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const users = await searchChatUsers(value.trim());
        setSearchedUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error("Failed to search users:", error);
        setSearchedUsers([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 400);
  };

  const handleStartDirectChat = async (user) => {
    try {
      const chat = await createOrOpenDirectChat(user._id);

      setGroups((prev) => {
        const exists = prev.some((group) => group._id === chat._id);
        if (exists) return prev;
        return [chat, ...prev];
      });

      setSelectedChat(chat);
      setMembers(chat.members || []);
      setSearchTerm("");
      setSearchedUsers([]);
    } catch (error) {
      console.error("Failed to start direct chat:", error);
    }
  };

  const renderMessageContent = (msg, isOwn) => {
    if (msg.type === "image") {
      return (
        <div
          className={`message-bubble ${isOwn ? "own" : "other"} file-bubble`}
        >
          <img
            src={msg.fileUrl}
            alt={msg.fileName || "image"}
            className="chat-image-preview"
          />
          <div className="file-details">
            <strong>{msg.fileName || "Image"}</strong>
            <span>{msg.fileSize || ""}</span>
          </div>
        </div>
      );
    }

    if (msg.type === "file") {
      return (
        <a
          href={msg.fileUrl}
          download={msg.fileName}
          className={`message-bubble ${isOwn ? "own" : "other"} file-bubble file-link`}
        >
          <div className="file-icon">📎</div>
          <div className="file-details">
            <strong>{msg.fileName || "File"}</strong>
            <span>{msg.fileSize || ""}</span>
          </div>
        </a>
      );
    }

    return (
      <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
        {msg.text}
      </div>
    );
  };

  const isDirectChat = (chat) => {
    return chat?.members && chat.members.length === 2;
  };

  const getDirectChatOtherUser = (chat) => {
    if (!isDirectChat(chat)) return null;

    return chat.members.find(
      (member) => (member._id || member.id) !== currentUser.id
    );
  };

  const getChatDisplayName = (chat) => {
    if (!chat) return "Select a group";

    if (isDirectChat(chat)) {
      const otherUser = getDirectChatOtherUser(chat);
      return otherUser?.name || chat.name || "Direct Chat";
    }

    return chat.name || "Group Chat";
  };

  const getChatDisplayAvatar = (chat) => {
    const displayName = getChatDisplayName(chat);
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div className="groupchat-page">
      <div className="groupchat-header-card">
        <div className="header-circle header-circle-one"></div>
        <div className="header-circle header-circle-two"></div>

        <div className="groupchat-badge">
          <span className="groupchat-badge-icon">💬</span>
          <span>Collaborative</span>
        </div>

        <h1>Group Chat</h1>
        <p>
          Connect with classmates, discuss lessons, share updates, and work
          together in real time through your EDUZA group conversations.
        </p>
      </div>

      <div className="groupchat-main">
        <aside className="chat-sidebar">
          <div className="sidebar-top">
            <div className="sidebar-title">Chat</div>
          </div>

          <div className="profile-card">
            <div className="profile-avatar large-avatar">{currentUser.avatar}</div>
            <h3>{currentUser.name}</h3>
            <span className="online-pill">{currentUser.status}</span>
          </div>

          <div className="chat-search-box">
            <input
              type="text"
              placeholder="Search student by name or email"
              value={searchTerm}
              onChange={(e) => handleUserSearch(e.target.value)}
            />

            {searchTerm && (
              <div className="user-search-results">
                {searchingUsers ? (
                  <div className="user-search-item">Searching...</div>
                ) : searchedUsers.length === 0 ? (
                  <div className="user-search-item">No students found</div>
                ) : (
                  searchedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="user-search-item"
                      onClick={() => handleStartDirectChat(user)}
                    >
                      <div className="user-search-avatar">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="user-search-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="chat-list-title">My groups</div>

          <div className="chat-list">
            {loadingGroups ? (
              <p>Loading groups...</p>
            ) : groups.length === 0 ? (
              <p>No groups found.</p>
            ) : (
              groups.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-list-item ${selectedChat?._id === chat._id ? "active" : ""
                    }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-avatar">
                    {getChatDisplayAvatar(chat)}
                  </div>

                  <div className="chat-item-content">
                    <div className="chat-item-top">
                      <h4>{getChatDisplayName(chat)}</h4>
                    </div>
                    <p>{chat.lastMessage || "No messages yet"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="chat-center">
          <div className="chat-center-top">
            <div>
              <h2>{getChatDisplayName(selectedChat)}</h2>
              <p>{isDirectChat(selectedChat) ? "Direct message" : `${members.length} participants`}</p>
            </div>

            <div className="top-tabs">
              <button
                className={activeTab === "messages" ? "active" : ""}
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </button>
              <button
                className={activeTab === "participants" ? "active" : ""}
                onClick={() => setActiveTab("participants")}
              >
                Participants
              </button>
            </div>
          </div>

          <div className="chat-messages-area">
            {loadingMessages ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => {
                const isOwn =
                  msg.sender?._id === currentUser.id ||
                  msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg._id || msg.id}
                    className={`message-row ${isOwn ? "own-message" : "other-message"
                      }`}
                  >
                    {!isOwn && (
                      <div className="message-avatar">
                        {(msg.sender?.name || msg.senderName || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="message-bubble-wrap">
                      {!isOwn && (
                        <div className="message-meta">
                          <span className="sender-name">
                            {msg.sender?.name || msg.senderName || "User"}
                          </span>
                          <span className="message-time">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      )}

                      {renderMessageContent(msg, isOwn)}

                      {isOwn && (
                        <div className="message-meta own-meta">
                          <span className="message-time">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {typingUser && <div className="typing-text">{typingUser}</div>}
            <div ref={messageEndRef}></div>
          </div>

          <div className="chat-input-wrapper">
            {showEmojiPicker && (
              <div className="emoji-picker-box">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}

            <div className="chat-input-area">
              <button
                className="icon-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😊
              </button>

              <textarea
                placeholder="Write your message..."
                value={messageInput}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <button className="icon-btn" onClick={handleFileButtonClick}>
                📎
              </button>

              <button className="send-btn" onClick={handleSendMessage}>
                ➤
              </button>
            </div>
          </div>
        </section>

        <aside className="chat-rightbar">
          <div className="rightbar-header">
            <h3>Members</h3>
            <p>{members.length} people</p>
          </div>

          <div className="members-list">
            {members.map((member, index) => (
              <div key={member._id || index} className="member-item">
                <div className="member-left">
                  <div className="member-avatar">
                    {(member.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{member.name || "Unknown User"}</h4>
                    <span>{member.role || "Member"}</span>
                  </div>
                </div>

                <div
                  className={`status-dot ${member.status || "offline"}`}
                ></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default GroupChat;