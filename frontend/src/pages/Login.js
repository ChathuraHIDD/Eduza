import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, setAuthData } from "../utils/api";
import BrandLogo from "../components/BrandLogo";

// login/register
export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(formData);
      setAuthData(data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "lecturer") {
        navigate("/lecturer");
      } else if (data.user.role === "coordinator") {
        navigate("/coordinator");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.leftPanel}>
          <div style={styles.leftCircleTop} />
          <div style={styles.leftCircleBottom} />

          <BrandLogo
            width={260}
            height={128}
            rounded={18}
            bg="rgba(255,255,255,0.12)"
            padding={8}
            scale={1.25}
            imageStyle={{ objectFit: "cover" }}
            style={{
              marginBottom: 34,
              position: "relative",
              zIndex: 1,
              alignSelf: "center",
            }}
          />
          <h1 style={styles.title}>Welcome to EDUZA</h1>
          <p style={styles.subtitle}>
            Smart academic support for students, lecturers, admins, and coordinators.
          </p>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Why EDUZA?</h3>
            <p style={styles.infoText}>
              Manage schedules, stress support, study plans, and academic progress in one place.
            </p>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Sign In</h2>
            <p style={styles.formSubtitle}>Login to continue to your dashboard</p>

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                />
              </div>

              {error ? <p style={styles.error}>{error}</p> : null}

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p style={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3f4f8 0%, #eef0f5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    color: "#1e293b",
  },

  overlay: {
    width: "100%",
    maxWidth: "1200px",
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  },

  leftPanel: {
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)",
    position: "relative",
    overflow: "hidden",
  },

  leftCircleTop: {
    position: "absolute",
    top: -50,
    right: -50,
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.10)",
  },

  leftCircleBottom: {
    position: "absolute",
    bottom: -70,
    right: 100,
    width: "170px",
    height: "170px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
  },

  logoBox: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#fff",
    position: "relative",
    zIndex: 1,
  },

  title: {
    fontSize: "56px",
    fontWeight: "800",
    margin: "0 0 18px 0",
    lineHeight: "1.05",
    color: "#ffffff",
    position: "relative",
    zIndex: 1,
  },

  subtitle: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "520px",
    lineHeight: "1.7",
    marginBottom: "36px",
    position: "relative",
    zIndex: 1,
  },

  infoCard: {
    padding: "24px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.16)",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(4px)",
  },

  infoTitle: {
    margin: "0 0 12px 0",
    fontSize: "20px",
    color: "#ffffff",
  },

  infoText: {
    margin: 0,
    color: "rgba(255,255,255,0.88)",
    lineHeight: "1.6",
  },

  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#ffffff",
  },

  formCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  formTitle: {
    margin: "0 0 8px 0",
    fontSize: "34px",
    fontWeight: "800",
    color: "#1e293b",
  },

  formSubtitle: {
    margin: "0 0 28px 0",
    color: "#64748b",
  },

  inputGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #e6e8ee",
    background: "#f8fafc",
    color: "#1e293b",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 10px 20px rgba(249,115,22,0.18)",
  },

  error: {
    color: "#ef4444",
    marginBottom: "10px",
  },

  footerText: {
    marginTop: "20px",
    color: "#64748b",
    textAlign: "center",
  },

  link: {
    color: "#f97316",
    textDecoration: "none",
    fontWeight: "700",
  },
};