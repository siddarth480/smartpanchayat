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
  FaFolderOpen,
  FaUserTie,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronRight,
  FaInbox,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUndo,
} from "react-icons/fa";

const MemberSchemePanel = ({ user }) => {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  // Fetch all available schemes for the sidebar navigation
  useEffect(() => {
    const q = query(collection(db, "schemes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSchemes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadingSchemes(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for forwarded, approved, or rejected applications for the selected scheme
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

  // Handle Approve, Reject, and Re-apply actions
  const handleAction = async (id, action) => {
    let remark = "";
    let newStatus = "";

    if (action === "approve") {
      newStatus = "approved";
    } else if (action === "reject") {
      // Prompt for rejection reason
      remark = window.prompt("Enter the reason for Rejection:");
      if (remark === null) return;
      newStatus = "rejected_member";
    } else if (action === "reapply") {
      // Prompt for reason to send back for fixing
      remark = window.prompt(
        "Enter reason for requesting Re-application (Send Back):"
      );
      if (remark === null) return;
      newStatus = "reapply";
    }

    try {
      const appRef = doc(db, "schemeApplications", id);
      await updateDoc(appRef, {
        status: newStatus,
        memberRemark: remark, // Stored for the citizen's view
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
          <FaFolderOpen color="#6366f1" size={20} />
          <h2 style={styles.sidebarTitle}>Member Panel</h2>
        </div>

        <div style={styles.schemeNav}>
          <p style={styles.navLabel}>SELECT SCHEME</p>
          {loadingSchemes ? (
            <div style={styles.loader}>Loading...</div>
          ) : (
            schemes.map((scheme) => {
              const isActive = selectedScheme?.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  style={{
                    ...styles.schemeItem,
                    backgroundColor: isActive
                      ? "#EEF2FF"
                      : "rgba(241, 245, 249, 0.4)",
                    borderLeft: isActive
                      ? "4px solid #4F46E5"
                      : "4px solid transparent",
                    color: isActive ? "#4338CA" : "#64748B",
                  }}
                >
                  <span style={styles.schemeName}>{scheme.title}</span>
                  <FaChevronRight
                    size={10}
                    style={{ opacity: isActive ? 1 : 0.3 }}
                  />
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
            <FaInbox size={50} color="#CBD5E1" />
            <h2>No Scheme Selected</h2>
            <p>
              Select a scheme from the sidebar to manage citizen applications.
            </p>
          </div>
        ) : (
          <div style={styles.contentWrapper}>
            <header style={styles.contentHeader}>
              <h1 style={styles.mainHeading}>{selectedScheme.title}</h1>
              <div style={styles.badge}>{applications.length} TOTAL</div>
            </header>

            <div style={styles.appGrid}>
              {applications.map((app) => (
                <div key={app.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.applicantInfo}>
                      <div style={styles.avatar}>
                        <FaUserTie />
                      </div>
                      <div>
                        <div style={styles.name}>{app.applicantName}</div>
                        <div style={styles.idText}>Citizen Applicant</div>
                      </div>
                    </div>
                    <span
                      style={{
                        ...styles.statusTag,
                        ...getStatusStyle(app.status),
                      }}
                    >
                      {app.status.toUpperCase().replace("_", " ")}
                    </span>
                  </div>

                  {/* USER METADATA */}
                  <div style={styles.metaInfo}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>
                        <FaIdCard /> AADHAAR
                      </span>
                      <strong>{app.aadhaarNumber || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>
                        <FaPhoneAlt /> MOBILE
                      </span>
                      <strong>{app.mobile || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>
                        <FaMapMarkerAlt /> AREA
                      </span>
                      <strong>{app.district || "N/A"}</strong>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>
                        <FaCalendarAlt /> SUBMITTED
                      </span>
                      <strong>
                        {app.submittedAt?.seconds
                          ? new Date(
                              app.submittedAt.seconds * 1000
                            ).toLocaleDateString()
                          : "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.forwardingNote}>
                    Status check: Forwarded by{" "}
                    <strong>{app.reviewedBy || "Operator"}</strong>
                  </div>

                  {/* ACTION BUTTONS (Only visible for forwarded status) */}
                  {app.status === "forwarded" && (
                    <div style={styles.actionRow}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleAction(app.id, "approve")}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        style={styles.reapplyBtn}
                        onClick={() => handleAction(app.id, "reapply")}
                      >
                        <FaUndo /> Send Back
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleAction(app.id, "reject")}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  )}

                  {/* DISPLAY REMARK (If Rejected or Sent Back) */}
                  {(app.status === "rejected_member" ||
                    app.status === "reapply") &&
                    app.memberRemark && (
                      <div style={styles.remarkBox}>
                        <strong>Note to Citizen:</strong> {app.memberRemark}
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
  if (s === "approved") return { background: "#D1FAE5", color: "#065F46" };
  if (s === "forwarded") return { background: "#E0E7FF", color: "#3730A3" };
  if (s === "reapply") return { background: "#FEF3C7", color: "#92400E" };
  return { background: "#FEE2E2", color: "#991B1B" };
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
    background: "#fff",
    borderRight: "1px solid #E2E8F0",
    padding: "30px 20px",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
    paddingLeft: "10px",
  },
  sidebarTitle: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#0F172A",
    margin: 0,
  },
  navLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: "1px",
    marginBottom: "15px",
    paddingLeft: "10px",
  },
  schemeNav: { display: "flex", flexDirection: "column", gap: "10px" },
  schemeItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  schemeName: {
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mainArea: { flex: 1, padding: "40px", overflowY: "auto" },
  emptyState: { textAlign: "center", marginTop: "150px", color: "#94A3B8" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto" },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  mainHeading: { fontSize: "24px", fontWeight: "900", color: "#0F172A" },
  badge: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748B",
  },
  appGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  applicantInfo: { display: "flex", gap: "12px", alignItems: "center" },
  avatar: {
    width: "40px",
    height: "40px",
    background: "#F1F5F9",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748B",
  },
  name: { fontWeight: "800", color: "#1E293B", fontSize: "18px" },
  idText: { fontSize: "12px", color: "#94A3B8", marginTop: "2px" },
  statusTag: {
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
  },
  metaInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
    padding: "20px 0",
    borderTop: "1px solid #F1F5F9",
  },
  metaItem: { display: "flex", flexDirection: "column", gap: "6px" },
  metaLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  forwardingNote: {
    fontSize: "13px",
    color: "#64748B",
    marginBottom: "20px",
    padding: "10px 14px",
    background: "#F8FAFC",
    borderRadius: "10px",
  },
  actionRow: { display: "flex", gap: "8px" },
  approveBtn: {
    flex: 1,
    background: "#10B981",
    color: "#fff",
    border: "none",
    padding: "12px 5px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "11px",
  },
  rejectBtn: {
    flex: 1,
    background: "#EF4444",
    color: "#fff",
    border: "none",
    padding: "12px 5px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "11px",
  },
  reapplyBtn: {
    flex: 1,
    background: "#F59E0B",
    color: "#fff",
    border: "none",
    padding: "12px 5px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "11px",
  },
  remarkBox: {
    background: "#F8FAFC",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#475569",
    borderLeft: "4px solid #CBD5E1",
    marginTop: "10px",
  },
  loader: { textAlign: "center", padding: "20px", color: "#64748B" },
};

export default MemberSchemePanel;
