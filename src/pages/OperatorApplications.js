import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Send,
  Loader2,
  AlertCircle
} from "lucide-react";

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schemeTitle, setSchemeTitle] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const schemeId = searchParams.get("schemeId");

  useEffect(() => {
    if (!schemeId) return;

    const fetchTitle = async () => {
      const schemeDoc = await getDoc(doc(db, "schemes", schemeId));
      if (schemeDoc.exists()) setSchemeTitle(schemeDoc.data().title);
    };
    fetchTitle();

    const q = query(
      collection(db, "schemeApplications"),
      where("schemeId", "==", schemeId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      apps.sort((a, b) => (a.status?.includes("pending") ? -1 : 1));
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [schemeId]);

  const handleUpdateStatus = async (id, status, remark = "") => {
    try {
      await updateDoc(doc(db, "schemeApplications", id), {
        status,
        operatorRemark: remark,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    pending: applications.filter(a => a.status === "pending" || a.status === "pending_operator").length,
    forwarded: applications.filter(a => a.status === "forwarded").length,
    verified: applications.filter(a => a.status === "approved").length,
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} color="#0F172A" />
        <p style={styles.loaderText}>Syncing securely...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <div style={styles.navbar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Schemes
          </button>
          <div style={styles.liveIndicator}>
            <Activity size={14} color="#10B981" />
            <span style={styles.liveText}>LIVE MONITORING</span>
          </div>
        </div>

        <div style={styles.heroSection}>
          <div>
            <h1 style={styles.mainTitle}>{schemeTitle || "Application Management"}</h1>
            <p style={styles.subTitle}>High-authority verification and routing portal.</p>
          </div>

          <div style={styles.analyticsBar}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>PENDING</span>
              <span style={{ ...styles.statValue, color: "#F59E0B" }}>{stats.pending}</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>FORWARDED</span>
              <span style={{ ...styles.statValue, color: "#6366F1" }}>{stats.forwarded}</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>APPROVED</span>
              <span style={{ ...styles.statValue, color: "#10B981" }}>{stats.verified}</span>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertCircle size={64} color="#E2E8F0" />
            <h3 style={styles.emptyTitle}>Queue is Clear</h3>
            <p style={styles.emptyDesc}>No citizen applications require attention at this time.</p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <div style={{ flex: 2 }}>APPLICANT</div>
              <div style={{ flex: 1.5 }}>CONTACT INFO</div>
              <div style={{ flex: 1 }}>STATUS</div>
              <div style={{ flex: 2, textAlign: "right" }}>ACTIONS</div>
            </div>

            <div style={styles.tableBody}>
              {applications.map((app) => (
                <div key={app.id} style={styles.tableRow}>
                  
                  <div style={styles.cellIdentity}>
                    <div style={{...styles.avatar, color: getStatusColor(app.status), backgroundColor: `${getStatusColor(app.status)}15`}}>
                      {app.name?.charAt(0) || app.applicantName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div style={styles.primaryText}>{app.name || app.applicantName}</div>
                      <div style={styles.secondaryText}>Aadhaar: {app.aadhaar || app.aadhaarNumber}</div>
                    </div>
                  </div>

                  <div style={styles.cellDetails}>
                    <div style={styles.iconDetail}>
                      <Phone size={14} color="#94A3B8" /> {app.mobile}
                    </div>
                    <div style={styles.iconDetail}>
                      <MapPin size={14} color="#94A3B8" /> {app.district}
                    </div>
                  </div>

                  <div style={styles.cellStatus}>
                    <span style={{...styles.statusBadge, ...getBadgeColors(app.status)}}>
                      {app.status?.toUpperCase().replace("_", " ")}
                    </span>
                  </div>

                  <div style={styles.cellActions}>
                    {["pending", "pending_operator"].includes(app.status) ? (
                      <div style={styles.btnGroup}>
                        <button style={styles.btnVerify} onClick={() => handleUpdateStatus(app.id, "forwarded", "Verified by Operator.")}>
                          <Send size={14} /> Forward
                        </button>
                        <button style={styles.btnReapply} onClick={() => {
                          const msg = window.prompt("Reason for re-application:");
                          if (msg) handleUpdateStatus(app.id, "reapply", msg);
                        }}>
                          <RefreshCcw size={14} /> Fix
                        </button>
                        <button style={styles.btnReject} onClick={() => {
                          if (window.confirm("Permanently reject this applicant?")) {
                            handleUpdateStatus(app.id, "rejected_operator", "Verification Failed");
                          }
                        }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div style={styles.completionNote}>
                        <CheckCircle2 size={16} color="#10B981" /> Processed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (s) => {
  if (s === "approved") return "#10B981";
  if (s === "forwarded") return "#6366F1";
  if (s === "reapply") return "#3B82F6";
  if (s?.includes("rejected")) return "#EF4444";
  return "#F59E0B";
};

const getBadgeColors = (s) => {
  if (s === "approved") return { backgroundColor: "#ECFDF5", color: "#065F46" };
  if (s === "forwarded") return { backgroundColor: "#EEF2FF", color: "#3730A3" };
  if (s === "reapply") return { backgroundColor: "#EFF6FF", color: "#1E40AF" };
  if (s?.includes("rejected")) return { backgroundColor: "#FEF2F2", color: "#991B1B" };
  return { backgroundColor: "#FFFBEB", color: "#92400E" };
};

const styles = {
  pageWrapper: {
    background: "#F8FAFC",
    minHeight: "100vh",
    paddingTop: "120px",
    paddingBottom: "100px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 24px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "30px",
    border: "1px solid #E2E8F0",
  },
  liveText: {
    fontSize: "11px",
    color: "#10B981",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
    marginBottom: "40px",
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subTitle: {
    color: "#64748B",
    fontSize: "16px",
    margin: 0,
  },
  analyticsBar: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    backgroundColor: "#FFFFFF",
    padding: "20px 32px",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
  },
  statBox: {
    textAlign: "right",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "900",
    lineHeight: "1",
  },
  statDivider: {
    width: "1px",
    height: "30px",
    background: "#E2E8F0",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "20px 32px",
    backgroundColor: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
    fontSize: "12px",
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: "1px",
  },
  tableBody: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "1px solid #F1F5F9",
    transition: "background 0.2s",
  },
  cellIdentity: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
  },
  primaryText: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: "16px",
    marginBottom: "4px",
  },
  secondaryText: {
    fontSize: "13px",
    color: "#64748B",
    fontWeight: "500",
  },
  cellDetails: {
    flex: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  iconDetail: {
    fontSize: "14px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
  },
  cellStatus: {
    flex: 1,
    display: "flex",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  cellActions: {
    flex: 2,
    display: "flex",
    justifyContent: "flex-end",
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
  },
  btnVerify: {
    background: "#0F172A",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnReapply: {
    background: "#FFFFFF",
    color: "#475569",
    border: "1px solid #E2E8F0",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnReject: {
    background: "#FEF2F2",
    color: "#EF4444",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  completionNote: {
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#F8FAFC",
  },
  loaderText: {
    marginTop: "16px",
    color: "#64748B",
    fontSize: "15px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "100px 20px",
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    border: "1px dashed #CBD5E1",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "24px 0 8px",
  },
  emptyDesc: {
    color: "#64748B",
    fontSize: "16px",
    margin: 0,
  },
};

export default ApplicationsList;
