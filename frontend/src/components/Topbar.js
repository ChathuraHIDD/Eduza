import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "../utils/notificationApi";

const pageTitles = {
  "/": "Dashboard",
  "/lecturer": "Lecturer Dashboard",
  "/admin": "Admin Dashboard",
  "/coordinator": "Coordinator Dashboard",
  "/smart-schedule": "Smart Schedule",
  "/stress-hub": "Stress Management Hub",
  "/profile": "My Profile",
  "/lecture-profile": "Lecture Profile",
  "/software-hub": "Software Hub",
  "/kuppi-sessions": "Kuppi Sessions",
  "/admin/kuppi-details": "Kuppi Details",
  "/lecturer/module-quiz": "Module Quiz Manager",
  "/lecturer/module-selfcheck": "Module Self Check",
  "/progress-tracker": "Progress Tracker",
  "/mbti-measure": "MBTI Measure",
};

function Topbar({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [clearingNotifications, setClearingNotifications] = useState(false);
  const [deletingNotificationId, setDeletingNotificationId] = useState("");
  const popoverRef = useRef(null);

  // get logged user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // create initials from user name
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const items = await getNotifications();
      setNotifications(Array.isArray(items) ? items : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            String(item._id) === String(notification._id)
              ? { ...item, read: true }
              : item
          )
        );
      } catch {
        // Ignore read failures.
      }
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();

    const confirmed = window.confirm("Delete this notification?");
    if (!confirmed) return;

    setDeletingNotificationId(notificationId);
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => String(item._id) !== String(notificationId)));
    } catch {
      // Ignore delete failures.
    } finally {
      setDeletingNotificationId("");
    }
  };

  const handleClearAllNotifications = async () => {
    if (!notifications.length) return;

    const confirmed = window.confirm("Clear all notifications?");
    if (!confirmed) return;

    setClearingNotifications(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch {
      // Ignore clear failures.
    } finally {
      setClearingNotifications(false);
    }
  };

  return (
    <header
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #e8ecf4",
        display: "flex",
        alignItems: "center",
        padding: "0 1.5rem",
        gap: "1rem",
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
        }}
        className="mobile-menu-btn"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BrandLogo width={84} height={32} rounded={10} scale={1.04} />
        <h1
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a2e",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#f4f6fb",
          border: "1.5px solid #e8ecf4",
          borderRadius: "10px",
          padding: "7px 14px",
          maxWidth: 240,
          width: "100%",
          transition: "border-color 0.15s",
        }}
      >
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          placeholder="Search..."
          style={{
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#374151",
            width: "100%",
          }}
        />
      </div>

      {/* Notification bell */}
      <div ref={popoverRef} style={{ position: "relative" }}>
        <button
          onClick={() => setNotificationOpen((value) => !value)}
          style={{
          background: "#f4f6fb",
          border: "1.5px solid #e8ecf4",
          borderRadius: "10px",
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#6b7280",
          position: "relative",
          flexShrink: 0,
          transition: "all 0.15s ease",
          }}
        >
          <svg
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                background: "#f97316",
                border: "1.5px solid #ffffff",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {notificationOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "48px",
              width: 360,
              maxHeight: 420,
              overflow: "hidden",
              background: "#fff",
              border: "1px solid #e8ecf4",
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              zIndex: 80,
            }}
          >
            <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>Notifications</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{loadingNotifications ? "Loading..." : `${notifications.length} item${notifications.length === 1 ? '' : 's'}`}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={loadNotifications}
                  style={{
                    border: "none",
                    background: "#f4f6fb",
                    color: "#6b7280",
                    borderRadius: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleClearAllNotifications}
                  disabled={clearingNotifications || notifications.length === 0}
                  style={{
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#ef4444",
                    borderRadius: 10,
                    padding: "6px 10px",
                    cursor: clearingNotifications || notifications.length === 0 ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {clearingNotifications ? "Clearing..." : "Clear all"}
                </button>
              </div>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.length === 0 && !loadingNotifications && (
                <div style={{ padding: "1rem", fontSize: 13, color: "#6b7280" }}>No notifications yet.</div>
              )}

              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => {
                    handleOpenNotification(notification)
                    setNotificationOpen(false)
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.9rem 1rem",
                    border: "none",
                    borderBottom: "1px solid #f1f5f9",
                    background: notification.read ? "#fff" : "#fff7ed",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>{notification.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.45 }}>{notification.message}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {!notification.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', flexShrink: 0, marginTop: 6 }} />}
                      <button
                        type="button"
                        onClick={(event) => handleDeleteNotification(notification._id, event)}
                        disabled={deletingNotificationId === notification._id}
                        style={{
                          border: "1px solid rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#ef4444",
                          borderRadius: 8,
                          padding: "4px 8px",
                          cursor: deletingNotificationId === notification._id ? "not-allowed" : "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {deletingNotificationId === notification._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f97316, #c2410c)",
          border: "2px solid #ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
        }}
      >
        {getInitials(user?.name || "User")}
      </div>
    </header>
  );
}

export default Topbar;
