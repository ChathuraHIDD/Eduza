import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, setAuthData } from "../utils/api";

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
        navigate("/");
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
          <div style={styles.logoBox}>E</div>
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
    background:
      "linear-gradient(135deg, #070707 0%, #111111 50%, #1a120a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    color: "#ffffff",
  },
  overlay: {
    width: "100%",
    maxWidth: "1200px",
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  leftPanel: {
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, rgba(255,122,24,0.16) 0%, rgba(255,122,24,0.03) 100%)",
  },
  logoBox: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #ff7a18, #ff5e00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "30px",
  },
  title: {
    fontSize: "56px",
    fontWeight: "800",
    margin: "0 0 18px 0",
    lineHeight: "1.05",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.78)",
    maxWidth: "520px",
    lineHeight: "1.7",
    marginBottom: "36px",
  },
  infoCard: {
    padding: "24px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    maxWidth: "420px",
  },
  infoTitle: {
    margin: "0 0 12px 0",
    fontSize: "20px",
    color: "#ff8c3a",
  },
  infoText: {
    margin: 0,
    color: "rgba(255,255,255,0.74)",
    lineHeight: "1.6",
  },
  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  formTitle: {
    margin: "0 0 8px 0",
    fontSize: "34px",
    fontWeight: "800",
  },
  formSubtitle: {
    margin: "0 0 28px 0",
    color: "rgba(255,255,255,0.7)",
  },
  inputGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#f3f3f3",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #ff7a18, #ff4d00)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 10px 20px rgba(255,122,24,0.22)",
  },
  error: {
    color: "#ff7b7b",
    marginBottom: "10px",
  },
  footerText: {
    marginTop: "20px",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  link: {
    color: "#ff8c3a",
    textDecoration: "none",
    fontWeight: "700",
  },
};