import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  Mail, 
  Briefcase 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MemberEventPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
    });
    return unsubscribe;
  }, []);

  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const eventDate = event.eventDate?.toDate?.();
    return activeTab === "upcoming" ? eventDate >= now : eventDate < now;
  });

  filteredEvents.sort((a, b) => {
    const dateA = a.eventDate?.toDate();
    const dateB = b.eventDate?.toDate();
    return activeTab === "upcoming" ? dateA - dateB : dateB - dateA;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.eventDate?.toDate() >= now).length,
    past: events.filter(e => e.eventDate?.toDate() < now).length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div style={styles.container}>
      {/* Analytics Header */}
      <div style={styles.analyticsHeader}>
        <div style={styles.headerTop}>
          <div>
            <h2 style={styles.heading}>Event Operations Overview</h2>
            <p style={styles.subheading}>Monitor village programs, expert allocations, and historical event data.</p>
          </div>
          <div style={styles.iconBox}>
            <BarChart3 size={32} color="#0F172A" />
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Events</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Upcoming</div>
            <div style={{...styles.statValue, color: "#D97706"}}>{stats.upcoming}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Concluded</div>
            <div style={{...styles.statValue, color: "#059669"}}>{stats.past}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tab, ...(activeTab === "upcoming" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("upcoming")}
        >
          <Clock size={16} /> Scheduled
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "past" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("past")}
        >
          <CalendarDays size={16} /> Historical Log
        </button>
      </div>

      {/* Event List */}
      <AnimatePresence mode="wait">
        {filteredEvents.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIconCircle}>
              <BarChart3 size={40} color="#94A3B8" />
            </div>
            <p style={styles.emptyText}>No {activeTab === "upcoming" ? "scheduled" : "historical"} events found in database.</p>
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={styles.eventGrid}
          >
            {filteredEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{event.title}</h3>
                  <span style={{
                    ...styles.statusBadge, 
                    backgroundColor: activeTab === "upcoming" ? "#FEF3C7" : "#F1F5F9",
                    color: activeTab === "upcoming" ? "#D97706" : "#475569"
                  }}>
                    {activeTab === "upcoming" ? "Scheduled" : "Concluded"}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.detailRow}>
                    <CalendarDays size={14} color="#64748B" />
                    <span>{event.eventDate?.toDate().toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p style={styles.description}>{event.description}</p>
                </div>

                <div style={styles.expertPanel}>
                  <h4 style={styles.panelTitle}>Expert Assignment</h4>
                  <div style={styles.expertGrid}>
                    <div style={styles.expertItem}>
                      <Users size={14} color="#94A3B8" /> <strong>{event.expertName}</strong>
                    </div>
                    {event.expertise && (
                      <div style={styles.expertItem}>
                        <Briefcase size={14} color="#94A3B8" /> {event.expertise}
                      </div>
                    )}
                    <div style={{...styles.expertItem, gridColumn: "1 / -1"}}>
                      <Mail size={14} color="#94A3B8" /> {event.expertEmail}
                    </div>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <CheckCircle2 size={14} /> Authorized by {event.createdBy}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    padding: "100px 5% 80px 5%",
    background: "#F8FAFC",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  analyticsHeader: {
    maxWidth: "1000px",
    margin: "0 auto 40px auto",
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    border: "1px solid #E2E8F0",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subheading: {
    fontSize: "15px",
    color: "#64748B",
    margin: 0,
  },
  iconBox: {
    width: "60px", height: "60px", borderRadius: "16px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center"
  },
  statsRow: {
    display: "flex", gap: "20px", flexWrap: "wrap"
  },
  statCard: {
    flex: 1, minWidth: "150px", background: "#F8FAFC", borderRadius: "16px", padding: "20px", border: "1px solid #F1F5F9"
  },
  statLabel: { fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px" },
  statValue: { fontSize: "32px", fontWeight: "900", color: "#0F172A", lineHeight: "1" },

  tabContainer: {
    display: "flex",
    background: "#E2E8F0",
    borderRadius: "16px",
    padding: "6px",
    maxWidth: "400px",
    margin: "0 auto 40px auto",
  },
  tab: {
    flex: 1, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "transparent", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "800", color: "#64748B", cursor: "pointer", transition: "all 0.3s ease"
  },
  activeTab: { background: "#FFFFFF", color: "#0F172A", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },

  eventGrid: {
    maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px"
  },
  card: {
    background: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)", display: "flex", flexDirection: "column", overflow: "hidden"
  },
  cardHeader: {
    padding: "24px 24px 16px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px"
  },
  cardTitle: { fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0, lineHeight: "1.3" },
  statusBadge: { padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
  cardBody: { padding: "0 24px 20px 24px", flex: 1 },
  detailRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569", fontWeight: "600", marginBottom: "12px" },
  description: { fontSize: "14px", color: "#64748B", margin: 0, lineHeight: "1.6" },
  
  expertPanel: { margin: "0 24px", padding: "16px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #F1F5F9" },
  panelTitle: { fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: "0 0 12px 0", letterSpacing: "0.5px" },
  expertGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  expertItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#334155" },

  cardFooter: {
    padding: "16px 24px", marginTop: "20px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#94A3B8"
  },

  emptyState: { textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyIconCircle: { width: "80px", height: "80px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  emptyText: { fontSize: "15px", fontWeight: "600", color: "#64748B", margin: 0 },
};

export default MemberEventPanel;
