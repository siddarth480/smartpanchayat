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

const AcknowledgeComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [acknowledgements, setAcknowledgements] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("toUserRole", "==", "sarpanch")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(data);
    });

    return unsubscribe;
  }, []);

  const handleResolve = async (id) => {
    const text = acknowledgements[id]?.trim();
    if (!text) return alert("Please enter acknowledgement note.");

    await updateDoc(doc(db, "complaints", id), {
      status: "resolved",
      acknowledgement: text,
      resolvedAt: Timestamp.now(),
      resolvedBy: user.fullName || "Sarpanch",
    });

    setAcknowledgements((prev) => ({ ...prev, [id]: "" }));
  };

  const filtered = complaints.filter((c) => c.status === activeTab);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📨 Acknowledge Complaints</h2>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "pending" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "resolved" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <p style={styles.empty}>No {activeTab} complaints found.</p>
      ) : (
        filtered.map((complaint) => (
          <div key={complaint.id} style={styles.card}>
            <p>
              <strong>From:</strong> {complaint.userName}
            </p>
            <p>
              <strong>Description:</strong> {complaint.description}
            </p>

            {/* Complaint Image */}
            {complaint.imageUrl && (
              <a href={complaint.imageUrl} target="_blank" rel="noreferrer">
                <img
                  src={complaint.imageUrl}
                  alt="Complaint"
                  style={styles.image}
                />
              </a>
            )}

            {/* Show operator suggestion if exists */}
            {complaint.operatorSuggestion && (
              <p style={styles.operatorNote}>
                <strong>Operator Suggestion:</strong>{" "}
                {complaint.operatorSuggestion}
              </p>
            )}

            {activeTab === "pending" ? (
              <>
                <textarea
                  style={styles.textarea}
                  placeholder="Write acknowledgement..."
                  value={acknowledgements[complaint.id] || ""}
                  onChange={(e) =>
                    setAcknowledgements((prev) => ({
                      ...prev,
                      [complaint.id]: e.target.value,
                    }))
                  }
                />
                <button
                  style={styles.button}
                  onClick={() => handleResolve(complaint.id)}
                >
                  ✅ Acknowledge & Resolve
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Acknowledged By:</strong> {complaint.resolvedBy}
                </p>
                <p>
                  <strong>Acknowledgement:</strong> {complaint.acknowledgement}
                </p>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "100px 5%",
    background: "#f0f6ff", // light blue background for modern look
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "30px",
    color: "#1e40af",
  },
  tabBar: {
    display: "flex",
    justifyContent: "center",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#e2e8f0",
    textAlign: "center",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },
  activeTab: {
    backgroundColor: "#1d4ed8", // deep blue
    color: "#fff",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  image: {
    width: "120px",
    marginTop: "10px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  operatorNote: {
    marginTop: "10px",
    background: "#e0f2fe",
    padding: "10px",
    borderRadius: "6px",
    fontStyle: "italic",
    color: "#0369a1",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    marginTop: "30px",
    color: "#666",
  },
};

export default AcknowledgeComplaints;
