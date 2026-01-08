import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import {
  FiClock,
  FiCheckCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiBarChart2,
  FiInfo,
  FiChevronRight,
  FiLock, // Added lock icon
} from "react-icons/fi";

const VillagerPolls = ({ user }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, "polls");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolls(
        pollData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (pollId, option) => {
    const pollRef = doc(db, "polls", pollId);
    try {
      await updateDoc(pollRef, {
        [`votes.${option}`]: increment(1),
        votedUsers: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Voting failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading)
    return <div style={styles.loader}>Connecting to Village Council...</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.badge}>Digital Democracy</div>
        <h1 style={styles.title}>Community Voice</h1>
        <p style={styles.subtitle}>
          Your participation shapes the future of our Panchayat. Every vote
          counts.
        </p>
      </header>

      <div style={styles.grid}>
        {polls.length === 0 ? (
          <div style={styles.emptyState}>
            <FiBarChart2 size={48} color="#cbd5e1" />
            <p>No active polls at the moment.</p>
          </div>
        ) : (
          polls.map((poll) => {
            const hasVoted = poll.votedUsers?.includes(user.uid);
            const isClosed = poll.status === "closed"; // Check if closed
            const showResults = hasVoted || isClosed; // Show bars if voted OR closed

            const totalVotes = Object.values(poll.votes || {}).reduce(
              (a, b) => a + b,
              0
            );
            const isBinary = poll.formatType === "yes_no";

            return (
              <div
                key={poll.id}
                style={{
                  ...styles.card,
                  borderTop: isClosed
                    ? "4px solid #64748b" // Gray for closed
                    : hasVoted
                    ? "4px solid #10b981" // Green for voted
                    : "4px solid #2563eb", // Blue for active
                  opacity: isClosed && !hasVoted ? 0.8 : 1,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.statusGroup}>
                    <span
                      style={{
                        ...styles.liveDot,
                        backgroundColor: isClosed ? "#64748b" : "#ef4444",
                        boxShadow: isClosed ? "none" : "0 0 8px #ef4444",
                      }}
                    />
                    <span style={styles.statusText}>
                      {isClosed
                        ? "Poll Closed"
                        : hasVoted
                        ? "Results Live"
                        : "Voting Open"}
                    </span>
                  </div>
                  <span style={styles.voteCount}>
                    {totalVotes} participants
                  </span>
                </div>

                <h3 style={styles.question}>{poll.question}</h3>

                <div style={styles.actionArea}>
                  {isBinary ? (
                    <div style={styles.binaryGrid}>
                      {["Yes", "No"].map((opt) => {
                        const count = poll.votes[opt] || 0;
                        const perc =
                          totalVotes > 0
                            ? Math.round((count / totalVotes) * 100)
                            : 0;

                        return (
                          <button
                            key={opt}
                            disabled={showResults} // Disable if voted OR closed
                            onClick={() => handleVote(poll.id, opt)}
                            style={{
                              ...styles.binaryBtn,
                              ...(opt === "Yes" ? styles.yesBtn : styles.noBtn),
                              ...(showResults ? styles.disabledBtn : {}),
                            }}
                          >
                            <div style={styles.btnContent}>
                              {opt === "Yes" ? (
                                <FiThumbsUp />
                              ) : (
                                <FiThumbsDown />
                              )}
                              <span>{opt}</span>
                            </div>
                            {showResults && (
                              <span style={styles.percLabel}>{perc}%</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={styles.mcqList}>
                      {Object.keys(poll.votes || {}).map((opt) => {
                        const count = poll.votes[opt] || 0;
                        const perc =
                          totalVotes > 0
                            ? Math.round((count / totalVotes) * 100)
                            : 0;

                        return (
                          <div key={opt} style={styles.mcqWrapper}>
                            <button
                              disabled={showResults} // Disable if voted OR closed
                              onClick={() => handleVote(poll.id, opt)}
                              style={{
                                ...styles.mcqBtn,
                                ...(showResults ? styles.disabledMcq : {}),
                              }}
                            >
                              <span>{opt}</span>
                              {!showResults && <FiChevronRight />}
                              {showResults && (
                                <span style={styles.percLabel}>{perc}%</span>
                              )}
                            </button>
                            {showResults && (
                              <div style={styles.progressContainer}>
                                <div
                                  style={{
                                    ...styles.progressBar,
                                    width: `${perc}%`,
                                    backgroundColor: isClosed
                                      ? "#94a3b8"
                                      : "#2563eb",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={styles.footerNote}>
                  {isClosed ? (
                    <>
                      <FiLock color="#64748b" />{" "}
                      <span>
                        This poll has ended. No more votes can be cast.
                      </span>
                    </>
                  ) : hasVoted ? (
                    <>
                      <FiCheckCircle color="#10b981" />{" "}
                      <span>Your vote has been securely recorded.</span>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.infoBox}>
        <FiInfo />
        <p>
          All polls are encrypted and anonymous. The Panchayat can see total
          numbers, but not who voted for which option.
        </p>
      </div>
    </div>
  );
};

// ... (Rest of your styles remain the same)
const styles = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "120px 5% 60px",
    fontFamily: "'Inter', sans-serif",
  },
  header: { textAlign: "center", marginBottom: "50px" },
  badge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "800",
    display: "inline-block",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#0f172a",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  statusGroup: { display: "flex", alignItems: "center", gap: "8px" },
  liveDot: {
    width: "8px",
    height: "8px",
    background: "#ef4444",
    borderRadius: "50%",
  },
  statusText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  voteCount: { fontSize: "12px", color: "#94a3b8", fontWeight: "600" },
  question: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: "1.4",
    marginBottom: "30px",
  },
  actionArea: { marginBottom: "20px" },
  binaryGrid: { display: "flex", gap: "15px" },
  binaryBtn: {
    flex: 1,
    padding: "20px",
    borderRadius: "16px",
    border: "none",
    cursor: "pointer",
    transition: "0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "700",
    fontSize: "16px",
  },
  yesBtn: { background: "#ecfdf5", color: "#059669" },
  noBtn: { background: "#fef2f2", color: "#dc2626" },
  percLabel: { fontSize: "20px", fontWeight: "900" },
  mcqList: { display: "flex", flexDirection: "column", gap: "12px" },
  mcqWrapper: { width: "100%" },
  mcqBtn: {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "0.2s",
    color: "#334155",
  },
  progressContainer: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "10px",
    marginTop: "8px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "10px",
    transition: "width 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
  },
  disabledBtn: { opacity: 0.8, cursor: "default" },
  disabledMcq: {
    background: "#f8fafc",
    color: "#94a3b8",
    border: "1px solid #f1f5f9",
  },
  footerNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    marginTop: "10px",
  },
  infoBox: {
    maxWidth: "600px",
    margin: "50px auto 0",
    padding: "20px",
    borderRadius: "16px",
    background: "#f1f5f9",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    color: "#64748b",
    fontWeight: "600",
  },
  emptyState: { textAlign: "center", gridColumn: "1/-1", padding: "100px 0" },
};

export default VillagerPolls;
