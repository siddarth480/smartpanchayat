import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  FiPlus,
  FiList,
  FiCheckSquare,
  FiSend,
  FiTrash2,
  FiClock,
  FiActivity,
  FiXCircle,
} from "react-icons/fi";

// ✅ MOVE STYLES TO TOP to avoid "Cannot access before initialization" error
const styles = {
  page: {
    padding: "120px 5% 60px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  header: { marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "16px", marginTop: "5px" },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "40px",
    alignItems: "start",
  },
  formSection: { position: "sticky", top: "120px" },
  card: {
    background: "#fff",
    padding: "35px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  inputGroup: { marginBottom: "25px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  toggleRow: {
    display: "flex",
    gap: "10px",
    background: "#f1f5f9",
    padding: "5px",
    borderRadius: "12px",
  },
  toggleBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "100px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "700",
    color: "#64748b",
    background: "transparent",
  },
  toggleActive: {
    background: "#fff",
    color: "#2563eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  optionRow: { display: "flex", gap: "10px", marginBottom: "10px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
  },
  addBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    padding: "5px 0",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    marginTop: "20px",
  },
  feedSection: { display: "flex", flexDirection: "column", gap: "20px" },
  secHeading: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
  },
  pollList: { display: "flex", flexDirection: "column", gap: "15px" },
  pollCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  pollMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "4px 10px",
    borderRadius: "100px",
  },
  timeText: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  pollQuestion: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#334155",
  },
  pollActions: {
    display: "flex",
    gap: "10px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "15px",
  },
  controlBtn: {
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#475569",
  },
  deleteBtn: {
    padding: "8px 15px",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#ef4444",
    border: "1px solid #fee2e2",
  },
};

const OperatorPollCreator = () => {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("yes_no");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [activePolls, setActivePolls] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivePolls(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index) =>
    setOptions(options.filter((_, i) => i !== index));

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalOptions =
      type === "yes_no"
        ? ["Yes", "No"]
        : options.filter((opt) => opt.trim() !== "");
    const votesObj = {};
    finalOptions.forEach((opt) => (votesObj[opt] = 0));

    try {
      await addDoc(collection(db, "polls"), {
        question,
        formatType: type,
        votes: votesObj,
        votedUsers: [],
        status: "active",
        createdAt: serverTimestamp(),
      });
      alert("Poll Launched Successfully! 🚀");
      setQuestion("");
      setOptions(["", ""]);
    } catch (err) {
      alert("Error launching poll");
    } finally {
      setLoading(false);
    }
  };

  const togglePollStatus = async (pollId, currentStatus) => {
    const pollRef = doc(db, "polls", pollId);
    await updateDoc(pollRef, {
      status: currentStatus === "active" ? "closed" : "active",
    });
  };

  const deletePoll = async (pollId) => {
    if (window.confirm("Are you sure? This will delete all vote data.")) {
      await deleteDoc(doc(db, "polls", pollId));
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Poll Management Center</h1>
        <p style={styles.subtitle}>
          Create and manage democratic interactions for the village.
        </p>
      </header>

      <div style={styles.mainGrid}>
        <section style={styles.formSection}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <FiPlus /> Draft New Poll
            </h2>
            <form onSubmit={handleCreatePoll}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Question</label>
                <textarea
                  style={styles.textarea}
                  placeholder="e.g., Should we install a new water purifier in Ward 4?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Answer Format</label>
                <div style={styles.toggleRow}>
                  <button
                    type="button"
                    onClick={() => setType("yes_no")}
                    style={{
                      ...styles.toggleBtn,
                      ...(type === "yes_no" ? styles.toggleActive : {}),
                    }}
                  >
                    <FiCheckSquare /> Yes / No
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("mcq")}
                    style={{
                      ...styles.toggleBtn,
                      ...(type === "mcq" ? styles.toggleActive : {}),
                    }}
                  >
                    <FiList /> Multi-Choice
                  </button>
                </div>
              </div>

              {type === "mcq" && (
                <div style={styles.optionsArea}>
                  <label style={styles.label}>Choices</label>
                  {options.map((opt, index) => (
                    <div key={index} style={styles.optionRow}>
                      <input
                        style={styles.input}
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[index] = e.target.value;
                          setOptions(newOpts);
                        }}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          style={styles.removeBtn}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    style={styles.addBtn}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Launching..." : "Launch Poll"} <FiSend />
              </button>
            </form>
          </div>
        </section>

        <section style={styles.feedSection}>
          <h2 style={styles.secHeading}>
            <FiActivity /> Active & Past Polls
          </h2>
          <div style={styles.pollList}>
            {activePolls.map((poll) => (
              <div
                key={poll.id}
                style={{
                  ...styles.pollCard,
                  opacity: poll.status === "closed" ? 0.7 : 1,
                }}
              >
                <div style={styles.pollMeta}>
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
                  <span style={styles.timeText}>
                    <FiClock /> {poll.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                <h4 style={styles.pollQuestion}>{poll.question}</h4>
                <div style={styles.pollActions}>
                  <button
                    onClick={() => togglePollStatus(poll.id, poll.status)}
                    style={styles.controlBtn}
                  >
                    {poll.status === "active" ? (
                      <>
                        <FiXCircle /> Close
                      </>
                    ) : (
                      <>
                        <FiCheckSquare /> Reopen
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deletePoll(poll.id)}
                    style={styles.deleteBtn}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OperatorPollCreator;
