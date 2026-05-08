import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Gift,
  UserCheck,
  FileText,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  ChevronRight,
  Landmark
} from "lucide-react";

const SchemeDetails = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected', 'reapply'

  useEffect(() => {
    const fetchSchemeAndStatus = async () => {
      setLoading(true);
      try {
        // 1. Fetch Scheme Details
        const docRef = doc(db, "schemes", schemeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Scheme not found!");
          navigate("/schemes");
          return;
        }
        setScheme({ id: docSnap.id, ...docSnap.data() });

        // 2. Fetch User Application Status
        const userId = auth.currentUser?.uid;
        if (userId) {
          const q = query(
            collection(db, "schemeApplications"),
            where("schemeId", "==", schemeId),
            where("userId", "==", userId)
          );
          const appSnap = await getDocs(q);
          if (!appSnap.empty) {
            setApplicationStatus(appSnap.docs[0].data().status);
          } else {
            setApplicationStatus("none");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load scheme");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeAndStatus();
  }, [schemeId, navigate]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} color="#1E40AF" />
        <p style={styles.loaderText}>Fetching official records...</p>
      </div>
    );
  }

  if (!scheme) return null;

  const handleApplyClick = () => {
    navigate(`/schemes/${scheme.id}/apply`, { state: { scheme } });
  };

  const renderStatusBadge = () => {
    switch (applicationStatus) {
      case "approved":
        return (
          <div style={{ ...styles.statusBadge, backgroundColor: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
            <CheckCircle size={18} /> Application Approved
          </div>
        );
      case "pending_operator":
      case "forwarded":
      case "pending":
        return (
          <div style={{ ...styles.statusBadge, backgroundColor: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>
            <Clock size={18} /> Application Under Review
          </div>
        );
      case "reapply":
        return (
          <div style={{ ...styles.statusBadge, backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            <FileText size={18} /> Action Required (Reapply)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 🔹 PREMIUM HERO SECTION */}
      <div style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <button style={styles.backButton} onClick={() => navigate("/schemes")}>
            <ArrowLeft size={16} /> Back to Schemes
          </button>
          
          <div style={styles.badgeRow}>
            <span style={styles.officialBadge}>
              <ShieldCheck size={16} /> Government Verified Scheme
            </span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.heroTitle}
          >
            {scheme.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.heroSubtitle}
          >
            Empowering citizens through accessible welfare initiatives. Read the complete official guidelines below before applying.
          </motion.p>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        <div style={styles.gridContainer}>
          
          {/* LEFT COLUMN: INFO CARDS */}
          <div style={styles.leftColumn}>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.infoCard}
            >
              <div style={styles.cardHeader}>
                <div style={{...styles.iconBox, backgroundColor: "#EEF2FF", color: "#4F46E5"}}>
                  <Landmark size={24} />
                </div>
                <h2 style={styles.cardTitle}>About the Scheme</h2>
              </div>
              <p style={styles.cardText}>{scheme.description || "Detailed description not provided."}</p>
            </motion.div>

            {scheme.benefits && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={styles.infoCard}
              >
                <div style={styles.cardHeader}>
                  <div style={{...styles.iconBox, backgroundColor: "#ECFDF5", color: "#059669"}}>
                    <Gift size={24} />
                  </div>
                  <h2 style={styles.cardTitle}>Key Benefits</h2>
                </div>
                <div style={styles.highlightBox}>
                  <p style={{...styles.cardText, margin: 0, color: "#065F46", fontWeight: "500"}}>{scheme.benefits}</p>
                </div>
              </motion.div>
            )}

            {scheme.eligibility && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={styles.infoCard}
              >
                <div style={styles.cardHeader}>
                  <div style={{...styles.iconBox, backgroundColor: "#FFFBEB", color: "#D97706"}}>
                    <UserCheck size={24} />
                  </div>
                  <h2 style={styles.cardTitle}>Eligibility Criteria</h2>
                </div>
                <p style={styles.cardText}>{scheme.eligibility}</p>
              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY APPLY CARD */}
          <div style={styles.rightColumn}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={styles.actionCard}
            >
              <h3 style={styles.actionTitle}>Application Status</h3>
              
              {applicationStatus && applicationStatus !== "none" ? (
                <div style={styles.statusWrapper}>
                  {renderStatusBadge()}
                  {applicationStatus === "reapply" && (
                    <button style={styles.applyButton} onClick={handleApplyClick}>
                      Fix & Re-submit Application <ChevronRight size={18} />
                    </button>
                  )}
                  <button style={styles.secondaryButton} onClick={() => navigate("/schemes")}>
                    View on Dashboard
                  </button>
                </div>
              ) : (
                <div style={styles.applyWrapper}>
                  <p style={styles.actionDesc}>
                    You haven't applied for this scheme yet. Ensure you meet all eligibility criteria before proceeding.
                  </p>
                  <ul style={styles.reqList}>
                    <li><CheckCircle size={14} color="#10B981" /> Valid Aadhaar Card Required</li>
                    <li><CheckCircle size={14} color="#10B981" /> Active Mobile Number Required</li>
                  </ul>
                  <button style={styles.applyButton} onClick={handleApplyClick}>
                    Apply Now <ChevronRight size={18} />
                  </button>
                </div>
              )}

              <div style={styles.secureNotice}>
                <ShieldCheck size={14} /> End-to-end encrypted submission
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: "80px",
  },
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: "16px",
    color: "#64748B",
    fontSize: "16px",
    fontWeight: "500",
  },
  heroSection: {
    background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
    padding: "120px 24px 60px 24px",
    color: "#FFFFFF",
  },
  heroContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  backButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "30px",
    transition: "background 0.2s",
  },
  badgeRow: {
    display: "flex",
    marginBottom: "20px",
  },
  officialBadge: {
    background: "rgba(16, 185, 129, 0.2)",
    color: "#34D399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "800",
    margin: "0 0 16px 0",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#94A3B8",
    maxWidth: "600px",
    lineHeight: "1.6",
    margin: 0,
  },
  mainContent: {
    maxWidth: "1100px",
    margin: "-40px auto 0",
    padding: "0 24px",
    position: "relative",
    zIndex: 10,
  },
  gridContainer: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  leftColumn: {
    flex: "1 1 600px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightColumn: {
    flex: "1 1 300px",
    position: "sticky",
    top: "100px",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    border: "1px solid #F1F5F9",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
  },
  cardText: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.7",
    margin: 0,
  },
  highlightBox: {
    backgroundColor: "#F0FDF4",
    borderLeft: "4px solid #10B981",
    padding: "20px",
    borderRadius: "0 16px 16px 0",
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid #E2E8F0",
  },
  actionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "0 0 20px 0",
  },
  statusWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statusBadge: {
    padding: "16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: "700",
  },
  applyWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  actionDesc: {
    fontSize: "14px",
    color: "#64748B",
    lineHeight: "1.5",
    margin: 0,
  },
  reqList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "14px",
    color: "#334155",
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
    transition: "transform 0.2s",
  },
  secondaryButton: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  secureNotice: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#94A3B8",
    marginTop: "24px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }
};

export default SchemeDetails;
