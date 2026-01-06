// src/pages/Register.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import {
  User,
  Phone,
  Users,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    const count = parseInt(familyCount);
    if (isNaN(count) || count < 0) {
      setError("Please enter a valid number of family members.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const familyCode = "FAM-" + nanoid(6).toUpperCase();

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        phone,
        numberOfFamilyMembers: count,
        familyId: user.uid,
        familyCode,
        role: "villager",
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 480px) {
        /* 1. Force the content to the top instead of the middle */
        .register-page-container {
          align-items: flex-start !important; 
          padding-top: 10px !important; 
        }

        .register-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          backdrop-filter: none !important;
          padding: 1px 10px !important; /* Reduced top padding */
          margin-top: 60px !important;
        }

        /* 2. Shrink the header to save vertical space */
        .register-header {
          margin-bottom: 15px !important;
        }

        .register-icon-circle {
          width: 45px !important; /* Smaller icon */
          height: 45px !important;
          margin-bottom: 8px !important;
        }

        .register-title {
          font-size: 1.5rem !important; /* Smaller font */
        }

        .register-input {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          font-size: 16px !important;
          padding: 10px 14px 10px 40px !important; /* Slightly thinner inputs */
        }

        .register-grid {
          grid-template-columns: 1fr !important;
          gap: 10px !important; /* Tighter gap between stacked inputs */
        }

        .background-blobs {
          display: none;
        }
      }
      `}</style>

      {/* Dynamic Background Elements */}
      <div className="background-blobs" style={styles.blob1}></div>
      <div className="background-blobs" style={styles.blob2}></div>

      <div className="register-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <UserPlus size={28} color="#22c55e" />
          </div>
          <h2 style={styles.title}>Join SmartPanchayat</h2>
          <p style={styles.subtitle}>
            Create your villager profile to access services
          </p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div className="register-grid" style={styles.inputGrid}>
            <div style={styles.inputGroup}>
              <User size={18} style={styles.inputIcon} color="#64748b" />
              <input
                className="register-input"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Phone size={18} style={styles.inputIcon} color="#64748b" />
              <input
                className="register-input"
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <Users size={18} style={styles.inputIcon} color="#64748b" />
            <input
              className="register-input"
              type="number"
              placeholder="Family Members (excluding you)"
              value={familyCount}
              onChange={(e) => setFamilyCount(e.target.value)}
              required
              style={styles.input}
              min={0}
            />
          </div>

          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} color="#64748b" />
            <input
              className="register-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div className="register-grid" style={styles.inputGrid}>
            <div style={styles.inputGroup}>
              <Lock size={18} style={styles.inputIcon} color="#64748b" />
              <input
                className="register-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <CheckCircle2
                size={18}
                style={styles.inputIcon}
                color="#64748b"
              />
              <input
                className="register-input"
                type="password"
                placeholder="Confirm"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.linkText}>
            Already a member?{" "}
            <Link to="/login" style={styles.link}>
              Login here
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
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    // alignItems: "center",
    background: "#f8fafc",
    backgroundImage: `radial-gradient(at 0% 0%, hsla(142, 76%, 36%, 0.08) 0, transparent 50%), 
                      radial-gradient(at 100% 100%, hsla(217, 91%, 60%, 0.08) 0, transparent 50%)`,
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "rgba(34, 197, 94, 0.07)",
    borderRadius: "50%",
    filter: "blur(80px)",
    top: "-150px",
    right: "-100px",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(59, 130, 246, 0.07)",
    borderRadius: "50%",
    filter: "blur(80px)",
    bottom: "-100px",
    left: "-100px",
    zIndex: 0,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "500px",
    zIndex: 1,
    border: "1px solid rgba(255, 255, 255, 0.7)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    backgroundColor: "#f0fdf4",
    borderRadius: "20px",
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
    gap: "16px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  inputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
    zIndex: 5,
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 42px",
    fontSize: "15px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    color: "#1e293b",
  },
  button: {
    padding: "16px",
    backgroundColor: "#166534",
    backgroundImage: "linear-gradient(to right, #166534, #15803d)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
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
    borderRadius: "10px",
    fontSize: "13px",
    border: "1px solid #fecaca",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linkText: {
    fontSize: "14px",
    color: "#64748b",
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

export default Register;
