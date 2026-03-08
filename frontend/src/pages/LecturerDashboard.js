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
          background: "linear-gradient(135deg, #1a1a1a 0%, #1d1308 100%)",
          border: "1px solid #2a2010",
          borderRadius: 18,
          padding: "1.75rem 2rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#f97316",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Lecturer Dashboard
        </div>

        <h1
          style={{
            margin: 0,
            color: "#f5f5f5",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          Welcome back, {firstName} 👋
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#777",
            fontSize: 14,
          }}
        >
          Manage lectures, students, grading, and software uploads from one place.
        </p>
      </div>

      {/* Add New Software */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #242424",
          borderRadius: 14,
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              color: "#f5f5f5",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Add New Software
          </div>

          <div
            style={{
              color: "#666",
              fontSize: 13,
            }}
          >
            Upload new software for students
          </div>
        </div>

        <button
          onClick={handleAddSoftware}
          style={{
            background: "linear-gradient(135deg, #f97316, #d94f0b)",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Software
        </button>
      </div>

    </div>
  );
}

export default LecturerDashboard;