import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  Info,
  Send,
  RefreshCcw,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Clock,
  ArrowLeft,
  Eye,
  XCircle,
  MessageSquare,
  Globe,
  Briefcase,
  History,
  LayoutGrid,
} from "lucide-react";

const SchemesList = () => {
  const [schemes, setSchemes] = useState([]);
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [flippedCards, setFlippedCards] = useState({});
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

  const dataToShow =
    activeTab === "available" ? availableSchemes : appliedSchemesWithStatus;

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending_operator":
        return {
          label: "Operator Review",
          icon: <Clock size={14} />,
          color: "#B45309",
          bg: "#FFFBEB",
        };
      case "forwarded":
        return {
          label: "Member Review",
          icon: <Send size={14} />,
          color: "#4338CA",
          bg: "#EEF2FF",
        };
      case "approved":
        return {
          label: "Approved",
          icon: <CheckCircle size={14} />,
          color: "#059669",
          bg: "#ECFDF5",
        };
      case "rejected_operator":
      case "rejected_member":
        return {
          label: "Rejected",
          icon: <XCircle size={14} />,
          color: "#991B1B",
          bg: "#FEE2E2",
        };
      case "reapply":
        return {
          label: "Action Required",
          icon: <RefreshCcw size={14} />,
          color: "#DC2626",
          bg: "#FEF2F2",
        };
      default:
        return {
          label: "Active",
          icon: <Info size={14} />,
          color: "#374151",
          bg: "#F3F4F6",
        };
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* 🔹 ENHANCED HEADER WITH ICONS */}
        <header style={styles.headerSection}>
          <div style={styles.headerIconBox}>
            <Globe size={32} color="#2563EB" />
          </div>
          <h1 style={styles.header}>Citizen Scheme Portal</h1>
          <p style={styles.subHeader}>
            Secure access to government welfare schemes and application tracking
          </p>
        </header>

        {/* 🔹 MODERN TABS WITH ICONS */}
        <div style={styles.tabsWrapper}>
          <div style={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab("available")}
              style={{
                ...styles.tab,
                ...(activeTab === "available" ? styles.activeTab : {}),
              }}
            >
              <Briefcase size={16} /> Explore Schemes
            </button>
            <button
              onClick={() => setActiveTab("applied")}
              style={{
                ...styles.tab,
                ...(activeTab === "applied" ? styles.activeTab : {}),
              }}
            >
              <History size={16} /> My Submissions
            </button>
          </div>
        </div>

        {dataToShow.length === 0 ? (
          <div style={styles.emptyState}>
            <LayoutGrid size={48} color="#CBD5E1" />
            <p style={styles.emptyText}>No records found in this category.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {dataToShow.map((scheme) => {
              const isFlipped = flippedCards[scheme.id];
              const status = getStatusConfig(scheme.status);
              const isRejected = scheme.status?.includes("rejected");
              const hasRemark = scheme.operatorRemark || scheme.memberRemark;

              return (
                <div key={scheme.id} style={styles.cardWrapper}>
                  <div
                    style={{
                      ...styles.cardInner,
                      transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                  >
                    {/* CARD FRONT */}
                    <div style={styles.cardFront}>
                      <div style={styles.cardHeader}>
                        {scheme.status === "reapply" && (
                          <div style={styles.reapplyLabel}>
                            <RefreshCcw size={12} /> ACTION REQUIRED
                          </div>
                        )}
                        <h3 style={styles.cardTitle}>{scheme.title}</h3>
                      </div>

                      <p style={styles.cardDesc}>
                        {scheme.description?.substring(0, 110)}...
                      </p>

                      {hasRemark && !isFlipped && (
                        <div style={styles.remarkIndicator}>
                          <MessageSquare size={12} /> Note from Reviewer
                        </div>
                      )}

                      <div style={styles.cardFooter}>
                        {activeTab === "applied" ? (
                          <div
                            style={{
                              ...styles.statusBadge,
                              color: status.color,
                              backgroundColor: status.bg,
                            }}
                          >
                            {status.icon} {status.label}
                          </div>
                        ) : (
                          <button
                            style={styles.viewDetailsBtn}
                            onClick={() => navigate(`/schemes/${scheme.id}`)}
                          >
                            Full Info <ExternalLink size={14} />
                          </button>
                        )}

                        <div style={styles.actionRow}>
                          {(scheme.status === "reapply" || isRejected) && (
                            <button
                              style={styles.reasonBtn}
                              onClick={() => toggleFlip(scheme.id)}
                            >
                              <Eye size={14} />{" "}
                              {isRejected ? "Reason" : "Fix Note"}
                            </button>
                          )}

                          {activeTab === "available" && (
                            <button
                              style={styles.applyBtn}
                              onClick={() =>
                                navigate(`/schemes/${scheme.id}/apply`, {
                                  state: { scheme },
                                })
                              }
                            >
                              {scheme.status === "reapply"
                                ? "Fix & Apply"
                                : "Apply Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🔹 CARD BACK (REASON NOTE) - DARK THEME */}
                    <div style={styles.cardBack}>
                      <div style={styles.backContent}>
                        <AlertCircle
                          size={40}
                          color={isRejected ? "#FCA5A5" : "#FDE047"}
                          style={{ marginBottom: "16px" }}
                        />
                        <h4 style={styles.backHeading}>
                          {isRejected
                            ? "Rejection Note"
                            : "Official Instructions"}
                        </h4>

                        <div style={styles.remarkBox}>
                          <p style={styles.remarkText}>
                            {scheme.memberRemark ? (
                              <>
                                <span style={{ color: "#94A3B8" }}>
                                  MEMBER:
                                </span>{" "}
                                {scheme.memberRemark}
                              </>
                            ) : scheme.operatorRemark ? (
                              <>
                                <span style={{ color: "#94A3B8" }}>
                                  OPERATOR:
                                </span>{" "}
                                {scheme.operatorRemark}
                              </>
                            ) : (
                              "No specific instructions provided by the Panchayat."
                            )}
                          </p>
                        </div>

                        <button
                          style={styles.returnBtn}
                          onClick={() => toggleFlip(scheme.id)}
                        >
                          <ArrowLeft size={14} /> Return to Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
    paddingTop: "140px",
    paddingBottom: "80px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1240px", margin: "0 auto", padding: "0 24px" },
  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  headerIconBox: {
    width: "64px",
    height: "64px",
    background: "#EFF6FF",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "1px solid #DBEAFE",
  },
  header: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#0F172A",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subHeader: {
    fontSize: "16px",
    color: "#64748B",
    marginTop: "10px",
    maxWidth: "600px",
    lineHeight: "1.5",
  },

  tabsWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "50px",
  },
  tabsContainer: {
    display: "flex",
    background: "#fff",
    padding: "6px",
    borderRadius: "18px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #E2E8F0",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 24px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    color: "#64748B",
    transition: "0.3s ease",
  },
  activeTab: {
    background: "#0F172A",
    color: "#fff",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "28px",
  },
  cardWrapper: { perspective: "1500px", height: "340px" },
  cardInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    transformStyle: "preserve-3d",
  },

  cardFront: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    background: "#fff",
    borderRadius: "28px",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  cardBack: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    background: "#0F172A",
    borderRadius: "28px",
    padding: "30px",
    transform: "rotateY(180deg)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  backContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "14px",
    lineHeight: "1.3",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#64748B",
    lineHeight: "1.7",
    flexGrow: 1,
  },
  remarkIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#2563EB",
    fontWeight: "800",
    background: "#EFF6FF",
    padding: "6px 12px",
    borderRadius: "8px",
    width: "fit-content",
    marginBottom: "15px",
    textTransform: "uppercase",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "20px",
  },
  actionRow: { display: "flex", gap: "10px" },

  applyBtn: {
    background: "#2563EB",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    transition: "0.2s",
  },
  reasonBtn: {
    background: "#F1F5F9",
    color: "#475569",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  viewDetailsBtn: {
    background: "none",
    border: "none",
    color: "#2563EB",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  statusBadge: {
    padding: "8px 14px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  reapplyLabel: {
    fontSize: "10px",
    fontWeight: "900",
    color: "#DC2626",
    letterSpacing: "1px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  backHeading: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "14px 0",
  },
  remarkBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    width: "100%",
    marginBottom: "25px",
  },
  remarkText: {
    fontSize: "15px",
    color: "#F1F5F9",
    lineHeight: "1.6",
    fontStyle: "italic",
  },
  returnBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
  },

  emptyState: {
    textAlign: "center",
    padding: "120px 0",
    color: "#94A3B8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  emptyText: { fontSize: "18px", fontWeight: "500" },
};

export default SchemesList;
