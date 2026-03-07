import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSoftwareRequest } from "../../utils/api";

function UploadSoftware() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    softwareName: "",
    category: "Software",
    type: "other",
    size: "",
    version: "",
    about: "",
    windowsLink: "",
    macLink: "",
    videoEmbed: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await createSoftwareRequest(formData);
      setMessage(data.message || "Software uploaded successfully");

      setFormData({
        title: "",
        softwareName: "",
        category: "Software",
        type: "other",
        size: "",
        version: "",
        about: "",
        windowsLink: "",
        macLink: "",
        videoEmbed: "",
      });

      setTimeout(() => {
        navigate("/software-hub");
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to upload software");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1a1a1a 0%,#1d1308 100%)",
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
          Software Management
        </div>

        <h1
          style={{
            margin: 0,
            color: "#f5f5f5",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          Upload Software
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#777",
            fontSize: 14,
          }}
        >
          Add new software for students to download.
        </p>
      </div>

      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #242424",
          borderRadius: 18,
          padding: "1.5rem",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "12px" }}>
            <input
              style={inputStyle}
              name="title"
              placeholder="Card Title"
              value={formData.title}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="softwareName"
              placeholder="Software Name"
              value={formData.softwareName}
              onChange={handleChange}
            />

            <select
              style={inputStyle}
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="other">Other</option>
              <option value="figma">Figma</option>
              <option value="xd">Adobe XD</option>
              <option value="sketch">Sketch</option>
              <option value="pdf">PDF</option>
            </select>

            <input
              style={inputStyle}
              name="size"
              placeholder="Software Size (example: 2 GB)"
              value={formData.size}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="version"
              placeholder="Latest Version"
              value={formData.version}
              onChange={handleChange}
            />

            <textarea
              style={{ ...inputStyle, resize: "vertical" }}
              rows="4"
              name="about"
              placeholder="About Software"
              value={formData.about}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="windowsLink"
              placeholder="Windows Download Link"
              value={formData.windowsLink}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="macLink"
              placeholder="Mac Download Link"
              value={formData.macLink}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="videoEmbed"
              placeholder="YouTube Tutorial Embed Link"
              value={formData.videoEmbed}
              onChange={handleChange}
            />

            {message ? (
              <div style={{ color: "#22c55e", fontSize: 13 }}>{message}</div>
            ) : null}

            {error ? (
              <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg,#f97316,#d94f0b)",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {loading ? "Uploading..." : "Upload Software"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#111",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#fff",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

export default UploadSoftware;