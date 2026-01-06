import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Fingerprint,
  Phone,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

const ApplyScheme = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scheme } = location.state || {};

  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [userArea, setUserArea] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);

    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            // 🔹 Setting Name
            setName(data.fullName || user.displayName || "");

            // 🔹 FIX: Setting Aadhaar (Checking multiple common field names)
            // If your Profile.js saves it as 'aadhaar', this will now find it.
            const profileAadhaar = data.aadhaar || data.aadhaarNumber || "";
            setAadhaar(profileAadhaar);

            // 🔹 Setting Mobile
            setMobile(data.phone || data.mobile || "");

            // 🔹 Setting Area
            setUserArea(data.area || "General Ward");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        } finally {
          setFetchingProfile(false);
        }
      }
    };

    fetchUserData();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!scheme)
    return (
      <div style={styles.loaderBox}>
        <AlertCircle size={40} color="#EF4444" />
        <p>Scheme Not Found</p>
      </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation before submission
    if (!aadhaar) {
      alert(
        "Aadhaar Number is missing from your profile. Please update your profile first."
      );
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, "schemeApplications"),
        where("schemeId", "==", scheme.id),
        where("userId", "==", userId)
      );
      const appliedSnap = await getDocs(q);

      const applicationData = {
        schemeId: scheme.id,
        schemeTitle: scheme.title,
        userId: userId,
        applicantName: name,
        aadhaarNumber: aadhaar, // Consistent naming for Member Panel
        mobile: mobile,
        district: userArea,
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      if (!appliedSnap.empty) {
        await updateDoc(appliedSnap.docs[0].ref, {
          ...applicationData,
          operatorRemark: "", // Clear old remarks
          memberRemark: "",
        });
      } else {
        await addDoc(collection(db, "schemeApplications"), applicationData);
      }
      alert("Application submitted successfully!");
      navigate("/schemes");
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile)
    return (
      <div style={styles.pageWrapper}>
        <Loader2 className="animate-spin" size={40} color="#2563EB" />
        <p style={{ marginTop: "10px", color: "#64748B" }}>
          Verifying Identity...
        </p>
      </div>
    );

  return (
    <div
      style={{
        ...styles.pageWrapper,
        paddingTop: isMobile ? "70px" : "60px",
      }}
    >
      <div
        style={{
          ...styles.mainContainer,
          flexDirection: isMobile ? "column" : "row",
          maxWidth: isMobile ? "95%" : "800px",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            ...styles.leftInfoPanel,
            padding: isMobile ? "25px" : "35px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div
            style={
              isMobile ? { display: "flex", justifyContent: "center" } : {}
            }
          >
            <span style={styles.statusBadge}>
              <ShieldCheck size={14} /> Official Portal
            </span>
          </div>
          <h1
            style={{
              ...styles.mainTitle,
              fontSize: isMobile ? "20px" : "28px",
            }}
          >
            {scheme.title}
          </h1>
          <p style={styles.mainDesc}>
            Verify your pre-filled identity details before final submission.
          </p>

          <div style={styles.verificationCard}>
            <h4 style={styles.vTitle}>Security Check</h4>
            <div style={styles.vItem}>
              <CheckCircle2 size={16} color={aadhaar ? "#10B981" : "#EF4444"} />
              <span>
                Identity:{" "}
                {aadhaar ? "Verified via Profile" : "Not found in Profile"}
              </span>
            </div>
            <div style={styles.vItem}>
              <CheckCircle2 size={16} color="#10B981" />{" "}
              <span>Registered under {userArea}</span>
            </div>
            <div style={styles.vItem}>
              <CheckCircle2 size={16} color="#10B981" />{" "}
              <span>Panchayat Synced</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{ ...styles.formPanel, padding: isMobile ? "25px" : "40px" }}
        >
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formHeader}>Applicant Details</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div
              style={{
                ...styles.row,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>
                  <Fingerprint size={14} /> Aadhaar
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  placeholder={
                    fetchingProfile ? "Loading..." : "Not set in profile"
                  }
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: "#F8FAFC",
                    cursor: "not-allowed",
                    color: aadhaar ? "#1E293B" : "#EF4444",
                  }}
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>
                  <Phone size={14} /> Mobile
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={styles.input}
                  maxLength="10"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <MapPin size={14} /> Area
              </label>
              <div style={styles.readonlyField}>{userArea}</div>
            </div>

            <div style={styles.noticeText}>
              <FileText size={14} />
              <span>Ensure profile data is correct before applying.</span>
            </div>

            <div
              style={{
                ...styles.footer,
                flexDirection: isMobile ? "column-reverse" : "row",
              }}
            >
              <button
                type="button"
                style={styles.backBtn}
                onClick={() => navigate("/schemes")}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading || !aadhaar}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Final Submission"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#F1F5F9",
    fontFamily: "'Inter', sans-serif",
  },
  mainContainer: {
    display: "flex",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
    border: "1px solid #E2E8F0",
  },
  leftInfoPanel: {
    flex: 0.9,
    background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60A5FA",
    padding: "6px 12px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    marginBottom: "20px",
  },
  mainTitle: { fontWeight: "800", marginBottom: "16px", lineHeight: "1.2" },
  mainDesc: {
    fontSize: "14px",
    color: "#94A3B8",
    lineHeight: "1.5",
    marginBottom: "30px",
  },
  verificationCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "20px",
  },
  vTitle: {
    fontSize: "12px",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "15px",
  },
  vItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    fontSize: "13px",
    color: "#CBD5E1",
  },
  formPanel: { flex: 1.2, backgroundColor: "#fff" },
  formHeader: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: "25px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontWeight: "600",
    fontSize: "12px",
    color: "#64748B",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    padding: "12px 14px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    outline: "none",
    color: "#1E293B",
  },
  readonlyField: {
    padding: "12px 14px",
    background: "#F1F5F9",
    borderRadius: "10px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "700",
  },
  noticeText: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    color: "#94A3B8",
    background: "#F8FAFC",
    padding: "10px",
    borderRadius: "10px",
  },
  footer: { display: "flex", gap: "12px", marginTop: "10px" },
  submitBtn: {
    flex: 2,
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#64748B",
    border: "1px solid #E2E8F0",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
};

export default ApplyScheme;
