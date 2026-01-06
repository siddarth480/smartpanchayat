import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { CalendarDays, Clock } from "lucide-react";

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

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📅 Panchayat Event Overview</h2>
      <p style={styles.subheading}>
        View all events organized in your village with expert details.
      </p>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "upcoming" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("upcoming")}
        >
          <Clock size={18} style={styles.tabIcon} />
          Upcoming
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "past" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("past")}
        >
          <CalendarDays size={18} style={styles.tabIcon} />
          Past
        </div>
      </div>

      {/* Event List */}
      <div style={styles.eventGrid}>
        {filteredEvents.length === 0 ? (
          <p style={styles.empty}>No {activeTab} events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} style={styles.card}>
              <h3 style={styles.cardTitle}>{event.title}</h3>
              <p style={styles.eventDetail}>
                <strong>Date:</strong>{" "}
                {event.eventDate.toDate().toLocaleDateString()}
              </p>
              <p style={styles.eventDetail}>{event.description}</p>
              <p style={styles.eventDetail}>
                <strong>Expert:</strong> {event.expertName}
              </p>
              <p style={styles.eventDetail}>
                <strong>Email:</strong> {event.expertEmail}
              </p>
              {event.expertise && (
                <p style={styles.eventDetail}>
                  <strong>Expertise:</strong> {event.expertise}
                </p>
              )}
              <p style={styles.eventDetail}>
                <strong>Created By:</strong> {event.createdBy}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 🧭 Styles (matching your OperatorEventPanel)
const styles = {
  container: {
    padding: "90px 7%",
    background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    color: "#1e293b",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "10px",
  },
  subheading: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "40px",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dbe4f0",
    borderRadius: "999px",
    overflow: "hidden",
    width: "340px",
    margin: "0 auto 50px auto",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    padding: "12px 0",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    color: "#334155",
    transition: "all 0.3s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#fff",
    boxShadow: "0 3px 8px rgba(37,99,235,0.3)",
  },
  tabIcon: {
    marginRight: "6px",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.3s ease",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1f3b57",
  },
  eventDetail: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "6px",
    lineHeight: "1.5",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "16px",
    marginTop: "30px",
  },
};

export default MemberEventPanel;
