import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { getSoftwareListRequest } from "../../utils/api";

function SoftwareHub() {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredFiles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return files;

    return files.filter((file) => {
      return [
        file.title,
        file.softwareName,
        file.type,
        file.size,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [files, searchTerm]);

  const totalGB = filteredFiles
    .reduce((sum, file) => sum + parseSizeToGB(file.size), 0)
    .toFixed(2);

  const handleDownloadSoftwareListPdf = () => {
    const rows = filteredFiles;
    if (rows.length === 0) {
      window.alert("No software records available to export.");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const border = 24;
    const contentX = 44;
    const contentWidth = pageWidth - contentX * 2;
    let y = 132;

    const drawHeader = () => {
      doc.setDrawColor(194, 65, 12);
      doc.setLineWidth(1.6);
      doc.rect(border, border, pageWidth - border * 2, pageHeight - border * 2);

      doc.setFillColor(194, 65, 12);
      doc.rect(border + 8, border + 8, pageWidth - (border + 8) * 2, 64, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("EDUZA", border + 18, border + 48);

      doc.setFontSize(12);
      doc.text("Software Hub List", pageWidth - border - 18, border + 48, {
        align: "right",
      });

      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, contentX, 114);
      doc.text(`Items: ${rows.length} | Total: ${totalGB} GB`, contentX, 128);
      y = 156;
    };

    const ensureSpace = (needed) => {
      if (y + needed <= pageHeight - 48) return;
      doc.addPage();
      drawHeader();
    };

    drawHeader();

    rows.forEach((file, index) => {
      const title = file.title || "Untitled";
      const softwareName = file.softwareName || "N/A";
      const type = file.type || "N/A";
      const size = file.size || "N/A";

      const titleLines = doc.splitTextToSize(`${index + 1}. ${title}`, contentWidth);
      const detailLine = `Name: ${softwareName} | Type: ${type.toUpperCase()} | Size: ${size}`;
      const detailLines = doc.splitTextToSize(detailLine, contentWidth - 8);
      const blockHeight = titleLines.length * 14 + detailLines.length * 13 + 14;

      ensureSpace(blockHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(124, 45, 18);
      doc.text(titleLines, contentX, y);
      y += titleLines.length * 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(detailLines, contentX + 6, y + 2);
      y += detailLines.length * 13 + 10;
    });

    doc.save("eduza-software-list.pdf");
  };

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

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search software"
            style={{
              marginTop: "10px",
              border: "1px solid #fed7aa",
              borderRadius: 10,
              padding: "8px 10px",
              minWidth: 220,
              background: "#fff",
              color: "#334155",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadSoftwareListPdf}
            style={{
              border: "none",
              borderRadius: 999,
              background: "linear-gradient(135deg, #9a3412, #c2410c)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              padding: "10px 16px",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(194,65,12,0.2)",
            }}
          >
            Download List PDF
          </button>

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
          {filteredFiles.map((file, i) => (
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

          {filteredFiles.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#fff",
                border: "1px solid #e6e8ee",
                borderRadius: "14px",
                padding: "16px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              No software found for this search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SoftwareHub;