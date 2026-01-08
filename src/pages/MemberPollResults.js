import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  FiPieChart,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiActivity,
} from "react-icons/fi";

const MemberPollResults = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPolls(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return <div style={styles.loader}>Generating Analytical Report...</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>Decision Support Dashboard</h1>
          <p style={styles.subtitle}>
            Analyzing village consensus to guide Panchayat policy and budget
            allocation.
          </p>
        </div>
        <button style={styles.exportBtn} onClick={() => window.print()}>
          <FiDownload /> Export Reports
        </button>
      </header>

      {/* Global Stats Summary */}
      <section style={styles.statsOverview}>
        <div style={styles.statCard}>
          <FiActivity color="#2563eb" />
          <div>
            <span style={styles.statVal}>{polls.length}</span>
            <div style={styles.statLabel}>Total Polls</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <FiUsers color="#10b981" />
          <div>
            <span style={styles.statVal}>
              {polls.reduce(
                (acc, poll) => acc + (poll.votedUsers?.length || 0),
                0
              )}
            </span>
            <div style={styles.statLabel}>Total Responses</div>
          </div>
        </div>
      </section>

      <div style={styles.grid}>
        {polls.map((poll) => {
          const totalVotes = Object.values(poll.votes || {}).reduce(
            (a, b) => a + b,
            0
          );
          const winner = Object.keys(poll.votes).reduce((a, b) =>
            poll.votes[a] > poll.votes[b] ? a : b
          );

          return (
            <div key={poll.id} style={styles.resultCard}>
              <div style={styles.cardHeader}>
                <span
                  style={{
                    ...styles.statusBadge,
                    background:
                      poll.status === "active" ? "#dcfce7" : "#f1f5f9",
                    color: poll.status === "active" ? "#15803d" : "#64748b",
                  }}
                >
                  {poll.status.toUpperCase()}
                </span>
                <span style={styles.date}>
                  <FiCalendar /> {poll.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>

              <h3 style={styles.question}>{poll.question}</h3>

              <div style={styles.chartArea}>
                {Object.keys(poll.votes).map((option) => {
                  const voteCount = poll.votes[option];
                  const percentage =
                    totalVotes > 0
                      ? Math.round((voteCount / totalVotes) * 100)
                      : 0;
                  const isWinner = option === winner && totalVotes > 0;

                  return (
                    <div key={option} style={styles.barWrapper}>
                      <div style={styles.barLabels}>
                        <span
                          style={{
                            ...styles.optionName,
                            fontWeight: isWinner ? "800" : "500",
                          }}
                        >
                          {option} {isWinner && "🏆"}
                        </span>
                        <span style={styles.barValue}>
                          {voteCount} votes ({percentage}%)
                        </span>
                      </div>
                      <div style={styles.track}>
                        <div
                          style={{
                            ...styles.fill,
                            width: `${percentage}%`,
                            background: isWinner ? "#2563eb" : "#e2e8f0",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.insight}>
                  <FiTrendingUp color="#10b981" />
                  <span>
                    The community shows a strong preference for{" "}
                    <strong>{winner}</strong>.
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  page: {
    padding: "120px 5% 60px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  headerInfo: { flex: 1 },
  title: { fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "15px", marginTop: "5px" },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    color: "#475569",
  },

  statsOverview: { display: "flex", gap: "20px", marginBottom: "40px" },
  statCard: {
    flex: 1,
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid #e2e8f0",
  },
  statVal: { fontSize: "20px", fontWeight: "800", color: "#1e293b" },
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "25px",
  },
  resultCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "4px 10px",
    borderRadius: "100px",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  question: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 25px 0",
    lineHeight: "1.4",
  },

  chartArea: { display: "flex", flexDirection: "column", gap: "18px" },
  barWrapper: { width: "100%" },
  barLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "13px",
  },
  optionName: { color: "#334155" },
  barValue: { color: "#64748b", fontWeight: "600" },
  track: {
    height: "10px",
    background: "#f1f5f9",
    borderRadius: "10px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 1s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
  },

  cardFooter: {
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  insight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#475569",
  },
  loader: { textAlign: "center", marginTop: "150px", color: "#64748b" },
};

export default MemberPollResults;
