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

        if (!data || !data._id) {
          throw new Error("Software data not returned from backend");
        }

        setSoftware(data);
      } catch (err) {
        console.error("SoftwareDetails fetch error:", err);
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
      <div style={{ maxWidth: 1100, margin: "0 auto", color: "#334155" }}>
        Loading...
      </div>
    );
  }

  if (error || !software) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", color: "#334155" }}>
        <h2 style={{ color: "#1e293b" }}>Software not found.</h2>
        <p style={{ color: "#64748b" }}>{error}</p>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Requested id: {slug}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
            Software Details
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
          {software.softwareName}
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
              background: "#ffffff",
              border: "1px solid #e6e8ee",
              borderRadius: 16,
              padding: "18px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              {item.label}
            </div>
            <div style={{ color: "#1e293b", fontSize: 18, fontWeight: 700 }}>
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
            background: "#ffffff",
            border: "1px solid #e6e8ee",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          }}
        >
          <h2
            style={{
              color: "#1e293b",
              fontSize: 20,
              margin: "0 0 12px 0",
            }}
          >
            About Software
          </h2>

          <p
            style={{
              color: "#64748b",
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
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
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
            background: "#ffffff",
            border: "1px solid #e6e8ee",
            borderRadius: 16,
            padding: "20px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          }}
        >
          <h2
            style={{
              color: "#1e293b",
              fontSize: 20,
              margin: "0 0 14px 0",
            }}
          >
            Download
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
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
                  color: "#64748b",
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
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    padding: "11px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: "0 8px 20px rgba(249,115,22,0.18)",
                  }}
                >
                  Download for Windows
                </a>
              ) : null}
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
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
                  color: "#64748b",
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
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    padding: "11px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: "0 8px 20px rgba(249,115,22,0.18)",
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