import React, { useEffect, useMemo, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./GroupChat.css";
import {
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  createGroupWithMembers,
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
    email: storedUser.email || "",
  };

  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [chatFilter, setChatFilter] = useState("all");
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupUserSearch, setGroupUserSearch] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const groupSearchTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (!currentUser.id) return;

    socket.emit("user_online", { userId: currentUser.id });

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds || []);
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("online_users", handleOnlineUsers);
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedChat?._id) {
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat?.members) return;

    const updatedMembers = selectedChat.members.map((member) => ({
      ...member,
      status: onlineUserIds.includes(member._id || member.id)
        ? "online"
        : "offline",
    }));

    setMembers(updatedMembers);
  }, [onlineUserIds, selectedChat]);

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
            ? {
                ...group,
                lastMessage:
                  message.type === "image"
                    ? "📷 Photo"
                    : message.type === "file"
                    ? "📎 File"
                    : message.type === "voice"
                    ? "🎤 Voice message"
                    : message.text || "New message",
                updatedAt: message.createdAt || new Date().toISOString(),
              }
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
            ? {
                ...group,
                lastMessage: savedMessage.text || "New message",
                updatedAt: savedMessage.createdAt || new Date().toISOString(),
              }
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

    setGroups((prev) =>
      prev.map((group) =>
        group._id === selectedChat._id
          ? {
              ...group,
              lastMessage: isImage ? "📷 Photo" : "📎 File",
              updatedAt: previewMessage.createdAt,
            }
          : group
      )
    );

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
    }, 350);
  };

  const handleGroupUserSearch = async (value) => {
    setGroupUserSearch(value);

    if (groupSearchTimeoutRef.current) {
      clearTimeout(groupSearchTimeoutRef.current);
    }

    if (!value.trim()) {
      setGroupSearchResults([]);
      return;
    }

    groupSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const users = await searchChatUsers(value.trim());
        const filtered = (Array.isArray(users) ? users : []).filter(
          (user) =>
            !selectedGroupUsers.some((selected) => selected._id === user._id)
        );
        setGroupSearchResults(filtered);
      } catch (error) {
        console.error("Failed to search group users:", error);
        setGroupSearchResults([]);
      }
    }, 300);
  };

  const addUserToNewGroup = (user) => {
    setSelectedGroupUsers((prev) => [...prev, user]);
    setGroupUserSearch("");
    setGroupSearchResults([]);
  };

  const removeUserFromNewGroup = (userId) => {
    setSelectedGroupUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedGroupUsers.length === 0) {
      alert("Please add at least one member");
      return;
    }

    try {
      setCreatingGroup(true);

      const newGroup = await createGroupWithMembers({
        name: groupName.trim(),
        memberIds: selectedGroupUsers.map((user) => user._id),
      });

      setGroups((prev) => [newGroup, ...prev]);
      setSelectedChat(newGroup);
      setShowCreateGroupModal(false);
      setGroupName("");
      setGroupUserSearch("");
      setGroupSearchResults([]);
      setSelectedGroupUsers([]);
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleStartDirectChat = async (user) => {
    try {
      const chat = await createOrOpenDirectChat(user._id);

      const chatWithStatus = {
        ...chat,
        members: (chat.members || []).map((member) => ({
          ...member,
          status: onlineUserIds.includes(member._id || member.id)
            ? "online"
            : "offline",
        })),
      };

      setGroups((prev) => {
        const exists = prev.some((group) => group._id === chatWithStatus._id);
        if (exists) return prev;
        return [chatWithStatus, ...prev];
      });

      setSelectedChat(chatWithStatus);
      setMembers(chatWithStatus.members || []);
      setSearchTerm("");
      setSearchedUsers([]);
    } catch (error) {
      console.error("Failed to start direct chat:", error);
    }
  };

  const isDirectChat = (chat) => chat?.members && chat.members.length === 2;

  const getDirectChatOtherUser = (chat) => {
    if (!isDirectChat(chat)) return null;
    return chat.members.find(
      (member) => (member._id || member.id) !== currentUser.id
    );
  };

  const getChatDisplayName = (chat) => {
    if (!chat) return "Select a chat";

    if (isDirectChat(chat)) {
      const otherUser = getDirectChatOtherUser(chat);
      return otherUser?.name || chat.name || "Direct Chat";
    }

    return chat.name || "Group Chat";
  };

  const getChatSubtitle = (chat) => {
    if (!chat) return "";

    if (isDirectChat(chat)) {
      const otherUser = getDirectChatOtherUser(chat);
      const isOnline = onlineUserIds.includes(otherUser?._id || otherUser?.id);
      return isOnline ? "online" : "offline";
    }

    return `${chat.members?.length || 0} members`;
  };

  const getChatDisplayAvatar = (chat) => {
    if (isDirectChat(chat)) {
      const otherUser = getDirectChatOtherUser(chat);
      return (otherUser?.name || "U").charAt(0).toUpperCase();
    }
    return (chat?.name || "G").charAt(0).toUpperCase();
  };

  const filteredGroups = useMemo(() => {
    if (chatFilter === "direct") {
      return groups.filter((chat) => isDirectChat(chat));
    }
    if (chatFilter === "groups") {
      return groups.filter((chat) => !isDirectChat(chat));
    }
    return groups;
  }, [groups, chatFilter]);

  const formatMessageTime = (dateValue) => {
    return new Date(dateValue || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChatListTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const renderMessageContent = (msg, isOwn) => {
    if (msg.type === "image") {
      return (
        <div className={`messenger-bubble ${isOwn ? "own" : "other"} file-bubble`}>
          <img
            src={msg.fileUrl}
            alt={msg.fileName || "image"}
            className="chat-image-preview"
          />
          <div className="file-details">
            <strong>{msg.fileName || "Image"}</strong>
            <span>{msg.fileSize || ""}</span>
          </div>
          <span className="bubble-time">{formatMessageTime(msg.createdAt)}</span>
        </div>
      );
    }

    if (msg.type === "file") {
      return (
        <a
          href={msg.fileUrl}
          download={msg.fileName}
          className={`messenger-bubble ${isOwn ? "own" : "other"} file-bubble file-link`}
        >
          <div className="file-icon">📎</div>
          <div className="file-details">
            <strong>{msg.fileName || "File"}</strong>
            <span>{msg.fileSize || ""}</span>
          </div>
          <span className="bubble-time">{formatMessageTime(msg.createdAt)}</span>
        </a>
      );
    }

    return (
      <div className={`messenger-bubble ${isOwn ? "own" : "other"}`}>
        <div className="bubble-text">{msg.text}</div>
        <span className="bubble-time">{formatMessageTime(msg.createdAt)}</span>
      </div>
    );
  };

  const teamBadges = ["A", "C", "N", "I", "P"];

  return (
    <div className="messenger-page">
      <div className="messenger-shell">
        <aside className="messenger-left-panel">
          <div className="profile-card-soft">
            <div className="profile-photo-soft">{currentUser.avatar}</div>
            <h3>{currentUser.name}</h3>
            <span>@{currentUser.email ? currentUser.email.split("@")[0] : "eduza_user"}</span>
          </div>

          <div className="soft-divider" />

          <div className="side-section">
            <div className="teams-header-row">
              <h4>Teams</h4>
              <button
                className="create-group-icon-btn"
                onClick={() => setShowCreateGroupModal(true)}
                title="Create Group"
              >
                ＋
              </button>
            </div>

            <div className="team-badges">
              {teamBadges.map((item, index) => (
                <div key={index} className="team-badge">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="side-section chats-section">
            <div className="chat-section-title">
              <h4>Chats</h4>
              <div className="chat-filter-tabs">
                <button
                  className={chatFilter === "all" ? "active" : ""}
                  onClick={() => setChatFilter("all")}
                >
                  All
                </button>
                <button
                  className={chatFilter === "direct" ? "active" : ""}
                  onClick={() => setChatFilter("direct")}
                >
                  New
                </button>
                <button
                  className={chatFilter === "groups" ? "active" : ""}
                  onClick={() => setChatFilter("groups")}
                >
                  Groups
                </button>
              </div>
            </div>

            <div className="search-box-soft">
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

            <div className="chat-list-soft">
              {loadingGroups ? (
                <div className="empty-soft">Loading chats...</div>
              ) : filteredGroups.length === 0 ? (
                <div className="empty-soft">No chats found.</div>
              ) : (
                filteredGroups.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item-soft ${selectedChat?._id === chat._id ? "active" : ""}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar-soft-wrap">
                      <div className="chat-avatar-soft">
                        {getChatDisplayAvatar(chat)}
                      </div>
                      {isDirectChat(chat) && (
                        <span
                          className={`chat-status-dot ${
                            onlineUserIds.includes(getDirectChatOtherUser(chat)?._id)
                              ? "online"
                              : "offline"
                          }`}
                        />
                      )}
                    </div>

                    <div className="chat-item-soft-main">
                      <div className="chat-item-soft-top">
                        <h5>{getChatDisplayName(chat)}</h5>
                        <span>{formatChatListTime(chat.updatedAt)}</span>
                      </div>
                      <p>{chat.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="messenger-center-panel">
          {selectedChat ? (
            <>
              <div className="conversation-header-soft">
                <div className="conversation-user-soft">
                  <div className="conversation-avatar-soft">
                    {getChatDisplayAvatar(selectedChat)}
                  </div>
                  <div>
                    <h3>{getChatDisplayName(selectedChat)}</h3>
                    <span>{typingUser || getChatSubtitle(selectedChat)}</span>
                  </div>
                </div>

                <div className="conversation-tools-soft">
                  <button>🔍</button>
                  <button>📞</button>
                  <button>🎥</button>
                  <button onClick={() => setShowInfoPanel((prev) => !prev)}>⋯</button>
                </div>
              </div>

              <div className="messages-area-soft">
                {loadingMessages ? (
                  <div className="empty-soft">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-soft">No messages yet.</div>
                ) : (
                  messages.map((msg) => {
                    const isOwn =
                      msg.sender?._id === currentUser.id ||
                      msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg._id || msg.id}
                        className={`message-row-soft ${isOwn ? "own" : "other"}`}
                      >
                        {!isOwn && (
                          <div className="message-avatar-soft">
                            {(msg.sender?.name || msg.senderName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="message-wrap-soft">
                          {!isOwn && (
                            <div className="message-sender-soft">
                              {msg.sender?.name || msg.senderName || "User"}
                            </div>
                          )}
                          {renderMessageContent(msg, isOwn)}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messageEndRef} />
              </div>

              <div className="composer-soft-wrap">
                {showEmojiPicker && (
                  <div className="emoji-picker-box soft-style">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}

                <div className="composer-soft">
                  <button className="composer-icon-soft" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                    😊
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  <button className="composer-icon-soft" onClick={handleFileButtonClick}>
                    📎
                  </button>

                  <textarea
                    placeholder="Type here"
                    value={messageInput}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />

                  <button className="send-soft-btn" onClick={handleSendMessage}>
                    Send ➤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-soft">
              <div className="no-chat-soft-inner">
                <div className="no-chat-badge">💬</div>
                <h3>Welcome to EDUZA Chat</h3>
                <p>Select a conversation to start messaging.</p>
              </div>
            </div>
          )}
        </main>

        {showInfoPanel && selectedChat && (
          <aside className="messenger-right-panel">
            <div className="info-profile-soft">
              <div className="info-photo-soft">{getChatDisplayAvatar(selectedChat)}</div>
              <h2>{getChatDisplayName(selectedChat)}</h2>
              <p>{getChatSubtitle(selectedChat)}</p>
            </div>

            <div className="info-actions-soft">
              <button>
                <span>📞</span>
                <small>Call</small>
              </button>
              <button>
                <span>💬</span>
                <small>Message</small>
              </button>
              <button>
                <span>🎥</span>
                <small>Video</small>
              </button>
              <button>
                <span>⋯</span>
                <small>More</small>
              </button>
            </div>

            <div className="info-details-soft">
              <div className="info-detail-row">
                <label>Email</label>
                <span>
                  {isDirectChat(selectedChat)
                    ? getDirectChatOtherUser(selectedChat)?.email || "Not available"
                    : "Group chat"}
                </span>
              </div>
              <div className="info-detail-row">
                <label>Type</label>
                <span>{isDirectChat(selectedChat) ? "Direct message" : "Group chat"}</span>
              </div>
              <div className="info-detail-row">
                <label>Members</label>
                <span>{members.length}</span>
              </div>
            </div>

            <div className="members-section-soft">
              <h4>Members</h4>

              <div className="member-list-soft">
                {members.map((member, index) => (
                  <div key={member._id || index} className="member-item-soft">
                    <div className="member-item-soft-left">
                      <div className="member-avatar-soft">
                        {(member.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{member.name || "Unknown User"}</strong>
                        <span>{member.role || "Member"}</span>
                      </div>
                    </div>

                    <div className={`member-status-soft ${member.status || "offline"}`} />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {showCreateGroupModal && (
        <div className="group-modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="group-modal-header">
              <h3>Create Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)}>✕</button>
            </div>

            <div className="group-modal-body">
              <label>Group Name</label>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              <label>Add Members</label>
              <input
                type="text"
                placeholder="Search users by name or email"
                value={groupUserSearch}
                onChange={(e) => handleGroupUserSearch(e.target.value)}
              />

              {groupUserSearch && (
                <div className="group-user-search-results">
                  {groupSearchResults.length === 0 ? (
                    <div className="group-user-search-item">No users found</div>
                  ) : (
                    groupSearchResults.map((user) => (
                      <div
                        key={user._id}
                        className="group-user-search-item"
                        onClick={() => addUserToNewGroup(user)}
                      >
                        <div className="group-user-avatar">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="group-user-info">
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="selected-group-users">
                {selectedGroupUsers.map((user) => (
                  <div key={user._id} className="selected-group-user-chip">
                    <span>{user.name}</span>
                    <button onClick={() => removeUserFromNewGroup(user._id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="group-modal-footer">
              <button
                className="group-cancel-btn"
                onClick={() => setShowCreateGroupModal(false)}
              >
                Cancel
              </button>
              <button
                className="group-create-btn"
                onClick={handleCreateGroup}
                disabled={creatingGroup}
              >
                {creatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChat;