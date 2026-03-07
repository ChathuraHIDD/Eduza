import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSoftwareByIdRequest } from "../../utils/api";

function SoftwareDetails() {
  const { slug } = useParams();
  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSoftwareByIdRequest(slug);
        setSoftware(data);
      } catch (err) {
        setError(err.message || "Failed to load software details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSoftware();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  if (error || !software) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", color: "#fff" }}>
        Software not found.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #1e1408 100%)",
          border: "1px solid #2a2010",
          borderRadius: 20,
          padding: "28px",
          marginBottom: "20px",
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
          Software Details
        </div>

        <h1
          style={{
            margin: 0,
            color: "#f5f5f5",
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          {software.softwareName}
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#8f8f8f",
            fontSize: 14,
          }}
        >
          {software.category || "Software"}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Card Title", value: software.title },
          { label: "Latest Version", value: software.version },
          { label: "Storage Required", value: software.size },
          { label: "Type", value: software.type || "other" },
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
            <div style={{ fontSize: 12, color: "#777", marginBottom: 10 }}>
              {item.label}
            </div>
            <div style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "20px",
        }}
      >
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

          {software.videoEmbed ? (
            <div style={{ marginTop: "20px" }}>
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
                  title={`${software.softwareName} tutorial video`}
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
          ) : null}
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
                {software.windowsLink || "Not available"}
              </div>

              {software.windowsLink ? (
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
              ) : null}
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
                {software.macLink || "Not available"}
              </div>

              {software.macLink ? (
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoftwareDetails;