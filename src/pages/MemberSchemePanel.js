import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  FolderOpen,
  User,
  Fingerprint,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCcw,
  ChevronRight,
  Inbox,
  AlertCircle
} from "lucide-react";

const MemberSchemePanel = ({ user }) => {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "schemes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSchemes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadingSchemes(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedScheme) return;
    const q = query(
      collection(db, "schemeApplications"),
      where("schemeId", "==", selectedScheme.id),
      where("status", "in", [
        "forwarded",
        "approved",
        "rejected_member",
        "reapply",
      ])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, [selectedScheme]);

  const handleAction = async (id, action) => {
    let remark = "";
    let newStatus = "";

    if (action === "approve") {
      newStatus = "approved";
    } else if (action === "reject") {
      remark = window.prompt("Enter the reason for Rejection:");
      if (remark === null) return;
      newStatus = "rejected_member";
    } else if (action === "reapply") {
      remark = window.prompt("Enter reason for requesting Re-application (Fix Note):");
      if (remark === null) return;
      newStatus = "reapply";
    }

    try {
      const appRef = doc(db, "schemeApplications", id);
      await updateDoc(appRef, {
        status: newStatus,
        memberRemark: remark,
        reviewedByMember: user?.fullName || "Member",
        reviewedAtMember: new Date(),
      });
    } catch (err) {
      console.error("Action failed:", err);
      alert("Failed to process action. Please try again.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.iconBox}>
            <FolderOpen color="#2563EB" size={20} />
          </div>
          <h2 style={styles.sidebarTitle}>Member Review</h2>
        </div>

        <div style={styles.schemeNav}>
          <p style={styles.navLabel}>SCHEME REGISTRY</p>
          {loadingSchemes ? (
            <div style={styles.loader}>Loading schemes...</div>
          ) : (
            schemes.map((scheme) => {
              const isActive = selectedScheme?.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  style={{
                    ...styles.schemeItem,
                    backgroundColor: isActive ? "#EFF6FF" : "transparent",
                    color: isActive ? "#1E3A8A" : "#475569",
                  }}
                >
                  <span style={{...styles.schemeName, fontWeight: isActive ? "700" : "500"}}>{scheme.title}</span>
                  <ChevronRight size={16} style={{ opacity: isActive ? 1 : 0 }} />
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainArea}>
        {!selectedScheme ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconCircle}>
              <Inbox size={48} color="#94A3B8" />
            </div>
            <h2 style={styles.emptyTitle}>Select a Scheme</h2>
            <p style={styles.emptyDesc}>Choose a scheme from the sidebar to review citizen applications.</p>
          </div>
        ) : (
          <div style={styles.contentWrapper}>
            <header style={styles.contentHeader}>
              <div>
                <h1 style={styles.mainHeading}>{selectedScheme.title}</h1>
                <p style={styles.subHeading}>Final approval review stage</p>
              </div>
              <div style={styles.badge}>{applications.length} PENDING REVIEW</div>
            </header>

            <div style={styles.appGrid}>
              {applications.map((app) => (
                <div key={app.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.applicantInfo}>
                      <div style={styles.avatar}>
                        <User size={20} />
                      </div>
                      <div>
                        <div style={styles.name}>{app.applicantName}</div>
                        <div style={styles.idText}>Applicant Details</div>
                      </div>
                    </div>
                    <span style={{ ...styles.statusTag, ...getStatusStyle(app.status) }}>
                      {app.status.toUpperCase().replace("_", " ")}
                    </span>
                  </div>

                  <div style={styles.metaInfo}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}><Fingerprint size={12}/> AADHAAR</span>
                      <strong>{app.aadhaarNumber || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}><Phone size={12}/> MOBILE</span>
                      <strong>{app.mobile || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}><MapPin size={12}/> AREA</span>
                      <strong>{app.district || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}><Calendar size={12}/> SUBMITTED</span>
                      <strong>
                        {app.submittedAt?.seconds
                          ? new Date(app.submittedAt.seconds * 1000).toLocaleDateString()
                          : "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.forwardingNote}>
                    <CheckCircle size={14} color="#10B981" /> 
                    <span>Operator Initial Verification: <strong>Passed</strong></span>
                  </div>

                  {app.status === "forwarded" && (
                    <div style={styles.actionRow}>
                      <button style={styles.approveBtn} onClick={() => handleAction(app.id, "approve")}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button style={styles.reapplyBtn} onClick={() => handleAction(app.id, "reapply")}>
                        <RefreshCcw size={14} /> Send Fix Note
                      </button>
                      <button style={styles.rejectBtn} onClick={() => handleAction(app.id, "reject")}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {(app.status === "rejected_member" || app.status === "reapply") && app.memberRemark && (
                    <div style={styles.remarkBox}>
                      <AlertCircle size={16} />
                      <div>
                        <strong>Your Note to Citizen:</strong>
                        <p style={{margin: "4px 0 0 0"}}>{app.memberRemark}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const getStatusStyle = (s) => {
  if (s === "approved") return { background: "#ECFDF5", color: "#065F46" };
  if (s === "forwarded") return { background: "#EEF2FF", color: "#3730A3" };
  if (s === "reapply") return { background: "#FEF3C7", color: "#92400E" };
  return { background: "#FEF2F2", color: "#991B1B" };
};

const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#F8FAFC",
    paddingTop: "80px",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "320px",
    background: "#FFFFFF",
    borderRight: "1px solid #E2E8F0",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    backgroundColor: "#EFF6FF",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarTitle: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#0F172A",
    margin: 0,
  },
  navLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: "1px",
    marginBottom: "16px",
    paddingLeft: "12px",
  },
  schemeNav: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px" 
  },
  schemeItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  schemeName: {
    fontSize: "15px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  loader: { 
    padding: "20px 12px", 
    color: "#64748B",
    fontSize: "14px",
  },
  mainArea: { 
    flex: 1, 
    padding: "40px 60px", 
    overflowY: "auto",
    backgroundColor: "#F8FAFC",
  },
  emptyState: { 
    textAlign: "center", 
    marginTop: "150px", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px"
  },
  emptyIconCircle: {
    width: "100px",
    height: "100px",
    backgroundColor: "#F1F5F9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  emptyDesc: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
  },
  contentWrapper: { 
    maxWidth: "1200px", 
    margin: "0 auto" 
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
  },
  mainHeading: { 
    fontSize: "32px", 
    fontWeight: "900", 
    color: "#0F172A",
    margin: "0 0 8px 0"
  },
  subHeading: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
  },
  badge: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#475569",
    letterSpacing: "0.5px",
  },
  appGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "30px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "32px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  applicantInfo: { display: "flex", gap: "16px", alignItems: "center" },
  avatar: {
    width: "48px",
    height: "48px",
    background: "#F8FAFC",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748B",
  },
  name: { fontWeight: "800", color: "#0F172A", fontSize: "18px", marginBottom: "4px" },
  idText: { fontSize: "13px", color: "#64748B" },
  statusTag: {
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  metaInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
    padding: "24px 0",
    borderTop: "1px solid #F1F5F9",
    borderBottom: "1px solid #F1F5F9",
  },
  metaItem: { display: "flex", flexDirection: "column", gap: "8px" },
  metaLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  forwardingNote: {
    fontSize: "14px",
    color: "#0F172A",
    marginBottom: "24px",
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionRow: { display: "flex", gap: "12px" },
  approveBtn: {
    flex: 1,
    background: "#10B981",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 10px",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
  },
  reapplyBtn: {
    flex: 1,
    background: "#F59E0B",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 10px",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
  },
  rejectBtn: {
    flex: 1,
    background: "#EF4444",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 10px",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
  },
  remarkBox: {
    background: "#FFFBEB",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "14px",
    color: "#92400E",
    border: "1px solid #FEF3C7",
    marginTop: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
};

export default MemberSchemePanel;
