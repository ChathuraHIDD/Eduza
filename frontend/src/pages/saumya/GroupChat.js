function GroupChat() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
          borderRadius: "24px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          minHeight: "165px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -55,
            right: 100,
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.14)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "14px",
            width: "fit-content",
            marginBottom: "14px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            💬
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Collaborative
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 10px 0",
            color: "#fff",
            fontSize: "28px",
            fontWeight: "800",
            position: "relative",
            zIndex: 1,
          }}
        >
          Group Chat
        </h1>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.92)",
            fontSize: "14px",
            lineHeight: "1.7",
            maxWidth: "760px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Connect with classmates, discuss lessons, share updates, and work
          together in real time through your EDUZA group conversations.
        </p>
      </div>
    </div>
  );
}

export default GroupChat;