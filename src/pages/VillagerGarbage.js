import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  FaTruck,
  FaHistory,
  FaTrashAlt,
  FaLeaf,
  FaClock,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const VillagerGarbage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState("pickup");

  // 1. Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    };
    fetchProfile();
  }, []);

  // 2. Monitoring Status: Fixed History Query
  useEffect(() => {
    if (!auth.currentUser) return;

    // IMPORTANT: If history is blank, check browser console (F12) for an Index Link.
    // To fix it immediately without an index, you can remove the orderBy line.
    const q = query(
      collection(db, "garbageRequests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched History Docs:", docs); // Check if data is arriving in console
        setHistory(docs);

        const pending = docs.find(
          (item) => item.status === "pending" || item.status === "in-progress"
        );
        setActiveRequest(pending);
      },
      (error) => {
        console.error("Firestore Query Error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAction = async (type, isComplaint = false) => {
    if (!userProfile?.area) {
      alert("Please update your Area in your Profile first!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "garbageRequests"), {
        userId: auth.currentUser.uid,
        userName: userProfile.fullName || auth.currentUser.displayName,
        userArea: userProfile.area,
        type: type,
        status: "pending",
        timestamp: serverTimestamp(),
        category: isComplaint ? "Complaint" : "Pickup",
      });

      alert(
        isComplaint
          ? "Community report submitted."
          : `Pickup request sent for ${type}`
      );
    } catch (err) {
      alert("Error submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Waste Management</h1>
          <p style={styles.headerSubtitle}>
            <FaMapMarkerAlt /> Serving{" "}
            <strong>{userProfile?.area || "Loading Location..."}</strong>
          </p>
        </header>

        <div style={styles.tabBar}>
          <button
            style={view === "pickup" ? styles.activeTab : styles.inactiveTab}
            onClick={() => setView("pickup")}
          >
            Request Pickup
          </button>
          <button
            style={view === "report" ? styles.activeTab : styles.inactiveTab}
            onClick={() => setView("report")}
          >
            Report Issue
          </button>
        </div>

        {view === "pickup" ? (
          <>
            <section style={styles.statusSection}>
              <div
                style={{
                  ...styles.statusCard,
                  background: activeRequest ? "#2563EB" : "#1E293B",
                }}
              >
                <div style={styles.statusTextContent}>
                  <span style={styles.badge}>Live Update</span>
                  <h2 style={styles.statusTitle}>
                    {activeRequest ? "Request Active" : "No Pending Tasks"}
                  </h2>
                  <p style={styles.statusDesc}>
                    {activeRequest
                      ? `Your ${activeRequest.type} is being processed.`
                      : "Ready for disposal? Request below."}
                  </p>
                </div>
                <FaTruck size={40} color="white" opacity={0.8} />
              </div>
            </section>

            <div style={styles.actionGrid}>
              <button
                style={{ ...styles.actionBtn, borderColor: "#10B981" }}
                onClick={() => handleAction("Wet Waste")}
                disabled={loading}
              >
                <FaLeaf color="#10B981" size={24} />{" "}
                <span style={styles.btnLabel}>Wet Waste</span>
              </button>
              <button
                style={{ ...styles.actionBtn, borderColor: "#3B82F6" }}
                onClick={() => handleAction("Dry Waste")}
                disabled={loading}
              >
                <FaTrashAlt color="#3B82F6" size={24} />{" "}
                <span style={styles.btnLabel}>Dry Waste</span>
              </button>
            </div>
          </>
        ) : (
          <div style={styles.reportBox}>
            <h3 style={styles.sectionHeading}>Community Eyes</h3>
            <p style={styles.reportHint}>
              Help the Panchayat identify dirty spots or full bins.
            </p>
            <button
              style={styles.complaintBtn}
              onClick={() => handleAction("Overflowing Dustbin", true)}
              disabled={loading}
            >
              <FaExclamationTriangle /> Overflowing Dustbin
            </button>
            <button
              style={styles.complaintBtn}
              onClick={() => handleAction("Public Littering", true)}
              disabled={loading}
            >
              <FaExclamationTriangle /> Report Blackspot
            </button>
          </div>
        )}

        {/* --- FIXED HISTORY LOG SECTION --- */}
        <h3 style={styles.sectionHeading}>
          <FaHistory /> Request & Report History
        </h3>
        <div style={styles.historyList}>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No activity found yet.</p>
              <small>
                If you just submitted, please wait a moment for the index to
                build.
              </small>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} style={styles.historyCard}>
                <div style={styles.historyMeta}>
                  <p style={styles.historyType}>
                    {item.category === "Complaint" && (
                      <FaExclamationTriangle color="#E11D48" size={12} />
                    )}{" "}
                    {item.type}
                  </p>
                  <p style={styles.historyArea}>{item.userArea}</p>
                  <p style={styles.historyTime}>
                    <FaClock size={10} style={{ marginRight: "4px" }} />
                    {item.timestamp
                      ? item.timestamp.toDate().toLocaleDateString("en-IN")
                      : "Syncing..."}
                  </p>
                </div>
                <div
                  style={{
                    ...styles.statusTag,
                    backgroundColor:
                      item.status === "collected" ? "#D1FAE5" : "#FEF3C7",
                    color: item.status === "collected" ? "#065F46" : "#92400E",
                  }}
                >
                  {item.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    padding: "100px 20px 40px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "500px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#64748B",
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  tabBar: { display: "flex", gap: "10px", marginBottom: "25px" },
  activeTab: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    background: "#2563EB",
    color: "white",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },
  inactiveTab: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    background: "#E2E8F0",
    color: "#64748B",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },
  statusSection: { marginBottom: "32px" },
  statusCard: {
    padding: "24px",
    borderRadius: "24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  statusTextContent: { flex: 1 },
  badge: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.2)",
    padding: "4px 8px",
    borderRadius: "6px",
    marginBottom: "8px",
    display: "inline-block",
  },
  statusTitle: { fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0" },
  statusDesc: { fontSize: "13px", opacity: 0.8, margin: 0 },
  sectionHeading: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "32px",
  },
  actionBtn: {
    backgroundColor: "white",
    border: "2px solid",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  btnLabel: { fontWeight: "700", fontSize: "15px", color: "#1E293B" },
  reportBox: {
    background: "white",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    marginBottom: "32px",
  },
  reportHint: { fontSize: "13px", color: "#64748B", marginBottom: "15px" },
  complaintBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: "15px",
    background: "#FFF1F2",
    color: "#E11D48",
    border: "1px solid #FECDD3",
    fontWeight: "700",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  historyList: { display: "flex", flexDirection: "column", gap: "12px" },
  historyCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #E2E8F0",
  },
  historyMeta: { display: "flex", flexDirection: "column", gap: "2px" },
  historyType: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1E293B",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  historyArea: { fontSize: "12px", color: "#64748B", margin: 0 },
  historyTime: {
    fontSize: "11px",
    color: "#94A3B8",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  statusTag: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "6px 10px",
    borderRadius: "10px",
    textTransform: "uppercase",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94A3B8",
    backgroundColor: "white",
    borderRadius: "20px",
    border: "1px dashed #E2E8F0",
  },
};

export default VillagerGarbage;
