import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Send,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  MessageSquare,
  Globe,
  Briefcase,
  History,
  LayoutGrid,
  ChevronRight,
  ChevronDown
} from "lucide-react";

const SchemesList = () => {
  const [schemes, setSchemes] = useState([]);
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [expandedId, setExpandedId] = useState(null); // For accordion style reason view
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const schemesUnsub = onSnapshot(collection(db, "schemes"), (snapshot) => {
      setSchemes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const appsUnsub = onSnapshot(
      query(
        collection(db, "schemeApplications"),
        where("userId", "==", userId)
      ),
      (snapshot) => {
        setAppliedSchemes(
          snapshot.docs.map((doc) => ({
            schemeId: doc.data().schemeId,
            status: doc.data().status,
            operatorRemark: doc.data().operatorRemark || "",
            memberRemark: doc.data().memberRemark || "",
          }))
        );
      }
    );

    return () => {
      schemesUnsub();
      appsUnsub();
    };
  }, []);

  const availableSchemes = useMemo(() => {
    return schemes
      .map((s) => {
        const applied = appliedSchemes.find((a) => a.schemeId === s.id);
        if (!applied) return s;
        if (applied.status === "reapply") return { ...s, ...applied };
        return null;
      })
      .filter(Boolean);
  }, [schemes, appliedSchemes]);

  const appliedSchemesWithStatus = useMemo(() => {
    return schemes
      .map((s) => {
        const applied = appliedSchemes.find((a) => a.schemeId === s.id);
        if (!applied || applied.status === "reapply") return null;
        return { ...s, ...applied };
      })
      .filter(Boolean);
  }, [schemes, appliedSchemes]);

  const dataToShow = activeTab === "available" ? availableSchemes : appliedSchemesWithStatus;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending_operator":
      case "pending":
        return {
          label: "Operator Review",
          icon: <Clock size={16} />,
          color: "#B45309",
          bg: "#FFFBEB",
          border: "#FEF3C7"
        };
      case "forwarded":
        return {
          label: "Member Review",
          icon: <Send size={16} />,
          color: "#4338CA",
          bg: "#EEF2FF",
          border: "#E0E7FF"
        };
      case "approved":
        return {
          label: "Approved",
          icon: <CheckCircle size={16} />,
          color: "#059669",
          bg: "#ECFDF5",
          border: "#D1FAE5"
        };
      case "rejected_operator":
      case "rejected_member":
        return {
          label: "Rejected",
          icon: <XCircle size={16} />,
          color: "#E11D48",
          bg: "#FFF1F2",
          border: "#FFE4E6"
        };
      case "reapply":
        return {
          label: "Action Required",
          icon: <RefreshCcw size={16} />,
          color: "#DC2626",
          bg: "#FEF2F2",
          border: "#FECACA"
        };
      default:
        return {
          label: "Active",
          icon: <Info size={16} />,
          color: "#475569",
          bg: "#F8FAFC",
          border: "#F1F5F9"
        };
    }
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* HEADER HERO */}
      <div style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div style={styles.headerIconBox}>
            <Globe size={32} color="#FFFFFF" />
          </div>
          <h1 style={styles.header}>Citizen Scheme Portal</h1>
          <p style={styles.subHeader}>
            Access and track official government welfare programs designed for your benefit.
          </p>
        </div>
      </div>

      <div style={styles.mainContainer}>
        
        {/* TABS */}
        <div style={styles.tabsWrapper}>
          <div style={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab("available")}
              style={{ ...styles.tab, ...(activeTab === "available" ? styles.activeTab : {}) }}
            >
              <Briefcase size={18} /> Available Schemes
            </button>
            <button
              onClick={() => setActiveTab("applied")}
              style={{ ...styles.tab, ...(activeTab === "applied" ? styles.activeTab : {}) }}
            >
              <History size={18} /> My Applications
            </button>
          </div>
        </div>

        {dataToShow.length === 0 ? (
          <div style={styles.emptyState}>
            <LayoutGrid size={64} color="#E2E8F0" />
            <h3 style={styles.emptyTitle}>No records found</h3>
            <p style={styles.emptyText}>There are currently no schemes in this category.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {dataToShow.map((scheme) => {
              const status = getStatusConfig(scheme.status);
              const isRejected = scheme.status?.includes("rejected");
              const isReapply = scheme.status === "reapply";
              const hasRemark = scheme.operatorRemark || scheme.memberRemark;
              const isExpanded = expandedId === scheme.id;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={scheme.id} 
                  style={styles.card}
                >
                  <div style={styles.cardTop}>
                    {isReapply && (
                      <div style={styles.actionBadge}>
                        <RefreshCcw size={12} /> ACTION REQUIRED
                      </div>
                    )}
                    <h3 style={styles.cardTitle}>{scheme.title}</h3>
                    <p style={styles.cardDesc}>
                      {scheme.description?.substring(0, 120)}...
                    </p>
                  </div>

                  <div style={styles.cardBottom}>
                    {activeTab === "applied" ? (
                      <div style={{ ...styles.statusTag, color: status.color, backgroundColor: status.bg, borderColor: status.border }}>
                        {status.icon} {status.label}
                      </div>
                    ) : (
                      <button style={styles.viewDetailsBtn} onClick={() => navigate(`/schemes/${scheme.id}`)}>
                        View Full Details
                      </button>
                    )}

                    <div style={styles.actionRow}>
                      {(isReapply || isRejected) && hasRemark && (
                        <button style={styles.reasonBtn} onClick={() => toggleExpand(scheme.id)}>
                          <MessageSquare size={16} /> 
                          {isExpanded ? "Hide Note" : "Read Note"}
                          <ChevronDown size={16} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} />
                        </button>
                      )}

                      {activeTab === "available" && (
                        <button 
                          style={styles.applyBtn} 
                          onClick={() => navigate(`/schemes/${scheme.id}/apply`, { state: { scheme } })}
                        >
                          {isReapply ? "Fix & Submit" : "Apply Now"} <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ACCORDION REASON SECTION */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={styles.expandedSection}
                      >
                        <div style={{...styles.remarkBox, borderColor: isRejected ? "#FECACA" : "#FDE68A", backgroundColor: isRejected ? "#FEF2F2" : "#FFFBEB"}}>
                          <div style={{display: "flex", gap: "10px", alignItems: "flex-start"}}>
                            <AlertCircle size={20} color={isRejected ? "#EF4444" : "#F59E0B"} style={{flexShrink: 0}} />
                            <div>
                              <h4 style={{...styles.remarkTitle, color: isRejected ? "#991B1B" : "#B45309"}}>
                                {isRejected ? "Rejection Reason" : "Official Fix Request"}
                              </h4>
                              <p style={{...styles.remarkText, color: isRejected ? "#7F1D1D" : "#92400E"}}>
                                {scheme.memberRemark ? `From Member: ${scheme.memberRemark}` : `From Operator: ${scheme.operatorRemark}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    background: "#F8FAFC",
    minHeight: "100vh",
    paddingBottom: "100px",
    fontFamily: "'Inter', sans-serif",
  },
  heroSection: {
    background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    padding: "140px 24px 60px",
    textAlign: "center",
  },
  heroContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  headerIconBox: {
    width: "64px",
    height: "64px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  header: {
    fontSize: "40px",
    fontWeight: "900",
    color: "#FFFFFF",
    margin: "0 0 16px 0",
    letterSpacing: "-1px",
  },
  subHeader: {
    fontSize: "18px",
    color: "#94A3B8",
    margin: 0,
    lineHeight: "1.6",
  },
  mainContainer: {
    maxWidth: "1240px",
    margin: "-30px auto 0",
    padding: "0 24px",
    position: "relative",
    zIndex: 10,
  },
  tabsWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
  },
  tabsContainer: {
    display: "flex",
    background: "#FFFFFF",
    padding: "8px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid #E2E8F0",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 32px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
    color: "#64748B",
    transition: "all 0.2s ease",
  },
  activeTab: {
    background: "#0F172A",
    color: "#FFFFFF",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "30px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "box-shadow 0.2s ease",
  },
  cardTop: {
    padding: "32px 32px 20px",
    flex: 1,
  },
  actionBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: "800",
    color: "#DC2626",
    background: "#FEF2F2",
    padding: "6px 12px",
    borderRadius: "20px",
    letterSpacing: "1px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: "12px",
    lineHeight: "1.3",
  },
  cardDesc: {
    fontSize: "15px",
    color: "#64748B",
    lineHeight: "1.6",
    margin: 0,
  },
  cardBottom: {
    padding: "20px 32px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    borderTop: "1px solid #F8FAFC",
  },
  viewDetailsBtn: {
    background: "none",
    border: "none",
    color: "#2563EB",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
  },
  statusTag: {
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  applyBtn: {
    flex: 1,
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 20px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s",
  },
  reasonBtn: {
    flex: 1,
    background: "#F1F5F9",
    color: "#475569",
    border: "none",
    padding: "14px 20px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  expandedSection: {
    padding: "0 32px 32px",
    overflow: "hidden",
  },
  remarkBox: {
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid",
  },
  remarkTitle: {
    margin: "0 0 6px 0",
    fontSize: "14px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  remarkText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.6",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "24px 0 8px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
  }
};

export default SchemesList;
