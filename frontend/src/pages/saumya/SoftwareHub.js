import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSoftwareListRequest } from "../../utils/api";

function SoftwareHub() {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const isStudent = user?.role === "student";

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
    if (isStudent) {
      window.alert("students cannot add software");
      return;
    }

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
              background: "#f4e8fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c026d3",
              fontWeight: 800,
              fontSize: 14,
              border: "1px solid #e9d5ff",
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
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              fontWeight: 800,
              fontSize: 12,
              border: "1px solid #fecaca",
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
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b91c1c",
              fontWeight: 800,
              fontSize: 11,
              border: "1px solid #fecaca",
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
              background: "#eef2f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontWeight: 700,
              fontSize: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            APP
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Orange banner */}
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
          marginBottom: "28px",
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
            💻
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Resource Hub
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
          Software Hub
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
          Discover useful software, tools, and applications for your academic
          work. Download resources easily and keep your learning toolkit ready.
        </p>
      </div>

      {/* Header row */}
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
          <h2
            style={{
              color: "#1e293b",
              fontSize: "24px",
              fontWeight: "800",
              margin: "0 0 4px 0",
            }}
          >
            Available Software
          </h2>

          <div style={{ color: "#64748b", fontSize: "13px" }}>
            Total: {totalGB} GB
          </div>
        </div>

        <button
          onClick={handleAddNew}
          style={{
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            padding: "10px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 24px rgba(249,115,22,0.18)",
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
        <div style={{ color: "#64748b" }}>Loading software...</div>
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
                background: "#ffffff",
                border: "1px solid #e6e8ee",
                borderRadius: "16px",
                padding: "18px",
                position: "relative",
                transition: "0.2s",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
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
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
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
                      color: "#94a3b8",
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
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
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
                          color: "#334155",
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
                  color: "#1e293b",
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
                  color: "#64748b",
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