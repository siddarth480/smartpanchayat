// src/pages/AcknowledgeComplaints.js
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  FiInbox,
  FiCheckCircle,
  FiUser,
  FiMessageSquare,
  FiImage,
  FiCalendar,
  FiArrowRight,
  FiLayers,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";

const AcknowledgeComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const [acknowledgements, setAcknowledgements] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("toUserRole", "==", "sarpanch")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComplaints(data);

      // Check if the currently selected complaint actually belongs to the active tab
      const currentSelected = data.find((c) => c.id === selectedId);

      if (!currentSelected || currentSelected.status !== activeTab) {
        // If it doesn't belong or nothing is selected, try to find the first one in the current tab
        const firstInTab = data.find((c) => c.status === activeTab);
        setSelectedId(firstInTab ? firstInTab.id : null);
      }
    });
    return unsub;
  }, [activeTab, selectedId]);

  const handleResolve = async (id) => {
    const text = acknowledgements[id]?.trim();
    if (!text) return alert("Please enter official acknowledgement.");
    try {
      await updateDoc(doc(db, "complaints", id), {
        status: "resolved",
        acknowledgement: text,
        resolvedAt: Timestamp.now(),
        resolvedBy: user.fullName || "Sarpanch Office",
      });
      alert("Complaint Resolved Successfully ✅");
      setAcknowledgements((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  const filtered = complaints.filter((c) => c.status === activeTab);
  const selectedComplaint = complaints.find((c) => c.id === selectedId);

  // Dynamic Statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div style={styles.appWrapper}>
      <style>{`
        .list-item { transition: 0.2s; border-left: 4px solid transparent; }
        .list-item:hover { background: #f1f5f9; }
        .active-item { background: #eff6ff !important; border-left-color: #2563eb !important; }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @media (max-width: 1024px) {
          .main-content { flex-direction: column !important; }
          .side-list { width: 100% !important; height: 350px !important; border-right: none !important; }
          .metrics-row { overflow-x: auto; padding-bottom: 10px; }
        }
      `}</style>

      {/* 1. LEFT ICON SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <FiLayers size={24} />
        </div>
        <div style={styles.navGroup}>
          <button
            onClick={() => {
              setActiveTab("pending");
              setSelectedId(null); // Clear selection when switching
            }}
            style={{
              ...styles.navIcon,
              ...(activeTab === "pending" ? styles.navActive : {}),
            }}
          >
            <FiActivity size={20} />
            <small>Active</small>
          </button>

          <button
            onClick={() => {
              setActiveTab("resolved");
              setSelectedId(null); // Clear selection when switching
            }}
            style={{
              ...styles.navIcon,
              ...(activeTab === "resolved" ? styles.navActive : {}),
            }}
          >
            <FiCheckCircle size={20} />
            <small>History</small>
          </button>
        </div>
      </aside>

      <div style={styles.mainArea}>
        {/* 2. TOP METRICS HEADER */}
        <header style={styles.header}>
          <div style={styles.welcome}>
            <h2 style={styles.title}>Sarpanch Administration</h2>
            <p style={styles.subtitle}>
              Manage village reports and executive decisions.
            </p>
          </div>

          <div className="metrics-row" style={styles.metricsRow}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNum}>{stats.total}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
              <FiInbox color="#64748b" />
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statNum, color: "#f59e0b" }}>
                  {stats.pending}
                </span>
                <span style={styles.statLabel}>Awaiting</span>
              </div>
              <FiAlertCircle color="#f59e0b" />
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statNum, color: "#10b981" }}>
                  {stats.resolved}
                </span>
                <span style={styles.statLabel}>Resolved</span>
              </div>
              <FiCheckCircle color="#10b981" />
            </div>
          </div>
        </header>

        {/* 3. MULTI-COLUMN CONTENT */}
        <div className="main-content" style={styles.contentBody}>
          {/* List Column */}
          <div className="side-list" style={styles.listColumn}>
            <div style={styles.listHeader}>
              <FiInbox /> {activeTab.toUpperCase()} INBOX
            </div>
            {filtered.length === 0 ? (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIconCircle}>
                  <FiInbox size={32} color="#cbd5e1" />
                </div>
                <p style={styles.emptyText}>No {activeTab} reports</p>
                <span style={styles.emptySubText}>
                  New items will appear here
                </span>
              </div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className={`list-item ${
                    selectedId === c.id ? "active-item" : ""
                  }`}
                  onClick={() => setSelectedId(c.id)}
                  style={styles.listItem}
                >
                  <div style={styles.itemTop}>
                    <span style={styles.itemUser}>{c.userName}</span>
                    <span style={styles.itemDate}>
                      {c.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p style={styles.itemDesc}>
                    {c.description.substring(0, 40)}...
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Detailed View Column */}
          <div style={styles.detailColumn}>
            {selectedComplaint ? (
              <div style={styles.detailCanvas}>
                <div style={styles.detailHeader}>
                  <div style={styles.userBrief}>
                    <div style={styles.avatar}>
                      {selectedComplaint.userName
                        ? selectedComplaint.userName[0]
                        : "U"}
                    </div>
                    <div>
                      <h3 style={styles.userName}>
                        {selectedComplaint.userName || "Unknown User"}
                      </h3>
                      <span style={styles.idLabel}>
                        Ticket: #{selectedComplaint.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        activeTab === "pending" ? "#fef3c7" : "#d1fae5",
                      color: activeTab === "pending" ? "#d97706" : "#059669",
                    }}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>

                <div style={styles.scrollContent}>
                  <div style={styles.section}>
                    <label style={styles.secTitle}>Complaint Details</label>
                    <p style={styles.mainText}>
                      {selectedComplaint.description}
                    </p>
                    {selectedComplaint.imageUrl && (
                      <div style={styles.imageBox}>
                        <img
                          src={selectedComplaint.imageUrl}
                          style={styles.attachment}
                          alt="proof"
                        />
                        <a
                          href={selectedComplaint.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          <FiImage /> View High-Resolution Photo
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedComplaint.operatorSuggestion && (
                    <div style={styles.suggestionBox}>
                      <h4 style={styles.suggTitle}>
                        <FiMessageSquare /> Operator Recommendation
                      </h4>
                      <p style={styles.suggText}>
                        {selectedComplaint.operatorSuggestion}
                      </p>
                    </div>
                  )}

                  <div style={styles.actionArea}>
                    {activeTab === "pending" ? (
                      <div style={styles.formCard}>
                        <label style={styles.secTitle}>
                          Administrative Resolution
                        </label>
                        <textarea
                          style={styles.textarea}
                          placeholder="Detail the actions taken by the Gram Panchayat..."
                          value={acknowledgements[selectedComplaint.id] || ""}
                          onChange={(e) =>
                            setAcknowledgements({
                              ...acknowledgements,
                              [selectedComplaint.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          style={styles.submitBtn}
                          onClick={() => handleResolve(selectedComplaint.id)}
                        >
                          Complete & Close Case <FiArrowRight />
                        </button>
                      </div>
                    ) : (
                      <div style={styles.resolvedCard}>
                        <label style={styles.secTitle}>Resolution Log</label>
                        <p style={styles.ackText}>
                          <strong>Final Note:</strong>{" "}
                          {selectedComplaint.acknowledgement}
                        </p>
                        <p style={styles.ackMeta}>
                          Resolved by {selectedComplaint.resolvedBy} on{" "}
                          {selectedComplaint.resolvedAt
                            ?.toDate()
                            .toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noSelectContainer}>
                <div style={styles.illustrationWrap}>
                  <FiLayers size={60} color="#e2e8f0" />
                  <div style={styles.pulseRing}></div>
                </div>
                <h3 style={styles.noSelectTitle}>Administrative Overview</h3>
                <p style={styles.noSelectDesc}>
                  Select a record from the inbox to review documentation, <br />
                  operator guidance, and finalize resolution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  appWrapper: {
    display: "flex",
    height: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "80px",
    position: "relative",
    top: "80px",
    background: "#1e293b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 0",
  },
  logo: {
    width: "45px",
    height: "45px",
    background: "#2563eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    marginBottom: "40px",
  },
  navGroup: { display: "flex", flexDirection: "column", gap: "24px" },
  navIcon: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "700",
  },
  navActive: { color: "#fff" },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "100px 30px 0 30px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  welcome: { flex: 1 },
  title: { margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" },
  subtitle: { margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" },

  metricsRow: { display: "flex", gap: "15px" },
  statCard: {
    background: "#fff",
    padding: "15px 20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minWidth: "150px",
  },
  statInfo: { display: "flex", flexDirection: "column" },
  statNum: { fontSize: "22px", fontWeight: "800", color: "#0f172a" },
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  contentBody: {
    flex: 1,
    display: "flex",
    gap: "25px",
    overflow: "hidden",
    paddingBottom: "30px",
  },
  listColumn: {
    width: "320px",
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  listHeader: {
    padding: "20px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  listItem: {
    padding: "20px",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  itemUser: { fontWeight: "700", color: "#1e293b", fontSize: "14px" },
  itemDate: { fontSize: "11px", color: "#94a3b8" },
  itemDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  detailColumn: { flex: 1, overflowY: "auto" },
  detailCanvas: {
    background: "#fff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  detailHeader: {
    padding: "25px 30px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userBrief: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "45px",
    height: "45px",
    background: "#f1f5f9",
    color: "#2563eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
  },
  userName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
  },
  idLabel: { fontSize: "12px", color: "#94a3b8" },
  badge: {
    padding: "5px 12px",
    borderRadius: "100px",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  scrollContent: {
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  secTitle: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
    display: "block",
  },
  mainText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#334155",
    margin: 0,
  },
  imageBox: { marginTop: "15px" },
  attachment: {
    width: "100%",
    borderRadius: "16px",
    marginBottom: "10px",
    border: "1px solid #e2e8f0",
  },
  link: {
    fontSize: "13px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  suggestionBox: {
    padding: "20px",
    background: "#f0f9ff",
    borderRadius: "16px",
    borderLeft: "4px solid #0ea5e9",
  },
  suggTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: "10px",
  },
  suggText: {
    fontSize: "14px",
    color: "#0c4a6e",
    margin: 0,
    fontStyle: "italic",
  },

  formCard: {
    padding: "25px",
    background: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    marginBottom: "15px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "0.2s",
  },

  resolvedCard: {
    padding: "20px",
    background: "#f0fdf4",
    borderRadius: "16px",
    border: "1px solid #dcfce7",
  },
  ackText: {
    fontSize: "14px",
    color: "#166534",
    margin: "0 0 5px 0",
    lineHeight: "1.5",
  },
  ackMeta: { fontSize: "12px", color: "#15803d", opacity: 0.8, margin: 0 },

  /* --- Empty State Styles --- */
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    flex: 1,
  },
  emptyIconCircle: {
    width: "64px",
    height: "64px",
    backgroundColor: "#f8fafc",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    border: "1px solid #f1f5f9",
  },
  emptyText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569",
    margin: "0 0 4px 0",
  },
  emptySubText: { fontSize: "12px", color: "#94a3b8" },
  noSelectContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "24px",
    border: "1px dashed #e2e8f0",
  },
  illustrationWrap: { position: "relative", marginBottom: "24px" },
  noSelectTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  noSelectDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    textAlign: "center",
  },
  pulseRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "2px solid #f1f5f9",
    animation: "pulse 2s infinite",
  },
};

export default AcknowledgeComplaints;
