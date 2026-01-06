import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import {
  FaChartLine,
  FaMapMarkedAlt,
  FaHistory,
  FaFileDownload,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MemberGarbage = () => {
  const [stats, setStats] = useState({ pending: 0, collected: 0 });
  const [wardData, setWardData] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "garbageRequests"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllDocs(docs);

      const pending = docs.filter((d) => d.status === "pending").length;
      const collected = docs.filter((d) => d.status === "collected").length;
      setStats({ pending, collected });

      const wards = {};
      docs.forEach((doc) => {
        const area = doc.userArea || "Unassigned";
        if (!wards[area]) wards[area] = { pending: 0, collected: 0 };
        if (doc.status === "pending") wards[area].pending++;
        if (doc.status === "collected") wards[area].collected++;
      });
      setWardData(wards);

      setRecentLogs(docs.slice(0, 10)); // Shows top 10 recent activities
    });

    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text("Panchayat Waste Management Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 30);

    doc.setTextColor(0);
    doc.text(`Total Requests: ${stats.pending + stats.collected}`, 14, 45);
    doc.text(`Successfully Collected: ${stats.collected}`, 14, 52);
    doc.text(`Pending Actions: ${stats.pending}`, 14, 59);

    doc.text("Ward-wise Performance Summary", 14, 75);
    const wardRows = Object.entries(wardData).map(([ward, data]) => [
      ward,
      data.collected,
      data.pending,
      `${Math.round(
        (data.collected / (data.pending + data.collected || 1)) * 100
      )}%`,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Ward/Area", "Collected", "Pending", "Efficiency"]],
      body: wardRows,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    const logRows = allDocs.map((log) => [
      log.userName,
      log.userArea,
      log.type,
      log.status,
      log.timestamp
        ?.toDate()
        .toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) ||
        "N/A",
      log.collectedAt
        ?.toDate()
        .toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) ||
        "Pending",
    ]);

    doc.addPage();
    doc.text("Full Activity Log", 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [
        ["Villager", "Area", "Type", "Status", "Request Time", "Pickup Time"],
      ],
      body: logRows,
      theme: "grid",
    });

    doc.save(`Panchayat_Garbage_Report_${date.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Panchayat Oversight</h2>
            <p style={styles.subtitle}>
              Sanitation & Waste Management Monitoring
            </p>
          </div>
          <button style={styles.reportBtn} onClick={handleExport}>
            <FaFileDownload /> Export Monthly Report
          </button>
        </header>

        {/* METRICS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              <FaChartLine color="#3B82F6" />
            </div>
            <div>
              <span style={styles.statLabel}>Total Requests</span>
              <h3 style={styles.statValue}>
                {stats.pending + stats.collected}
              </h3>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: "#FEF3C7" }}>
              <FaHistory color="#D97706" />
            </div>
            <div>
              <span style={styles.statLabel}>Pending</span>
              <h3 style={{ ...styles.statValue, color: "#D97706" }}>
                {stats.pending}
              </h3>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: "#D1FAE5" }}>
              <FaMapMarkedAlt color="#059669" />
            </div>
            <div>
              <span style={styles.statLabel}>Efficiency Score</span>
              <h3 style={{ ...styles.statValue, color: "#059669" }}>
                {stats.pending + stats.collected > 0
                  ? Math.round(
                      (stats.collected / (stats.pending + stats.collected)) *
                        100
                    )
                  : 0}
                %
              </h3>
            </div>
          </div>
        </div>

        {/* WARD PERFORMANCE */}
        <h3 style={styles.sectionTitle}>
          <FaMapMarkedAlt style={{ marginRight: "8px" }} /> Ward breakdown
        </h3>
        <div style={styles.wardGrid}>
          {Object.entries(wardData).map(([ward, data]) => (
            <div key={ward} style={styles.wardCard}>
              <h4 style={styles.wardName}>{ward}</h4>
              <div style={styles.wardStatRow}>
                <span>
                  Pending: <strong>{data.pending}</strong>
                </span>
                <span>
                  Collected: <strong>{data.collected}</strong>
                </span>
              </div>
              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${
                      (data.collected / (data.pending + data.collected)) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <div style={styles.tableCard}>
          <h3 style={styles.sectionTitle}>
            <FaHistory style={{ marginRight: "8px" }} /> Detailed Collection
            Activity
          </h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Villager & Area</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>
                    <FaClock size={12} /> Request Time
                  </th>
                  <th style={styles.th}>
                    <FaCheckCircle size={12} /> Pickup Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{log.userName}</strong>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        {log.userArea}
                      </div>
                    </td>
                    <td style={styles.td}>{log.type}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            log.status === "collected" ? "#D1FAE5" : "#FEF3C7",
                          color:
                            log.status === "collected" ? "#065F46" : "#92400E",
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {log.timestamp
                        ?.toDate()
                        .toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                    </td>
                    <td style={styles.td}>
                      {log.collectedAt ? (
                        <span style={{ color: "#059669", fontWeight: "600" }}>
                          {log.collectedAt
                            .toDate()
                            .toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontStyle: "italic" }}>
                          Waiting...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: { fontSize: "28px", fontWeight: "900", color: "#0F172A", margin: 0 },
  subtitle: { color: "#64748B", fontSize: "14px", marginTop: "4px" },
  reportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    background: "white",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  statIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "900",
    margin: 0,
    color: "#1E293B",
  },
  wardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  },
  wardCard: {
    background: "white",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
  },
  wardName: { margin: "0 0 10px 0", fontSize: "15px", fontWeight: "800" },
  wardStatRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#64748B",
    marginBottom: "8px",
  },
  progressBg: {
    height: "6px",
    background: "#F1F5F9",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: { height: "100%", background: "#10B981", borderRadius: "10px" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #E2E8F0",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { borderBottom: "2px solid #F8FAFC", textAlign: "left" },
  th: {
    padding: "12px",
    color: "#64748B",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tr: { borderBottom: "1px solid #F8FAFC" },
  td: { padding: "16px 12px", fontSize: "14px", color: "#334155" },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
};

export default MemberGarbage;
