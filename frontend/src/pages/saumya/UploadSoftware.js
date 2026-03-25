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
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
          borderRadius: 24,
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          minHeight: "165px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "24px",
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
            ⬆
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Software Management
          </span>
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
          Upload Software
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(255,255,255,0.92)",
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: "760px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Add new software for students to download.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e6e8ee",
          borderRadius: 18,
          padding: "1.5rem",
          boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
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
              <div style={{ color: "#16a34a", fontSize: 13 }}>{message}</div>
            ) : null}

            {error ? (
              <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(249,115,22,0.18)",
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
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#1e293b",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

export default UploadSoftware;