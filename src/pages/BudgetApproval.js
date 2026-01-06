import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock, 
  FileSearch,
  IndianRupee,
  Calendar,
  ChevronRight,
} from "lucide-react";

const BudgetApproval = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const qPending = query(
      collection(db, "villageBudget"),
      where("status", "==", "pending"),
      orderBy("date", "desc")
    );

    const qHistory = query(
      collection(db, "villageBudget"),
      where("status", "in", ["approved", "rejected"]),
      orderBy("date", "desc")
    );

    const unsubPending = onSnapshot(qPending, (snap) => {
      if (isMounted) {
        setPendingItems(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      }
    });

    const unsubHistory = onSnapshot(qHistory, (snap) => {
      if (isMounted) {
        setHistoryItems(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    });

    return () => {
      isMounted = false;
      unsubPending();
      unsubHistory();
    };
  }, []);

  const handleAction = async (id, status) => {
    const confirmAction = window.confirm(
      `Authorize this transaction as ${status.toUpperCase()}?`
    );
    if (!confirmAction) return;

    try {
      const docRef = doc(db, "villageBudget", id);
      await updateDoc(docRef, {
        status: status,
        actionDate: new Date(),
      });
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* Header Section */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Budget Approvals</h1>
            <p style={styles.subtitle}>
              Execute financial oversight and verify village expenditures.
            </p>
          </div>
          
        </header>

        {/* --- PENDING SECTION --- */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <Clock size={18} color="#f59e0b" /> Pending Review
            </h3>
            <span style={styles.countBadge}>{pendingItems.length} tasks</span>
          </div>

          {pendingItems.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckCircle size={40} color="#cbd5e1" />
              <p>Everything is up to date.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {pendingItems.map((item) => (
                <div key={item.id} style={styles.approvalCard}>
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.typeLabel,
                        backgroundColor:
                          item.type === "income" ? "#ecfdf5" : "#fff1f2",
                        color: item.type === "income" ? "#065f46" : "#be123c",
                      }}
                    >
                      {item.type}
                    </span>
                    <div style={styles.dateLabel}>
                      <Calendar size={13} />
                      {item.date?.seconds
                        ? new Date(
                            item.date.seconds * 1000
                          ).toLocaleDateString()
                        : "New"}
                    </div>
                  </div>

                  <h4 style={styles.category}>{item.category}</h4>
                  <p style={styles.description}>
                    {item.description || "No description provided."}
                  </p>

                  <div style={styles.amountBox}>
                    <IndianRupee size={20} />
                    <span>{item.amount.toLocaleString()}</span>
                  </div>

                  <div style={styles.actionRow}>
                    {item.receiptUrl ? (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.viewBtn}
                      >
                        <Eye size={16} /> View Receipt
                      </a>
                    ) : (
                      <span style={styles.noFile}>No Attachment</span>
                    )}

                    <div style={styles.decisionBtns}>
                      <button
                        onClick={() => handleAction(item.id, "rejected")}
                        style={styles.rejectBtn}
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "approved")}
                        style={styles.approveBtn}
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- HISTORY TABLE SECTION --- */}
        <section style={{ marginTop: "60px" }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <FileSearch size={18} color="#64748b" /> Recent Activity Log
            </h3>
          </div>

          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Transaction Date</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Flow</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.slice(0, 8).map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      {item.date?.seconds
                        ? new Date(item.date.seconds * 1000).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "N/A"}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      {item.category}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          color: item.type === "income" ? "#10b981" : "#f43f5e",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                    >
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusPill,
                          backgroundColor:
                            item.status === "approved" ? "#dcfce7" : "#fee2e2",
                          color:
                            item.status === "approved" ? "#166534" : "#991b1b",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historyItems.length === 0 && (
              <p style={styles.noData}>No historical data available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc", // Lighter slate
    paddingTop: "120px",
    paddingBottom: "80px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "50px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: "16px", color: "#64748b", marginTop: "6px" },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    color: "#4338ca",
    padding: "10px 18px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },

  section: { width: "100%" },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
  },
  countBadge: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "25px",
  },
  approvalCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  typeLabel: {
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dateLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500",
  },

  category: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 10px 0",
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
    flexGrow: 1,
  },
  amountBox: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "28px",
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: "24px",
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    color: "#4338ca",
    fontSize: "14px",
    fontWeight: "700",
  },
  noFile: { fontSize: "12px", color: "#cbd5e1", fontStyle: "italic" },

  decisionBtns: { display: "flex", gap: "10px" },
  approveBtn: {
    border: "none",
    background: "#10b981",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
  },
  rejectBtn: {
    border: "none",
    background: "#ffffff",
    color: "#e11d48",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    border: "1px solid #fecdd3",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    padding: "18px 24px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: { transition: "background 0.2s" },
  td: {
    padding: "20px 24px",
    fontSize: "15px",
    color: "#475569",
    borderBottom: "1px solid #f1f5f9",
  },
  statusPill: {
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px",
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    color: "#94a3b8",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default BudgetApproval;
