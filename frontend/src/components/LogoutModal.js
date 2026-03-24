import { useEffect, useState } from "react";

function LogoutModal({ open, onClose, onConfirm }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.modal,
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(14px) scale(0.96)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.iconWrap}>
          <div style={styles.iconCircle}>!</div>
        </div>

        <h2 style={styles.title}>Log out</h2>

        <p style={styles.message}>
          Are you sure you want to log out from your EDUZA account?
        </p>

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>

          <button onClick={onConfirm} style={styles.logoutButton}>
            Yes, Log out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.35)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
    textAlign: "center",
  },

  iconWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },

  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "800",
    boxShadow: "0 8px 20px rgba(249,115,22,0.25)",
  },

  title: {
    margin: "0 0 10px",
    color: "#1e293b",
    fontSize: "24px",
    fontWeight: "800",
  },

  message: {
    margin: "0 0 22px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },

  cancelButton: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: "600",
    cursor: "pointer",
  },

  logoutButton: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(249,115,22,0.25)",
  },
};

export default LogoutModal;