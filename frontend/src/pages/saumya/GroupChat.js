import React, { useMemo, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./GroupChat.css";

function GroupChat() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const currentUser = {
    id: storedUser._id || storedUser.id || 1,
    name: storedUser.name || storedUser.fullName || storedUser.username || "Saumya",
    avatar:
      (storedUser.name || storedUser.fullName || storedUser.username || "S")
        .charAt(0)
        .toUpperCase(),
    status: "available",
  };

  const chats = [
    {
      id: 1,
      name: "Real estate deals",
      lastMessage: "Hmm...",
      time: "11:15",
      unread: 2,
      active: true,
      avatar: "R",
    },
    {
      id: 2,
      name: "Kate Johnson",
      lastMessage: "I will send the document...",
      time: "11:35",
      unread: 0,
      avatar: "K",
    },
  ];

  const members = [
    { id: 1, name: currentUser.name, role: "Admin", status: "online", avatar: currentUser.avatar },
    { id: 2, name: "Kate Johnson", role: "Member", status: "online", avatar: "K" },
  ];

  const initialMessages = [
    {
      id: 1,
      senderId: 2,
      senderName: "Kate Johnson",
      text: "Hi everyone, let’s start the real estate discussion 😊",
      time: "11:24 AM",
    },
    {
      id: 2,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: "He creates an atmosphere of mystery 😉",
      time: "11:26 AM",
    },
  ];

  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingText = useMemo(() => {
    return "Robert is typing...";
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: messageInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setShowEmojiPicker(false);
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
            <input type="text" placeholder="Search" />
          </div>

          <div className="chat-list-title">Last chats</div>

          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-list-item ${selectedChat.id === chat.id ? "active" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="chat-avatar">{chat.avatar}</div>

                <div className="chat-item-content">
                  <div className="chat-item-top">
                    <h4>{chat.name}</h4>
                    <span>{chat.time}</span>
                  </div>
                  <p>{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && <div className="chat-unread">{chat.unread}</div>}
              </div>
            ))}
          </div>
        </aside>

        <section className="chat-center">
          <div className="chat-center-top">
            <div>
              <h2>{selectedChat.name}</h2>
              <p>{members.length} participants</p>
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
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`message-row ${isOwn ? "own-message" : "other-message"}`}
                >
                  {!isOwn && (
                    <div className="message-avatar">{msg.senderName.charAt(0)}</div>
                  )}

                  <div className="message-bubble-wrap">
                    {!isOwn && (
                      <div className="message-meta">
                        <span className="sender-name">{msg.senderName}</span>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    )}

                    <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
                      {msg.text}
                    </div>

                    {isOwn && (
                      <div className="message-meta own-meta">
                        <span className="message-time">{msg.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="typing-text">{typingText}</div>
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
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />

              <button className="icon-btn">📎</button>

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
        </aside>
      </div>
    </div>
  );
}

export default GroupChat;