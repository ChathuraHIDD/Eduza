import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { getSoftwareListRequest } from "../../utils/api";
import { drawEduzaLogo } from "../../utils/pdfBranding";

function SoftwareHub() {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoLoadFailed, setLogoLoadFailed] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [popularityFilter, setPopularityFilter] = useState("recent");
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

  const resolveCategory = (file) => {
    const rawCategory = (file?.category || "").toLowerCase();
    if (["development", "database", "productivity", "communication"].includes(rawCategory)) {
      return rawCategory;
    }

    const source = `${file?.title || ""} ${file?.softwareName || ""} ${file?.type || ""}`.toLowerCase();
    if (/(mysql|mongodb|postgres|sqlite|database|db|workbench|compass)/.test(source)) return "database";
    if (/(slack|zoom|teams|discord|meet|communication|chat)/.test(source)) return "communication";
    if (/(notion|figma|chrome|browser|pdf|office|trello|jira|productivity)/.test(source)) return "productivity";
    return "development";
  };

  const resolveLicenseType = (file) => {
    const source = `${file?.type || ""} ${file?.about || ""} ${file?.category || ""} ${file?.title || ""}`.toLowerCase();
    if (/(open source|opensource|oss|gpl|mit|apache)/.test(source)) return "open-source";
    if (/(paid|premium|licensed|subscription|enterprise)/.test(source)) return "paid";
    return "free";
  };

  const getDownloadScore = (file) => {
    if (typeof file?.downloadCount === "number") return file.downloadCount;
    if (typeof file?.downloads === "number") return file.downloads;
    return 0;
  };

  const filteredFiles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const searched = files.filter((file) => {
      const isKeywordMatch = !keyword || [
        file.title,
        file.softwareName,
        file.category,
        file.type,
        file.size,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      const category = resolveCategory(file);
      const isCategoryMatch = categoryFilter === "all" || category === categoryFilter;

      const license = resolveLicenseType(file);
      const isLicenseMatch = licenseFilter === "all" || license === licenseFilter;

      return isKeywordMatch && isCategoryMatch && isLicenseMatch;
    });

    const sorted = [...searched].sort((a, b) => {
      if (popularityFilter === "most-downloaded") {
        const scoreDiff = getDownloadScore(b) - getDownloadScore(a);
        if (scoreDiff !== 0) return scoreDiff;
      }

      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sorted;
  }, [files, searchTerm, categoryFilter, licenseFilter, popularityFilter]);

  const totalGB = filteredFiles
    .reduce((sum, file) => sum + parseSizeToGB(file.size), 0)
    .toFixed(2);

  const resolveBrandAsset = (file) => {
    const source = `${file?.title || ""} ${file?.softwareName || ""} ${file?.type || ""}`.toLowerCase();
    const catalog = [
      { key: "android", logo: "https://cdn.simpleicons.org/androidstudio/3DDC84", bg: "#eaf9f0" },
      { key: "intellij", logo: "https://cdn.simpleicons.org/intellijidea/000000", bg: "#f2f4ff" },
      { key: "notion", logo: "https://cdn.simpleicons.org/notion/111111", bg: "#f5f5f5" },
      { key: "zoom", logo: "https://cdn.simpleicons.org/zoom/0B5CFF", bg: "#eef4ff" },
      { key: "slack", logo: "https://cdn.simpleicons.org/slack/4A154B", bg: "#f8f1ff" },
      { key: "mysql", logo: "https://cdn.simpleicons.org/mysql/4479A1", bg: "#edf5fb" },
      { key: "mongodb", logo: "https://cdn.simpleicons.org/mongodb/47A248", bg: "#ecf8f0" },
      { key: "docker", logo: "https://cdn.simpleicons.org/docker/2496ED", bg: "#edf5ff" },
      { key: "chrome", logo: "https://cdn.simpleicons.org/googlechrome/4285F4", bg: "#f1f8ff" },
      { key: "figma", logo: "https://cdn.simpleicons.org/figma/F24E1E", bg: "#fff0ed" },
      { key: "obs", logo: "https://cdn.simpleicons.org/obsstudio/302E31", bg: "#f2f3f5" },
      { key: "vscode", logo: "https://cdn.simpleicons.org/visualstudiocode/007ACC", bg: "#edf5ff" },
      { key: "postman", logo: "https://cdn.simpleicons.org/postman/FF6C37", bg: "#fff3ee" },
      { key: "node", logo: "https://cdn.simpleicons.org/nodedotjs/339933", bg: "#edf8ef" },
      { key: "github", logo: "https://cdn.simpleicons.org/github/181717", bg: "#f2f4f7" },
      { key: "git", logo: "https://cdn.simpleicons.org/git/F05032", bg: "#fff1ed" },
      { key: "sketch", logo: "https://cdn.simpleicons.org/sketch/F7B500", bg: "#fff8e6" },
      { key: "adobe xd", logo: "https://cdn.simpleicons.org/adobexd/FF61F6", bg: "#fff1fd" },
      { key: "wamp", logo: "https://cdn.simpleicons.org/apache/E22F2F", bg: "#fff1f1" },
    ];

    return catalog.find((item) => source.includes(item.key));
  };

  const handleDownloadSoftwareListPdf = async () => {
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

    const drawHeader = async () => {
      doc.setDrawColor(194, 65, 12);
      doc.setLineWidth(1.6);
      doc.rect(border, border, pageWidth - border * 2, pageHeight - border * 2);

      doc.setFillColor(194, 65, 12);
      doc.rect(border + 8, border + 8, pageWidth - (border + 8) * 2, 64, "F");

      doc.setTextColor(255, 255, 255);
      const hasLogo = await drawEduzaLogo(doc, border + 16, border + 16, 66, 44);
      if (!hasLogo) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("EDUZA", border + 18, border + 48);
      }

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

    const ensureSpace = async (needed) => {
      if (y + needed <= pageHeight - 48) return;
      doc.addPage();
      await drawHeader();
    };

    await drawHeader();

    for (let index = 0; index < rows.length; index += 1) {
      const file = rows[index];
      const title = file.title || "Untitled";
      const softwareName = file.softwareName || "N/A";
      const type = file.type || "N/A";
      const size = file.size || "N/A";

      const titleLines = doc.splitTextToSize(`${index + 1}. ${title}`, contentWidth);
      const detailLine = `Name: ${softwareName} | Type: ${type.toUpperCase()} | Size: ${size}`;
      const detailLines = doc.splitTextToSize(detailLine, contentWidth - 8);
      const blockHeight = titleLines.length * 14 + detailLines.length * 13 + 14;

      await ensureSpace(blockHeight);

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
    }

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

  const renderSoftwareLogo = (file) => {
    const brand = resolveBrandAsset(file);
    const softwareName = file.softwareName || file.title || "Software";
    const logoKey = file._id || softwareName;
    const initials = softwareName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: brand?.bg || "#eef2f7",
          border: "1px solid #dfe6f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
        }}
      >
        {brand?.logo && !logoLoadFailed[logoKey] ? (
          <img
            src={brand.logo}
            alt={`${softwareName} logo`}
            width="30"
            height="30"
            style={{ objectFit: "contain" }}
            onError={() => {
              setLogoLoadFailed((prev) => ({ ...prev, [logoKey]: true }));
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#5b6678",
              letterSpacing: "0.04em",
            }}
          >
            {initials || "APP"}
          </span>
        )}
      </div>
    );
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
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          background: "#f8fbff",
          border: "1px solid #e6edf7",
          borderRadius: 18,
          padding: "18px",
        }}
      >
        <div style={{ flex: "1 1 260px", minWidth: 240, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              color: "#7c879a",
              lineHeight: 1.5,
              maxWidth: 260,
            }}
          >
            Search and filter resources to quickly find the software you need.
          </p>
        </div>

        <div style={{ flex: "1.4 1 420px", minWidth: 280 }}>
          {!isStudent && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
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
          )}

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search software"
            style={{
              border: "1px solid #fed7aa",
              borderRadius: 10,
              padding: "8px 10px",
              width: "100%",
              background: "#fff",
              color: "#334155",
              fontSize: 13,
              outline: "none",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              marginTop: 10,
            }}
          >
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "8px 10px",
                background: "#fff",
                color: "#334155",
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="all">Category: All</option>
              <option value="development">Category: Development</option>
              <option value="database">Category: Database</option>
              <option value="productivity">Category: Productivity</option>
              <option value="communication">Category: Communication</option>
            </select>

            <select
              value={licenseFilter}
              onChange={(event) => setLicenseFilter(event.target.value)}
              style={{
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "8px 10px",
                background: "#fff",
                color: "#334155",
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="all">Type: All</option>
              <option value="free">Type: Free</option>
              <option value="paid">Type: Paid</option>
              <option value="open-source">Type: Open Source</option>
            </select>

            <select
              value={popularityFilter}
              onChange={(event) => setPopularityFilter(event.target.value)}
              style={{
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "8px 10px",
                background: "#fff",
                color: "#334155",
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="most-downloaded">Popularity: Most Downloaded</option>
              <option value="recent">Popularity: Recent</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#64748b" }}>Loading software...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "22px",
          }}
        >
          {filteredFiles.map((file, i) => (
            <div
              className="software-hub-card"
              key={file._id}
              onClick={() => handleOpenSoftware(file)}
              style={{
                background: "#ffffff",
                border: "1px solid #fdba74",
                borderRadius: "18px",
                padding: "22px 16px 14px",
                position: "relative",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  marginBottom: "4px",
                }}
              >
                <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)" }}>
                  {renderSoftwareLogo(file)}
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
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "3px",
                  textAlign: "center",
                  marginTop: "8px",
                }}
              >
                {file.title}
              </div>

              <div
                style={{
                  color: "#7b8599",
                  fontSize: "12px",
                  fontWeight: "500",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                {file.softwareName}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#7c879a",
                  borderTop: "1px solid #edf1f7",
                  paddingTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{file.size} used</span>
                <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{file.type || "app"}</span>
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