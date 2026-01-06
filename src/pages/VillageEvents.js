import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, User, MessageCircle } from "lucide-react";

const VillageEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();

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
    if (!eventDate) return false;
    return activeTab === "upcoming" ? eventDate >= now : eventDate < now;
  });

  const handleChatRedirect = (expertEmail) => {
    const encodedEmail = encodeURIComponent(expertEmail);
    navigate(`/chat/${encodedEmail}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>🏡 Village Events</h2>
        <p style={styles.subheading}>
          Stay updated with upcoming activities and revisit past highlights in your community.
        </p>
      </div>

      {/* Tab Section */}
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

      {/* Events Section */}
      {filteredEvents.length === 0 ? (
        <div style={styles.emptyState}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No events"
            style={styles.emptyImage}
          />
          <p>No {activeTab} events found.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              style={styles.card}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <h3 style={styles.cardTitle}>{event.title}</h3>
              <p style={styles.eventDetail}>
                <CalendarDays size={16} style={styles.icon} />
                <strong>Date:</strong>{" "}
                {event.eventDate.toDate().toLocaleDateString()}
              </p>
              <p style={styles.eventDetail}>
                <User size={16} style={styles.icon} />
                <strong>Expert:</strong> {event.expertName} ({event.expertEmail})
              </p>
              <p style={styles.description}>{event.description}</p>

              <button
                style={styles.chatButton}
                onClick={() => handleChatRedirect(event.expertEmail)}
              >
                <MessageCircle size={16} style={{ marginRight: 6 }} />
                Chat with Expert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "90px 7%",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    color: "#1e293b",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0",
    backgroundColor: "#e2e8f0",
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
    backgroundColor: "transparent",
  },
  activeTab: {
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#fff",
    boxShadow: "0 3px 8px rgba(37,99,235,0.3)",
  },
  tabIcon: {
    marginRight: "6px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "28px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "26px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#1e293b",
  },
  eventDetail: {
    fontSize: "14px",
    margin: "6px 0",
    display: "flex",
    alignItems: "center",
    color: "#475569",
  },
  icon: {
    marginRight: "6px",
    color: "#2563eb",
  },
  description: {
    marginTop: "12px",
    fontSize: "15px",
    color: "#334155",
    lineHeight: "1.5",
  },
  chatButton: {
    marginTop: "20px",
    padding: "10px 24px",
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    textAlign: "center",
    marginTop: "60px",
    color: "#64748b",
    fontSize: "16px",
  },
  emptyImage: {
    width: "90px",
    marginBottom: "20px",
    opacity: 0.7,
  },
};

export default VillageEvents;
