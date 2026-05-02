import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  FaUser,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [language, setLanguage] = useState("en");
  const [editData, setEditData] = useState({ fullName: "", email: "" });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const showMsg = (message, type = "success") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEditData({
            fullName: data.fullName || "",
            email: user.email || "",
          });
          setLanguage(data.language || "en");
        }
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "users", user.uid), {
        fullName: editData.fullName,
        language,
      });
      showMsg("Profile settings saved.");
    } catch (err) {
      showMsg("Update failed.", "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // 1. Basic Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showMsg("Please fill all password fields.", "error");
    }
    if (newPassword.length < 6) {
      return showMsg("New password must be at least 6 characters.", "error");
    }
    if (newPassword !== confirmPassword) {
      return showMsg("Passwords do not match.", "error");
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      // 2. Re-authenticate user (Firebase requirement for sensitive changes)
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 3. Update Password
      await updatePassword(user, newPassword);

      showMsg("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      showMsg(
        err.code === "auth/wrong-password"
          ? "Current password incorrect."
          : "Security update failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={ui.pageContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { 
            transition: all 0.2s ease-in-out; 
            box-sizing: border-box; /* Prevents input overfitting */
        }
        input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important; }
        
        /* Responsive Media Queries */
        @media (max-width: 768px) {
          .layout-grid { 
            grid-template-columns: 1fr !important; 
            padding: 0 1rem;
          }
          .sidebar-nav { 
            flex-direction: row !important; 
            overflow-x: auto; 
            padding-bottom: 10px;
          }
          .sidebar-container { position: relative !important; top: 0 !important; }
        }
      `}</style>

      {msg && (
        <div
          style={{
            ...ui.toast,
            backgroundColor: msgType === "success" ? "#059669" : "#dc2626",
          }}
        >
          {msgType === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          {msg}
        </div>
      )}

      <div className="layout-grid" style={ui.layoutWrapper}>
        <aside className="sidebar-container" style={ui.sidebar}>
          <h2 style={ui.sidebarTitle}>Settings</h2>
          <nav className="sidebar-nav" style={ui.nav}>
            <NavItem
              active={activeTab === "profile"}
              icon={<FaUser />}
              label="Account"
              onClick={() => setActiveTab("profile")}
            />
            <NavItem
              active={activeTab === "security"}
              icon={<FaLock />}
              label="Security"
              onClick={() => setActiveTab("security")}
            />
          </nav>
        </aside>

        <main style={ui.mainContent}>
          {activeTab === "profile" && (
            <section>
              <SectionHeader
                title="Account Information"
                subtitle="Update your personal details and how others see you."
              />
              <div style={ui.card}>
                <div style={ui.formGroup}>
                  <label style={ui.label}>Full Name</label>
                  <input
                    style={ui.input}
                    value={editData.fullName}
                    onChange={(e) =>
                      setEditData({ ...editData, fullName: e.target.value })
                    }
                  />
                </div>
                <div style={ui.formGroup}>
                  <label style={ui.label}>Email Address</label>
                  <input
                    style={{ ...ui.input, ...ui.inputDisabled }}
                    value={editData.email}
                    disabled
                  />
                  <p style={ui.helperText}>
                    Email cannot be changed for security.
                  </p>
                </div>
                <button style={ui.btnPrimary} onClick={handleUpdateProfile}>
                  Save Changes
                </button>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section>
              <SectionHeader
                title="Password & Security"
                subtitle="You must re-verify your current password to make changes."
              />
              <form onSubmit={handlePasswordChange} style={ui.card}>
                <div style={ui.formGroup}>
                  <label style={ui.label}>Current Password</label>
                  <input
                    type="password"
                    style={ui.input}
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div style={ui.formGroup}>
                  <label style={ui.label}>New Password</label>
                  <input
                    type="password"
                    style={ui.input}
                    placeholder="At least 8 characters"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div style={ui.formGroup}>
                  <label style={ui.label}>Confirm New Password</label>
                  <input
                    type="password"
                    style={ui.input}
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...ui.btnPrimary, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

/* --- Sub-Components --- */
const NavItem = ({ active, icon, label, onClick }) => (
  <div
    onClick={onClick}
    style={{
      ...ui.navItem,
      color: active ? "#2563eb" : "#64748b",
      backgroundColor: active ? "#eff6ff" : "transparent",
      fontWeight: active ? "600" : "400",
    }}
  >
    {icon} <span>{label}</span>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div style={ui.sectionHeader}>
    <h3 style={ui.sectionTitle}>{title}</h3>
    <p style={ui.sectionSubtitle}>{subtitle}</p>
  </div>
);

/* --- Enhanced Styles Object --- */
const ui = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    paddingTop: "6rem",
  },
  layoutWrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "2rem",
  },
  sidebar: { position: "sticky", top: "2rem", height: "fit-content" },
  sidebarTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    color: "#0f172a",
    paddingLeft: "10px",
  },
  nav: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.95rem",
    whiteSpace: "nowrap",
  },
  mainContent: { paddingBottom: "5rem" },
  sectionHeader: { marginBottom: "1.5rem" },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "0.25rem",
  },
  sectionSubtitle: { fontSize: "0.9rem", color: "#64748b" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "clamp(1.5rem, 5vw, 2rem)", // Responsive padding
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
  },
  formGroup: { marginBottom: "1.5rem" },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fcfdfe",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box", // CRITICAL: Fixes the overfitting issue
  },
  inputDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  helperText: { fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.5rem" },
  btnPrimary: {
    backgroundColor: "#0f172a",
    color: "white",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    width: "fit-content",
  },
  toast: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    left: "1rem", // On mobile it will span across
    maxWidth: "400px",
    marginLeft: "auto",
    color: "white",
    padding: "12px 24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    zIndex: 2000,
    fontWeight: "500",
  },
};

export default Settings;
