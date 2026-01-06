// src/pages/OperatorComplaints.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

const OperatorComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(
          collection(db, "complaints"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const complaintData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
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

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, operatorSuggestion: suggestions[id] } : c
        )
      );

      setSuggestions((prev) => ({ ...prev, [id]: "" }));
    } catch (error) {
      console.error("Error submitting suggestion:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "120px", fontSize: "18px" }}>
        Loading complaints...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>📢 Villager Complaints</h2>
      <div style={styles.grid}>
        {complaints.length === 0 ? (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No complaints found.
          </p>
        ) : (
          complaints.map((complaint) => {
            const status = complaint.status?.toLowerCase() || "pending"; // normalize
            return (
              <div key={complaint.id} style={styles.card}>
                <div style={styles.header}>
                  <h3 style={styles.complaintTitle}>
                    {complaint.title || "Complaint"}
                  </h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        status === "resolved" ? "#dcfce7" : "#e0f2fe",
                      color: status === "resolved" ? "#15803d" : "#0369a1",
                    }}
                  >
                    {status === "resolved" ? "Resolved" : "Pending"}
                  </span>
                </div>

                <div style={styles.meta}>
                  <strong>By:</strong> {complaint.userName || "Unknown"}
                </div>
                <div style={styles.meta}>
                  <strong>Details:</strong> {complaint.description}
                </div>

                {complaint.imageUrl && (
                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.imageWrapper}
                  >
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      style={styles.image}
                    />
                  </a>
                )}

                {/* ✅ Show existing suggestion */}
                {complaint.operatorSuggestion && (
                  <div style={styles.suggestionBox}>
                    <strong>💡 Operator Suggestion:</strong>
                    <p style={{ margin: "6px 0 0", color: "#374151" }}>
                      {complaint.operatorSuggestion}
                    </p>
                  </div>
                )}

                {/* ✅ Allow new suggestion only if complaint is NOT resolved */}
                {!complaint.operatorSuggestion && status !== "resolved" && (
                  <>
                    <textarea
                      style={styles.textarea}
                      placeholder="Write your suggestion..."
                      value={suggestions[complaint.id] || ""}
                      onChange={(e) =>
                        setSuggestions({
                          ...suggestions,
                          [complaint.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      style={styles.button}
                      onClick={() => handleSuggest(complaint.id)}
                    >
                      🚀 Submit Suggestion
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "100px 5% 40px",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "40px",
    color: "#1d4ed8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  complaintTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  meta: {
    fontSize: "14px",
    color: "#374151",
  },
  imageWrapper: {
    marginTop: "10px",
    display: "inline-block",
  },
  image: {
    width: "100%",
    maxWidth: "260px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    padding: "10px",
    fontSize: "14px",
    outline: "none",
    resize: "none",
  },
  button: {
    marginTop: "8px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  suggestionBox: {
    marginTop: "12px",
    background: "#ecfdf5",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    fontSize: "14px",
  },
};

export default OperatorComplaints;
