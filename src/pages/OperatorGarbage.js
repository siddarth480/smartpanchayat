import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  FaTruck,
  FaMapMarkerAlt,
  FaUser,
  FaHistory,
  FaCheckCircle,
  FaRoute,
  FaArrowRight,
  FaCity,
  FaClipboardList,
} from "react-icons/fa";

const OperatorGarbage = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [history, setHistory] = useState([]);
  const [wardStats, setWardStats] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "garbageRequests"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const groups = taskData.reduce((acc, task) => {
        const area = task.userArea || "Unassigned Areas";
        if (!acc[area]) acc[area] = [];
        acc[area].push(task);
        return acc;
      }, {});
      setGroupedTasks(groups);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "garbageRequests"),
      where("status", "==", "collected"),
      where("operatorId", "==", auth.currentUser.uid),
      orderBy("collectedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(historyData);
      const summary = {};
      historyData.forEach((item) => {
        const ward = item.userArea || "Other";
        summary[ward] = (summary[ward] || 0) + 1;
      });
      setWardStats(summary);
    });
    return () => unsubscribe();
  }, []);

  const markAsCollected = async (taskId) => {
    setLoadingId(taskId);
    try {
      await updateDoc(doc(db, "garbageRequests", taskId), {
        status: "collected",
        collectedAt: serverTimestamp(),
        operatorId: auth.currentUser.uid,
        operatorName: auth.currentUser.displayName || "Operator",
      });
    } catch (err) {
      alert("Error updating task.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* HEADER SECTION */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Dispatch Center</h2>
            <p style={styles.subtitle}>
              Real-time Logistics & Route Optimization
            </p>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.pulseDot}></span> System Live
          </div>
        </div>

        {/* METRICS GRID */}
        <div style={styles.metricsGrid}>
          <div
            style={{ ...styles.metricCard, borderBottom: "4px solid #3B82F6" }}
          >
            <FaRoute style={styles.metricIcon} color="#3B82F6" />
            <div>
              <div style={styles.metricLabel}>To Collect</div>
              <div style={styles.metricValue}>
                {Object.values(groupedTasks).flat().length}
              </div>
            </div>
          </div>
          <div
            style={{ ...styles.metricCard, borderBottom: "4px solid #10B981" }}
          >
            <FaCheckCircle style={styles.metricIcon} color="#10B981" />
            <div>
              <div style={styles.metricLabel}>Success Rate</div>
              <div style={styles.metricValue}>{history.length}</div>
            </div>
          </div>
        </div>

        {/* PROPERLY DESIGNED ACTIVE WARD SECTION */}
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>
            <FaCity style={{ color: "#3B82F6" }} /> Active Logistics Wards
          </h3>
          <span style={styles.wardTag}>
            {Object.keys(groupedTasks).length} Zones Active
          </span>
        </div>

        {Object.keys(groupedTasks).length === 0 ? (
          <div style={styles.emptyCard}>
            <FaCheckCircle
              size={40}
              color="#10B981"
              style={{ marginBottom: "15px" }}
            />
            <p style={{ fontWeight: "700", color: "#1E293B" }}>
              Daily Goal Reached!
            </p>
            <p style={{ fontSize: "13px", color: "#64748B" }}>
              No pending pickups found in the system.
            </p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([area, areaTasks]) => (
            <div key={area} style={styles.wardContainer}>
              {/* Ward Identification Bar */}
              <div style={styles.wardHeader}>
                <div style={styles.wardIdentity}>
                  <div style={styles.wardMarker}>
                    <FaMapMarkerAlt size={12} />
                  </div>
                  <span style={styles.wardNameText}>{area}</span>
                </div>
                <div style={styles.wardProgressBadge}>
                  <FaClipboardList size={10} style={{ marginRight: "5px" }} />{" "}
                  {areaTasks.length} Pending
                </div>
              </div>

              {/* Individual Task Cluster */}
              <div style={styles.taskList}>
                {areaTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card-hover"
                    style={styles.taskCard}
                  >
                    <div style={styles.taskMain}>
                      <div style={styles.userAvatar}>
                        {task.userName?.charAt(0).toUpperCase() || (
                          <FaUser size={12} />
                        )}
                      </div>
                      <div>
                        <div style={styles.userName}>{task.userName}</div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              ...styles.typeBadge,
                              background:
                                task.type === "Wet Waste"
                                  ? "#DCFCE7"
                                  : "#DBEAFE",
                              color:
                                task.type === "Wet Waste"
                                  ? "#166534"
                                  : "#1E40AF",
                            }}
                          >
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="action-hover-btn"
                      onClick={() => markAsCollected(task.id)}
                      disabled={loadingId === task.id}
                      style={styles.actionBtn}
                    >
                      {loadingId === task.id ? "..." : "Collect"}
                      <FaArrowRight style={{ marginLeft: "8px" }} size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* PERFORMANCE SUMMARY */}
        <h3 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
          <FaHistory style={{ marginRight: "10px" }} /> Weekly Area Performance
        </h3>
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Zone Name</th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Total Completed
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(wardStats).map(([ward, count]) => (
                <tr key={ward} style={styles.tr}>
                  <td style={styles.td}>{ward}</td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontWeight: "800",
                      color: "#10B981",
                    }}
                  >
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

         
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    background: "#F1F5F9",
    minHeight: "100vh",
    padding: "100px 20px 60px",
  },
  container: {
    maxWidth: "850px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0F172A",
    margin: 0,
    letterSpacing: "-0.8px",
  },
  subtitle: { fontSize: "14px", color: "#64748B", fontWeight: "500" },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    padding: "10px 20px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    background: "#10B981",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  metricCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  metricIcon: { fontSize: "24px" },
  metricLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metricValue: { fontSize: "30px", fontWeight: "900", color: "#1E293B" },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "0 5px",
  },
  sectionTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#1E293B",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  wardTag: {
    background: "#3B82F6",
    color: "#fff",
    fontSize: "11px",
    padding: "5px 12px",
    borderRadius: "20px",
    fontWeight: "800",
  },

  // Updated Active Ward Proper Design
  wardContainer: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: "28px",
    padding: "24px",
    marginBottom: "30px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
  },
  wardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  wardIdentity: { display: "flex", alignItems: "center", gap: "12px" },
  wardMarker: {
    background: "#EF4444",
    color: "#fff",
    padding: "8px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wardNameText: { fontSize: "18px", fontWeight: "800", color: "#0F172A" },
  wardProgressBadge: {
    background: "#F1F5F9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    padding: "6px 14px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
  },

  taskList: { display: "flex", flexDirection: "column", gap: "10px" },
  taskCard: {
    background: "#F8FAFC",
    padding: "12px 16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Pushes content to opposite ends
    marginBottom: "10px",
    border: "1px solid #F1F5F9",
  },
  taskMain: { display: "flex", alignItems: "center", gap: "15px" },
  userAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "15px",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3B82F6",
    fontWeight: "900",
    border: "2px solid #EFF6FF",
  },
  userName: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "2px",
  },
  typeBadge: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },

  actionBtn: {
    background: "transparent", // Transparent background like the images
    color: "#10B981", // Green text/icon color
    border: "2px solid #10B981", // Solid border
    padding: "10px 15px",
    borderRadius: "15px", // Rounded corners
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "100px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "28px",
    padding: "20px",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "15px",
    fontSize: "11px",
    color: "#94A3B8",
    textTransform: "uppercase",
    borderBottom: "2px solid #F8FAFC",
    textAlign: "left",
    fontWeight: "800",
  },
  tr: { borderBottom: "1px solid #F8FAFC" },
  td: {
    padding: "18px 15px",
    fontSize: "14px",
    color: "#475569",
    fontWeight: "600",
  },
  emptyCard: {
    textAlign: "center",
    padding: "60px",
    background: "#fff",
    borderRadius: "28px",
    border: "2px dashed #CBD5E1",
  },
};

export default OperatorGarbage;
