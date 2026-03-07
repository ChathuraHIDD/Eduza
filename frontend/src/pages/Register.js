import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, setAuthData } from "../utils/api";

// login/register
export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const data = await registerRequest(payload);
      setAuthData(data);

      if (data.user.role === "lecturer") {
        navigate("/lecturer");
      } else if (data.user.role === "coordinator") {
        navigate("/coordinator");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.leftPanel}>
          <div style={styles.logoBox}>E</div>
          <h1 style={styles.title}>Create Your EDUZA Account</h1>
          <p style={styles.subtitle}>
            Join the platform and manage learning, schedules, support, and academic progress smarter.
          </p>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Register</h2>
            <p style={styles.formSubtitle}>Create an account to continue</p>

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  style={styles.input}
                />
              </div>

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
                  placeholder="Enter password"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>

              {error ? <p style={styles.error}>{error}</p> : null}

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p style={styles.footerText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>
                Login
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
    fontSize: "52px",
    fontWeight: "800",
    margin: "0 0 18px 0",
    lineHeight: "1.08",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.78)",
    maxWidth: "520px",
    lineHeight: "1.7",
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
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
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