// src/pages/OperatorComplaints.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot, // ✅ Changed from getDocs to onSnapshot
} from "firebase/firestore";
import {
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiExternalLink,
  FiSend,
  FiInbox,
  FiActivity,
} from "react-icons/fi";

const OperatorComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // ✅ Setup Real-time Listener
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const complaintData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintData);
        setLoading(false);
      },
      (error) => {
        console.error("Real-time fetch error:", error);
        setLoading(false);
      }
    );

    // ✅ Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleSuggest = async (id) => {
    if (!suggestions[id]) return;
    try {
      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, {
        operatorSuggestion: suggestions[id],
        operatorId: user?.uid,
      });
      alert("Suggestion submitted ✅");

      // Note: We don't manually update 'setComplaints' here
      // because onSnapshot will automatically detect the change and update the UI
      setSuggestions((prev) => ({ ...prev, [id]: "" }));
    } catch (error) {
      console.error("Error submitting suggestion:", error);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status !== "resolved").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "pending") return c.status !== "resolved";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  if (loading) return <div style={styles.loader}>Initializing Portal...</div>;

  return (
    <div style={styles.page}>
      {/* ... (Keep the rest of your JSX exactly the same) ... */}
      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Operator Dashboard</h1>
          <p style={styles.subtitle}>
            Review and provide professional guidance on villager issues.
          </p>
        </div>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <FiInbox style={styles.metricIcon} color="#2563eb" />
            <div>
              <span style={styles.metricVal}>{stats.total}</span>
              <div style={styles.metricLabel}>Total</div>
            </div>
          </div>
          <div style={styles.metricCard}>
            <FiActivity style={styles.metricIcon} color="#d97706" />
            <div>
              <span style={styles.metricVal}>{stats.pending}</span>
              <div style={styles.metricLabel}>Awaiting</div>
            </div>
          </div>
          <div style={styles.metricCard}>
            <FiCheckCircle style={styles.metricIcon} color="#059669" />
            <div>
              <span style={styles.metricVal}>{stats.resolved}</span>
              <div style={styles.metricLabel}>Resolved</div>
            </div>
          </div>
        </div>
      </header>

      <div style={styles.filterBar}>
        {["all", "pending", "resolved"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{ ...styles.tab, ...(filter === t ? styles.activeTab : {}) }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filteredComplaints.length === 0 ? (
          <div style={styles.empty}>No complaints found in this category.</div>
        ) : (
          filteredComplaints.map((complaint) => {
            const isResolved = complaint.status?.toLowerCase() === "resolved";
            return (
              <div key={complaint.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.userSection}>
                    <div style={styles.avatar}>
                      <FiUser />
                    </div>
                    <div>
                      <h3 style={styles.userName}>
                        {complaint.userName || "Villager"}
                      </h3>
                      <span style={styles.date}>
                        {complaint.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: isResolved ? "#ecfdf5" : "#fff7ed",
                      color: isResolved ? "#059669" : "#c2410c",
                    }}
                  >
                    {isResolved ? <FiCheckCircle /> : <FiClock />}{" "}
                    {isResolved ? "Resolved" : "Pending"}
                  </span>
                </div>

                <div style={styles.body}>
                  <p style={styles.description}>{complaint.description}</p>

                  {complaint.imageUrl && (
                    <div style={styles.imgContainer}>
                      <img
                        src={complaint.imageUrl}
                        alt="Proof"
                        style={styles.image}
                      />
                      <a
                        href={complaint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.expandImg}
                      >
                        <FiExternalLink /> Full View
                      </a>
                    </div>
                  )}
                </div>

                <div style={styles.footer}>
                  {complaint.operatorSuggestion ? (
                    <div style={styles.suggestionBox}>
                      <div style={styles.suggHeader}>
                        <FiMessageSquare /> Your Guidance
                      </div>
                      <p style={styles.suggText}>
                        {complaint.operatorSuggestion}
                      </p>
                    </div>
                  ) : (
                    !isResolved && (
                      <div style={styles.actionArea}>
                        <textarea
                          style={styles.textarea}
                          placeholder="Provide technical advice or steps for the Sarpanch..."
                          value={suggestions[complaint.id] || ""}
                          onChange={(e) =>
                            setSuggestions({
                              ...suggestions,
                              [complaint.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          style={styles.submitBtn}
                          onClick={() => handleSuggest(complaint.id)}
                        >
                          <FiSend /> Submit Suggestion
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ... (Keep styles object the same)
const styles = {
  page: {
    padding: "100px 5% 60px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  loader: {
    textAlign: "center",
    marginTop: "150px",
    fontSize: "18px",
    color: "#64748b",
  },
  header: { marginBottom: "40px" },
  headerText: { marginBottom: "25px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "5px" },
  metricsRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  metricCard: {
    flex: 1,
    minWidth: "200px",
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid #e2e8f0",
  },
  metricIcon: { fontSize: "24px", opacity: 0.8 },
  metricVal: { fontSize: "24px", fontWeight: "700", color: "#0f172a" },
  metricLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  filterBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "10px",
  },
  tab: {
    padding: "8px 16px",
    border: "none",
    background: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    transition: "0.2s",
  },
  activeTab: {
    backgroundColor: "#fff",
    color: "#2563eb",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
  },
  cardTop: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fafafa",
  },
  userSection: { display: "flex", gap: "12px", alignItems: "center" },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  userName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
  },
  date: { fontSize: "12px", color: "#94a3b8" },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: "800",
    padding: "6px 12px",
    borderRadius: "100px",
    textTransform: "uppercase",
  },

  body: { padding: "20px" },
  description: {
    fontSize: "15px",
    color: "#334155",
    lineHeight: "1.6",
    margin: "0 0 20px",
  },
  imgContainer: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
  },
  image: { width: "100%", display: "block" },
  expandImg: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  footer: { padding: "0 20px 20px", marginTop: "auto" },
  suggestionBox: {
    background: "#f0fdfa",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #ccfbf1",
  },
  suggHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0d9488",
    marginBottom: "8px",
  },
  suggText: {
    margin: 0,
    fontSize: "14px",
    color: "#134e4a",
    lineHeight: "1.5",
  },

  actionArea: { display: "flex", flexDirection: "column", gap: "10px" },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    resize: "none",
    boxSizing: "border-box",
  },
  submitBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  empty: {
    textAlign: "center",
    gridColumn: "1/-1",
    padding: "60px",
    color: "#94a3b8",
    fontSize: "16px",
  },
};

export default OperatorComplaints;
