import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SoftwareHub() {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);

  const files = [
    {
      name: "AppSchool",
      software: "Figma",
      size: "2 GB",
      type: "figma",
      slug: "figma",
    },
    {
      name: "BC company",
      software: "Sketch",
      size: "2 GB",
      type: "sketch",
      slug: "sketch",
    },
    {
      name: "UI Kit",
      software: "Adobe XD",
      size: "15 MB",
      type: "xd",
      slug: "adobe-xd",
    },
    {
      name: "Company ANV",
      software: "Figma",
      size: "2 GB",
      type: "figma",
      slug: "figma",
    },
    {
      name: "Company ABC",
      software: "Sketch",
      size: "6 MB",
      type: "sketch",
      slug: "sketch",
    },
    {
      name: "My CV",
      software: "PDF",
      size: "2 GB",
      type: "pdf",
      slug: "pdf-reader",
    },
  ];

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
    alert(`Downloading ${file.name} (${file.software})`);
  };

  const handleOpenSoftware = (file) => {
    navigate(`/software/${file.slug}`);
  };

  const renderIcon = (type) => {
    switch (type) {
      case "figma":
        return (
          <svg width="26" height="26" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
          </svg>
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
          <svg width="28" height="28" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.112 7h73.776L121 31.696 64 121 7 31.696 27.112 7z" fill="#FDB300"/>
            <path d="M27.112 7L7 31.696h38.64L27.112 7z" fill="#EA6C00"/>
            <path d="M100.888 7L121 31.696H82.36L100.888 7z" fill="#EA6C00"/>
            <path d="M45.64 31.696L64 121 7 31.696h38.64z" fill="#FDAD00"/>
            <path d="M82.36 31.696L64 121l57-89.304H82.36z" fill="#FDAD00"/>
            <path d="M45.64 31.696h36.72L64 121 45.64 31.696z" fill="#FDD231"/>
            <path d="M64 7L45.64 31.696h36.72L64 7z" fill="#FEEEB7"/>
          </svg>
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
      <div style={{ marginBottom: "2rem" }}>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "18px",
        }}
      >
        {files.map((file, i) => (
          <div
            key={i}
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

              <div ref={openMenuIndex === i ? menuRef : null} style={{ position: "relative" }}>
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
              {file.name}
            </div>

            <div
              style={{
                color: "#f97316",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              {file.software}
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
    </div>
  );
}

export default SoftwareHub;