import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function SoftwareDetails() {
  const { slug } = useParams();

  const softwareData = {
    figma: {
      name: "Figma",
      category: "UI/UX Design Tool",
      about:
        "Figma is a collaborative interface design platform used for wireframing, prototyping, design systems, and team-based product design workflows.",
      version: "124.5.8",
      developer: "Figma, Inc.",
      storageRequired: "2 GB free space",
      ramRequired: "4 GB RAM minimum",
      supportedOS: ["Windows", "macOS"],
      windowsLink: "https://www.figma.com/downloads/",
      macLink: "https://www.figma.com/downloads/",
      videoEmbed: "https://www.youtube.com/embed/FTFaQWZBqQ8",
      accent: "#f97316",
    },
    sketch: {
      name: "Sketch",
      category: "Vector Design Tool",
      about:
        "Sketch is a vector-based design app focused on interface design, prototyping, and digital product workflows, especially for macOS users.",
      version: "100.2",
      developer: "Sketch B.V.",
      storageRequired: "1.5 GB free space",
      ramRequired: "4 GB RAM minimum",
      supportedOS: ["macOS"],
      windowsLink: "Not available for Windows",
      macLink: "https://www.sketch.com/download/",
      videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      accent: "#f97316",
    },
    "adobe-xd": {
      name: "Adobe XD",
      category: "Prototyping Tool",
      about:
        "Adobe XD is used for designing websites, mobile apps, user flows, and prototypes with interactive design and collaboration features.",
      version: "57.1.12",
      developer: "Adobe",
      storageRequired: "3 GB free space",
      ramRequired: "8 GB RAM recommended",
      supportedOS: ["Windows", "macOS"],
      windowsLink: "https://creativecloud.adobe.com/apps/download/xd",
      macLink: "https://creativecloud.adobe.com/apps/download/xd",
      videoEmbed: "https://www.youtube.com/embed/68w2VwalD5w",
      accent: "#f97316",
    },
    "pdf-reader": {
      name: "PDF Reader",
      category: "Document Tool",
      about:
        "A PDF Reader allows you to open, read, highlight, annotate, and manage PDF documents for study, reports, and professional work.",
      version: "2025.1",
      developer: "Adobe",
      storageRequired: "800 MB free space",
      ramRequired: "2 GB RAM minimum",
      supportedOS: ["Windows", "macOS"],
      windowsLink: "https://get.adobe.com/reader/",
      macLink: "https://get.adobe.com/reader/",
      videoEmbed: "https://www.youtube.com/embed/0O2aH4XLbto",
      accent: "#f97316",
    },
  };

  const software = softwareData[slug];

  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Saumya",
      text: "Very useful software for design work and team collaboration.",
      date: "Today",
    },
    {
      id: 2,
      name: "John",
      text: "Installation was easy and the video helped a lot.",
      date: "Today",
    },
  ]);

  const [commentForm, setCommentForm] = useState({
    name: "",
    text: "",
  });

  const initials = useMemo(() => {
    if (!software?.name) return "SW";
    return software.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [software]);

  const handleChange = (e) => {
    setCommentForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddComment = (e) => {
    e.preventDefault();

    if (!commentForm.name.trim() || !commentForm.text.trim()) {
      return;
    }

    const newComment = {
      id: Date.now(),
      name: commentForm.name.trim(),
      text: commentForm.text.trim(),
      date: "Just now",
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentForm({
      name: "",
      text: "",
    });
  };

  if (!software) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", color: "#fff" }}>
        Software not found.
      </div>
    );
  }

  const isWindowsAvailable = software.windowsLink.startsWith("http");
  const isMacAvailable = software.macLink.startsWith("http");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #1e1408 100%)",
          border: "1px solid #2a2010",
          borderRadius: 20,
          padding: "28px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "84px 1fr",
          gap: "18px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 20,
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f97316",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          {initials}
        </div>

        <div>
          <div
            style={{
              color: "#f97316",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Software Details
          </div>

          <h1
            style={{
              margin: "0 0 8px 0",
              color: "#f5f5f5",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            {software.name}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8f8f8f",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {software.category} • Developed by {software.developer}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Latest Version", value: software.version },
          { label: "Storage Required", value: software.storageRequired },
          { label: "RAM Required", value: software.ramRequired },
          { label: "Supported OS", value: software.supportedOS.join(", ") },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 16,
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 10,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                color: "#f5f5f5",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 16,
              padding: "24px",
            }}
          >
            <h2
              style={{
                color: "#f5f5f5",
                fontSize: 20,
                margin: "0 0 12px 0",
              }}
            >
              About Software
            </h2>

            <p
              style={{
                color: "#9a9a9a",
                lineHeight: 1.8,
                fontSize: 14,
                margin: 0,
              }}
            >
              {software.about}
            </p>
          </div>

          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <div
              style={{
                color: "#f97316",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              How to Download Video
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%",
                borderRadius: 14,
                overflow: "hidden",
                background: "#111",
              }}
            >
              <iframe
                src={software.videoEmbed}
                title={`${software.name} tutorial video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <h2
              style={{
                color: "#f5f5f5",
                fontSize: 20,
                margin: "0 0 14px 0",
              }}
            >
              Download
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "#161616",
                  border: "1px solid #252525",
                  borderRadius: 14,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    color: "#f97316",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Windows
                </div>

                <div
                  style={{
                    color: "#8d8d8d",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 14,
                    wordBreak: "break-word",
                  }}
                >
                  {software.windowsLink}
                </div>

                {isWindowsAvailable ? (
                  <a
                    href={software.windowsLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      background: "linear-gradient(135deg, #f97316, #c2410c)",
                      color: "#fff",
                      padding: "11px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Download for Windows
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      background: "#2a2a2a",
                      color: "#666",
                      border: "none",
                      padding: "11px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "not-allowed",
                    }}
                  >
                    Not Available
                  </button>
                )}
              </div>

              <div
                style={{
                  background: "#161616",
                  border: "1px solid #252525",
                  borderRadius: 14,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    color: "#f97316",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Mac
                </div>

                <div
                  style={{
                    color: "#8d8d8d",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 14,
                    wordBreak: "break-word",
                  }}
                >
                  {software.macLink}
                </div>

                {isMacAvailable ? (
                  <a
                    href={software.macLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      background: "linear-gradient(135deg, #f97316, #c2410c)",
                      color: "#fff",
                      padding: "11px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Download for Mac
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      background: "#2a2a2a",
                      color: "#666",
                      border: "none",
                      padding: "11px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "not-allowed",
                    }}
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <h2
              style={{
                color: "#f5f5f5",
                fontSize: 20,
                margin: "0 0 14px 0",
              }}
            >
              System Requirements
            </h2>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#9a9a9a",
                lineHeight: 1.9,
                fontSize: 14,
              }}
            >
              <li>Storage required: {software.storageRequired}</li>
              <li>Memory required: {software.ramRequired}</li>
              <li>Supported operating systems: {software.supportedOS.join(", ")}</li>
              <li>Stable internet connection recommended for downloading</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comment section */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #242424",
          borderRadius: 16,
          padding: "24px",
        }}
      >
        <h2
          style={{
            color: "#f5f5f5",
            fontSize: 22,
            margin: "0 0 18px 0",
          }}
        >
          Comments
        </h2>

        <form onSubmit={handleAddComment} style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr auto",
              gap: "12px",
              alignItems: "start",
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={commentForm.name}
              onChange={handleChange}
              style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: "12px 14px",
                color: "#f5f5f5",
                outline: "none",
              }}
            />

            <textarea
              name="text"
              placeholder="Write your comment..."
              value={commentForm.text}
              onChange={handleChange}
              rows={3}
              style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: "12px 14px",
                color: "#f5f5f5",
                outline: "none",
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #f97316, #c2410c)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Post
            </button>
          </div>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "#161616",
                border: "1px solid #252525",
                borderRadius: 14,
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ color: "#f5f5f5", fontWeight: 700 }}>
                  {comment.name}
                </div>
                <div style={{ color: "#666", fontSize: 12 }}>
                  {comment.date}
                </div>
              </div>

              <div
                style={{
                  color: "#9a9a9a",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {comment.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SoftwareDetails;