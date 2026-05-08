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
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Fingerprint,
  Phone,
  Building,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowLeft
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
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState("");

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
            setName(data.fullName || user.displayName || "");
            const profileAadhaar = data.aadhaar || data.aadhaarNumber || "";
            setAadhaar(profileAadhaar);
            setMobile(data.phone || data.mobile || "");
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

  if (!scheme) {
    return (
      <div style={styles.loaderBox}>
        <AlertCircle size={48} color="#EF4444" />
        <h2 style={{marginTop: 20, color: '#1E293B'}}>Scheme Not Found</h2>
        <button style={styles.backBtnLight} onClick={() => navigate('/schemes')}>Return to Schemes</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaar) {
      alert("Aadhaar Number is missing from your profile. Please update your profile first.");
      return;
    }
    
    if (!declarationChecked) {
      alert("You must agree to the declaration before submitting.");
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
        aadhaarNumber: aadhaar,
        mobile: mobile,
        district: userArea,
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      let docRefId = "";

      if (!appliedSnap.empty) {
        const docRef = appliedSnap.docs[0].ref;
        await updateDoc(docRef, {
          ...applicationData,
          operatorRemark: "",
          memberRemark: "",
        });
        docRefId = docRef.id;
      } else {
        const docRef = await addDoc(collection(db, "schemeApplications"), applicationData);
        docRefId = docRef.id;
      }
      
      setRefNumber(`REF-${Math.floor(100000 + Math.random() * 900000)}-${docRefId.slice(0,4).toUpperCase()}`);
      setSuccess(true);
      
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div style={styles.loaderBox}>
        <Loader2 className="animate-spin" size={40} color="#2563EB" />
        <p style={{ marginTop: "16px", color: "#64748B", fontWeight: "500" }}>Authenticating Citizen Identity...</p>
      </div>
    );
  }

  // If success, render full screen success
  if (success) {
    return (
      <div style={styles.successScreen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={styles.successContent}
        >
          <div style={styles.successIconWrapper}>
            <CheckCircle2 size={64} color="#10B981" />
          </div>
          <h2 style={styles.successTitle}>Application Submitted Successfully!</h2>
          <p style={styles.successDesc}>
            Your application for <strong>{scheme.title}</strong> has been secured and forwarded to the verifying operator.
          </p>
          
          <div style={styles.refBox}>
            <p style={styles.refLabel}>APPLICATION REFERENCE NUMBER</p>
            <h3 style={styles.refNumber}>{refNumber}</h3>
          </div>

          <button style={styles.primaryBtn} onClick={() => navigate('/schemes')}>
            Track Status on Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{...styles.pageWrapper, flexDirection: isMobile ? "column" : "row"}}>
      
      {/* LEFT PANEL - FULL BLEED IMMERSIVE */}
      <div style={{ ...styles.leftPanel, padding: isMobile ? "100px 30px 40px" : "120px 60px" }}>
        
        <button style={styles.ghostBackBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.officialBadge}>
          <ShieldCheck size={16} /> GOV.IN SECURE
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{...styles.mainTitle, fontSize: isMobile ? "28px" : "40px"}}
        >
          {scheme.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.mainDesc}
        >
          Complete your application process. Your identity has been pre-verified through our central registry.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.securityBox}
        >
          <h4 style={styles.secTitle}>Verification Status</h4>
          <div style={styles.secItem}>
            <CheckCircle2 size={18} color={aadhaar ? "#10B981" : "#EF4444"} />
            <span>Aadhaar KYC: {aadhaar ? "Verified via Profile" : "Missing"}</span>
          </div>
          <div style={styles.secItem}>
            <CheckCircle2 size={18} color="#10B981" />
            <span>Panchayat Database Linked</span>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - CLEAN FORM FULL BLEED */}
      <div style={{ ...styles.rightPanel, padding: isMobile ? "40px 30px" : "120px 80px" }}>
        
        <motion.form 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit} 
          style={styles.form}
        >
          
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>Application Details</h3>
            <p style={styles.formSubtitle}>Review and confirm your pre-filled information.</p>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={16} /> Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "20px", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}><Fingerprint size={16} /> Aadhaar Number</label>
              <input
                type="text"
                value={aadhaar}
                placeholder={fetchingProfile ? "Loading..." : "Not found in profile"}
                readOnly
                style={{ ...styles.input, backgroundColor: "#F8FAFC", color: aadhaar ? "#0F172A" : "#EF4444", cursor: "not-allowed", border: "1px solid #E2E8F0" }}
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}><Phone size={16} /> Registered Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={styles.input}
                maxLength="10"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Building size={16} /> Panchayat Area / Ward</label>
            <div style={styles.readonlyDiv}>{userArea}</div>
          </div>

          {/* DECLARATION CHECKBOX */}
          <div 
            style={{...styles.declarationBox, borderColor: declarationChecked ? "#3B82F6" : "#E2E8F0", backgroundColor: declarationChecked ? "#EFF6FF" : "#F8FAFC"}}
            onClick={() => setDeclarationChecked(!declarationChecked)}
          >
            <div style={{color: declarationChecked ? "#2563EB" : "#94A3B8"}}>
              {declarationChecked ? <CheckSquare size={24} /> : <Square size={24} />}
            </div>
            <p style={{...styles.declarationText, color: declarationChecked ? "#1E3A8A" : "#475569"}}>
              <strong>Official Declaration:</strong> I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief. I consent to the use of my Aadhaar for identity verification.
            </p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="submit"
              style={{...styles.submitBtn, opacity: (!aadhaar || !declarationChecked || loading) ? 0.6 : 1}}
              disabled={loading || !aadhaar || !declarationChecked}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Final Application"}
            </button>
          </div>

        </motion.form>
      </div>

    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#FFFFFF",
    // Make sure it goes behind/below navbar if navbar is fixed
    position: "relative",
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#F8FAFC"
  },
  
  // LEFT PANEL - FULL BLEED
  leftPanel: {
    flex: "0 0 45%",
    background: "linear-gradient(145deg, #0F172A 0%, #1E3A8A 100%)",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  },
  ghostBackBtn: {
    position: "absolute",
    top: "40px",
    left: "40px",
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    transition: "color 0.2s",
  },
  officialBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34D399",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "32px",
    width: "fit-content",
  },
  mainTitle: {
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "24px",
    letterSpacing: "-1px",
  },
  mainDesc: {
    fontSize: "18px",
    color: "#94A3B8",
    lineHeight: "1.6",
    marginBottom: "48px",
    maxWidth: "500px",
  },
  securityBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "32px",
    borderRadius: "24px",
    maxWidth: "500px",
  },
  secTitle: {
    fontSize: "14px",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "24px",
    marginTop: 0,
  },
  secItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#E2E8F0",
  },
  
  // RIGHT PANEL - CLEAN
  rightPanel: {
    flex: "1",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    maxWidth: "650px",
    width: "100%",
  },
  formHeader: {
    marginBottom: "16px",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  formSubtitle: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
    lineHeight: "1.5",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    padding: "18px",
    borderRadius: "16px",
    border: "2px solid #E2E8F0",
    fontSize: "16px",
    color: "#0F172A",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "500",
    backgroundColor: "#F8FAFC",
  },
  readonlyDiv: {
    padding: "18px",
    borderRadius: "16px",
    backgroundColor: "#F1F5F9",
    border: "1px dashed #CBD5E1",
    fontSize: "16px",
    color: "#475569",
    fontWeight: "600",
  },
  declarationBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "24px",
    borderRadius: "20px",
    border: "2px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "10px",
  },
  declarationText: {
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    border: "none",
    padding: "20px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
  },

  // FULL SCREEN SUCCESS
  successScreen: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  successContent: {
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
  },
  successIconWrapper: {
    width: "120px",
    height: "120px",
    backgroundColor: "#ECFDF5",
    borderRadius: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 40px",
    boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1)",
  },
  successTitle: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#0F172A",
    margin: "0 0 20px 0",
    letterSpacing: "-1px",
  },
  successDesc: {
    fontSize: "18px",
    color: "#64748B",
    lineHeight: "1.6",
    margin: "0 0 40px 0",
  },
  refBox: {
    backgroundColor: "#FFFFFF",
    border: "2px dashed #E2E8F0",
    padding: "32px",
    borderRadius: "24px",
    marginBottom: "50px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)",
  },
  refLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#94A3B8",
    margin: "0 0 12px 0",
    letterSpacing: "2px",
  },
  refNumber: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#1E3A8A",
    margin: 0,
    fontFamily: "monospace",
    letterSpacing: "4px",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "18px 40px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
  },
  backBtnLight: {
    marginTop: "20px",
    backgroundColor: "transparent",
    color: "#2563EB",
    border: "2px solid #2563EB",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  }
};

export default ApplyScheme;
