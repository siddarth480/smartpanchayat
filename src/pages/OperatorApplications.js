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
      // Sort: Pending items first
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
    total: applications.length,
    pending: applications.filter(
      (a) => a.status === "pending" || a.status === "pending_operator"
    ).length,
    forwarded: applications.filter((a) => a.status === "forwarded").length,
    verified: applications.filter((a) => a.status === "approved").length,
  };

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.syncText}>Accessing Secure Data...</p>
      </div>
    );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* Breadcrumb & Live Indicator */}
        <div style={styles.navbar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <span style={styles.backIcon}>←</span> Schemes /{" "}
            <span style={{ color: "#0f172a" }}>Applications</span>
          </button>
          <div style={styles.liveIndicator}>
            <div style={styles.pulseDot}></div>
            <span style={styles.liveText}>LIVE MONITORING</span>
          </div>
        </div>

        {/* Dashboard Header */}
        <div style={styles.heroSection}>
          <div>
            <h1 style={styles.mainTitle}>
              {schemeTitle || "Application Management"}
            </h1>
            <p style={styles.subTitle}>
              High-authority verification and routing portal.
            </p>
          </div>

          <div style={styles.analyticsBar}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>PENDING</span>
              <span style={{ ...styles.statValue, color: "#f59e0b" }}>
                {stats.pending}
              </span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>FORWARDED</span>
              <span style={{ ...styles.statValue, color: "#6366f1" }}>
                {stats.forwarded}
              </span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>VERIFIED</span>
              <span style={{ ...styles.statValue, color: "#10b981" }}>
                {stats.verified}
              </span>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>∅</div>
            <h3 style={styles.emptyTitle}>Queue is Clear</h3>
            <p style={styles.emptyDesc}>
              No citizen applications require attention at this time.
            </p>
          </div>
        ) : (
          <div style={styles.dataList}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 2 }}>APPLICANT IDENTITY</span>
              <span style={{ flex: 1.5 }}>CONTACT & LOCATION</span>
              <span style={{ flex: 1, textAlign: "center" }}>
                CURRENT STATUS
              </span>
              <span style={{ flex: 2, textAlign: "right" }}>ACTIONS</span>
            </div>

            {applications.map((app) => (
              <div key={app.id} style={styles.row}>
                <div
                  style={{
                    ...styles.accentBorder,
                    background: getStatusColor(app.status),
                  }}
                ></div>

                {/* Identity */}
                <div style={styles.cellIdentity}>
                  <div
                    style={{
                      ...styles.avatar,
                      border: `2px solid ${getStatusColor(app.status)}22`,
                    }}
                  >
                    {app.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div style={styles.primaryText}>
                      {app.name || app.applicantName}
                    </div>
                    <div style={styles.secondaryText}>
                      ID: {app.aadhaar || app.aadhaarNumber}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={styles.cellDetails}>
                  <div style={styles.iconDetail}>
                    <span style={styles.miniIcon}>📞</span> {app.mobile}
                  </div>
                  <div style={styles.iconDetail}>
                    <span style={styles.miniIcon}>📍</span> {app.district}
                  </div>
                </div>

                {/* Status */}
                <div style={styles.cellStatus}>
                  <span
                    style={{
                      ...styles.statusTag,
                      ...getBadgeColors(app.status),
                    }}
                  >
                    {app.status?.toUpperCase().replace("_", " ")}
                  </span>
                </div>

                {/* Actions */}
                <div style={styles.cellActions}>
                  {["pending", "pending_operator"].includes(app.status) ? (
                    <div style={styles.btnGroup}>
                      <button
                        style={styles.btnVerify}
                        onClick={() =>
                          handleUpdateStatus(
                            app.id,
                            "forwarded",
                            "Verified by Operator."
                          )
                        }
                      >
                        Forward
                      </button>
                      <button
                        style={styles.btnReapply}
                        onClick={() => {
                          const msg = window.prompt(
                            "Reason for re-application:"
                          );
                          if (msg) handleUpdateStatus(app.id, "reapply", msg);
                        }}
                      >
                        Request Fix
                      </button>
                      <button
                        style={styles.btnReject}
                        onClick={() => {
                          if (
                            window.confirm("Permanently reject this applicant?")
                          ) {
                            handleUpdateStatus(
                              app.id,
                              "rejected_operator",
                              "Verification Failed"
                            );
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div style={styles.completionNote}>
                      <span style={styles.checkIcon}>✓</span> Processed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (s) => {
  if (s === "approved") return "#10b981";
  if (s === "forwarded") return "#6366f1";
  if (s === "reapply") return "#3b82f6";
  if (s?.includes("rejected")) return "#ef4444";
  return "#f59e0b";
};

const getBadgeColors = (s) => {
  if (s === "approved") return { background: "#D1FAE5", color: "#065f46" };
  if (s === "forwarded") return { background: "#E0E7FF", color: "#3730a3" };
  if (s === "reapply") return { background: "#DBEAFE", color: "#1e40af" };
  if (s?.includes("rejected"))
    return { background: "#FEE2E2", color: "#991b1b" };
  return { background: "#FEF3C7", color: "#92400e" };
};

const styles = {
  pageWrapper: {
    background: "#f1f5f9",
    minHeight: "100vh",
    paddingTop: "140px",
    paddingBottom: "100px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    letterSpacing: "-0.2px",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    padding: "6px 14px",
    borderRadius: "30px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  liveText: {
    fontSize: "10px",
    color: "#10b981",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
    animation: "pulse 2s infinite",
  },

  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    background: "#fff",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
  },
  mainTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0f172a",
    margin: 0,
  },
  subTitle: { color: "#64748b", fontSize: "15px", marginTop: "4px" },

  analyticsBar: { display: "flex", alignItems: "center", gap: "24px" },
  statBox: { textAlign: "right" },
  statLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  statValue: { fontSize: "24px", fontWeight: "900", display: "block" },
  statDivider: { width: "1px", height: "30px", background: "#e2e8f0" },

  tableHeader: {
    display: "flex",
    padding: "0 32px 16px 32px",
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  dataList: { display: "flex", flexDirection: "column", gap: "12px" },
  row: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    position: "relative",
    overflow: "hidden",
  },
  accentBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "4px",
  },

  cellIdentity: { display: "flex", alignItems: "center", gap: "16px", flex: 2 },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#1e293b",
  },
  primaryText: { fontWeight: "750", color: "#0f172a", fontSize: "15.5px" },
  secondaryText: { fontSize: "12.5px", color: "#94a3b8", marginTop: "2px" },

  cellDetails: {
    flex: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  iconDetail: {
    fontSize: "13.5px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  miniIcon: { opacity: 0.7 },

  cellStatus: { flex: 1, display: "flex", justifyContent: "center" },
  statusTag: {
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "10.5px",
    fontWeight: "800",
  },

  cellActions: { flex: 2, display: "flex", justifyContent: "flex-end" },
  btnGroup: { display: "flex", gap: "8px" },
  btnVerify: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.2s",
  },
  btnReapply: {
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnReject: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  completionNote: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  checkIcon: { color: "#10b981", fontSize: "16px" },

  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  syncText: {
    marginTop: "16px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "-0.2px",
  },

  emptyState: { textAlign: "center", padding: "120px 0" },
  emptyIcon: { fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" },
  emptyTitle: { fontSize: "20px", fontWeight: "800", color: "#475569" },
  emptyDesc: { color: "#94a3b8", fontSize: "15px" },
};

export default ApplicationsList;
