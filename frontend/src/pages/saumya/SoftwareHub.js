import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSoftwareListRequest } from "../../utils/api";

function SoftwareHub() {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const data = await getSoftwareListRequest();
        setFiles(data || []);
      } catch (error) {
        console.error("Failed to fetch software:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoftware();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const parseSizeToGB = (size) => {
    if (!size) return 0;
    const [value, unit] = size.split(" ");
    const numericValue = Number(value);

    if (unit === "GB") return numericValue;
    if (unit === "MB") return numericValue / 1024;
    return 0;
  };

  const totalGB = files
    .reduce((sum, file) => sum + parseSizeToGB(file.size), 0)
    .toFixed(2);

  const handleDownload = (file) => {
    setOpenMenuIndex(null);

    const link = file.windowsLink || file.macLink;
    if (link) {
      window.open(link, "_blank");
    } else {
      alert("No download link available");
    }
  };

  const handleOpenSoftware = (file) => {
    navigate(`/software/${file._id}`);
  };

  const handleAddNew = () => {
    navigate("/upload-software");
  };

  const renderIcon = (type) => {
    switch (type) {
      case "figma":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg"
            alt="Figma"
            width="28"
            height="28"
          />
        );

      case "xd":
        return (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "#470137",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff61f6",
              fontWeight: 800,
              fontSize: 14,
              border: "1px solid #8b2b7f",
            }}
          >
            Xd
          </div>
        );

      case "pdf":
        return (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "#5a1010",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff6b6b",
              fontWeight: 800,
              fontSize: 12,
              border: "1px solid #a63434",
            }}
          >
            PDF
          </div>
        );

      case "sketch":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg"
            alt="Sketch"
            width="28"
            height="28"
          />
        );

      case "vscode":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
            alt="VS Code"
            width="28"
            height="28"
          />
        );

      case "postman":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg"
            alt="Postman"
            width="28"
            height="28"
          />
        );

      case "docker":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
            alt="Docker"
            width="28"
            height="28"
          />
        );

      case "node":
      case "nodejs":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
            alt="Node.js"
            width="28"
            height="28"
          />
        );

      case "mongodb":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
            alt="MongoDB"
            width="28"
            height="28"
          />
        );

      case "mysql":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
            alt="MySQL"
            width="28"
            height="28"
          />
        );

      case "github":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="GitHub"
            width="28"
            height="28"
          />
        );

      case "git":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
            alt="Git"
            width="28"
            height="28"
          />
        );

      case "chrome":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg"
            alt="Chrome"
            width="28"
            height="28"
          />
        );

      case "android":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg"
            alt="Android"
            width="28"
            height="28"
          />
        );

      case "slack":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg"
            alt="Slack"
            width="28"
            height="28"
          />
        );

      case "notion":
        return (
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg"
            alt="Notion"
            width="28"
            height="28"
          />
        );

      case "wampserver":
        return (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "#7a2020",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 11,
              border: "1px solid #a83b3b",
            }}
          >
            W
          </div>
        );

      default:
        return (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "#2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            APP
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              color: "#f5f5f5",
              fontSize: "28px",
              fontWeight: "800",
              marginBottom: "4px",
            }}
          >
            Software Hub
          </h1>

          <div style={{ color: "#666", fontSize: "13px" }}>
            Total: {totalGB} GB
          </div>
        </div>

        <button
          onClick={handleAddNew}
          style={{
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #7c8cff, #6678f0)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            padding: "10px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 24px rgba(102,120,240,0.28)",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            +
          </span>
          Add New
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#aaa" }}>Loading software...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "18px",
          }}
        >
          {files.map((file, i) => (
            <div
              key={file._id}
              onClick={() => handleOpenSoftware(file)}
              style={{
                background: "#1a1a1a",
                border: "1px solid #242424",
                borderRadius: "16px",
                padding: "18px",
                position: "relative",
                transition: "0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderIcon(file.type)}
                </div>

                <div
                  ref={openMenuIndex === i ? menuRef : null}
                  style={{ position: "relative" }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuIndex(openMenuIndex === i ? null : i);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: "#777",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
                    </svg>
                  </button>

                  {openMenuIndex === i && (
                    <div
                      style={{
                        position: "absolute",
                        top: "36px",
                        right: 0,
                        minWidth: "130px",
                        background: "#141414",
                        border: "1px solid #2a2a2a",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                        zIndex: 20,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          color: "#f0f0f0",
                          padding: "12px 14px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  color: "#f5f5f5",
                  fontSize: "15px",
                  fontWeight: "700",
                  marginBottom: "6px",
                }}
              >
                {file.title}
              </div>

              <div
                style={{
                  color: "#f97316",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                {file.softwareName}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                }}
              >
                {file.size} used
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SoftwareHub;