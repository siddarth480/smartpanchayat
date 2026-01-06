// src/pages/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) return setError("Please enter a valid email.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 480px) {
        /* 1. Move the entire content to the top of the screen */
        .login-page-container {
          align-items: flex-start !important; 
          padding-top: 20px !important; 
        }

        .login-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          backdrop-filter: none !important;
          padding: 0 20px !important; /* Removed top/bottom padding to save space */
          margin-top: 80px !important;
        }

        /* 2. Compress the header spacing */
        .login-header {
          margin-bottom: 24px !important;
        }

        .login-icon-circle {
          width: 50px !important;
          height: 50px !important;
          margin-bottom: 12px !important;
        }

        .login-title {
          font-size: 1.6rem !important;
          margin-bottom: 4px !important;
        }

        /* 3. Ensure inputs are clear on white background */
        .login-input {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          font-size: 16px !important; /* Prevents iOS auto-zoom */
          height: 50px !important; /* Standard touch-friendly height */
        }

        .background-blobs {
          display: none;
        }
      }
      `}</style>

      {/* Background Blobs */}
      <div className="background-blobs" style={styles.blob1}></div>
      <div className="background-blobs" style={styles.blob2}></div>

      <div className="login-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <LogIn size={28} color="#22c55e" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to SmartPanchayat</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail
              size={18}
              style={styles.inputIcon}
              color={error.includes("email") ? "#ef4444" : "#64748b"}
            />
            <input
              className="login-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: error.includes("email") ? "#ef4444" : "#e2e8f0",
              }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock
              size={18}
              style={styles.inputIcon}
              color={
                error.includes("password") || error.includes("Incorrect")
                  ? "#ef4444"
                  : "#64748b"
              }
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                borderColor:
                  error.includes("password") || error.includes("Incorrect")
                    ? "#ef4444"
                    : "#e2e8f0",
              }}
              required
            />
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            {loading ? "Verifying..." : "Login to Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.linkText}>
            New to the portal?{" "}
            <Link to="/register" style={styles.link}>
              Create Account
            </Link>
          </p>
          <Link to="/" style={styles.backHome}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "95vh",
    display: "flex",
    justifyContent: "center",
    // alignItems: "center", 
    background: "#f8fafc", // Light, natural base
    backgroundImage: `radial-gradient(at 0% 0%, hsla(142, 76%, 36%, 0.08) 0, transparent 50%), 
                      radial-gradient(at 100% 100%, hsla(217, 91%, 60%, 0.08) 0, transparent 50%)`,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(34, 197, 94, 0.1)",
    borderRadius: "50%",
    filter: "blur(80px)",
    top: "-100px",
    left: "-100px",
  },
  blob2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: "50%",
    filter: "blur(80px)",
    bottom: "-50px",
    right: "-50px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "70px 40px",
    borderRadius: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
    width: "100%",
    maxWidth: "440px",
    zIndex: 1,
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  iconCircle: {
    width: "60px",
    height: "60px",
    backgroundColor: "#f0fdf4",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
    zIndex: 2,
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    fontSize: "16px", // 16px prevents iOS zoom on focus
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
  },
  button: {
    padding: "16px",
    backgroundColor: "#166534",
    backgroundImage: "linear-gradient(to right, #166534, #15803d)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "10px",
    boxShadow: "0 4px 6px -1px rgba(22, 101, 52, 0.2)",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #fecaca",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  linkText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  link: {
    color: "#166534",
    textDecoration: "none",
    fontWeight: "600",
  },
  backHome: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "13px",
  },
};

export default Login;
