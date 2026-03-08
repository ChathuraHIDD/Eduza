import { useNavigate } from "react-router-dom";

function LecturerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.name ? user.name.split(" ")[0] : "Lecturer";

  const navigate = useNavigate();

  const handleAddSoftware = () => {
    navigate("/upload-software");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
          borderRadius: 24,
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          minHeight: "160px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        {/* Glow shapes */}
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
            fontSize: 13,
            color: "#fff",
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            position: "relative",
            zIndex: 1,
          }}
        >
          Lecturer Dashboard
        </div>

        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            position: "relative",
            zIndex: 1,
          }}
        >
          Welcome back, {firstName} 👋
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(255,255,255,0.92)",
            fontSize: 14,
            lineHeight: 1.7,
            position: "relative",
            zIndex: 1,
          }}
        >
          Manage lectures, students, grading, and software uploads from one place.
        </p>
      </div>

      {/* Add New Software */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e6e8ee",
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        }}
      >
        <div>
          <div
            style={{
              color: "#1e293b",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Add New Software
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Upload new software for students
          </div>
        </div>

        <button
          onClick={handleAddSoftware}
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            border: "none",
            borderRadius: 12,
            padding: "10px 18px",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(249,115,22,0.25)",
          }}
        >
          + Add Software
        </button>
      </div>

    </div>
  );
}

export default LecturerDashboard;