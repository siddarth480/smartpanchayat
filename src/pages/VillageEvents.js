import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  Clock, 
  User, 
  MessageCircle, 
  MapPin, 
  CalendarHeart,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Sort: upcoming events nearest first, past events most recent first
  filteredEvents.sort((a, b) => {
    const dateA = a.eventDate?.toDate();
    const dateB = b.eventDate?.toDate();
    if (activeTab === "upcoming") {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  const handleChatRedirect = (expertEmail) => {
    const encodedEmail = encodeURIComponent(expertEmail);
    navigate(`/chat/${encodedEmail}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <div style={styles.heroHeader}>
        <div style={styles.heroContent}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.5 }}
            style={styles.iconWrapper}
          >
            <CalendarHeart size={40} color="#FFFFFF" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1, duration: 0.5 }}
            style={styles.heading}
          >
            Village Events & Gatherings
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            style={styles.subheading}
          >
            Discover upcoming activities, connect with domain experts, and participate in building a stronger community.
          </motion.p>
        </div>
      </div>

      {/* Modern Pill Tabs */}
      <div style={styles.tabWrapper}>
        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(activeTab === "upcoming" ? styles.activeTab : {}) }}
            onClick={() => setActiveTab("upcoming")}
          >
            <Clock size={16} /> Upcoming Events
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "past" ? styles.activeTab : {}) }}
            onClick={() => setActiveTab("past")}
          >
            <CalendarDays size={16} /> Past Events
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <AnimatePresence mode="wait">
        {filteredEvents.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIconCircle}>
              <CalendarDays size={48} color="#94A3B8" />
            </div>
            <h3 style={styles.emptyTitle}>No {activeTab} events right now</h3>
            <p style={styles.emptyText}>Check back later for new community activities.</p>
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={styles.grid}
          >
            {filteredEvents.map((event) => {
              const dateObj = event.eventDate?.toDate();
              const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
              const day = dateObj.getDate();
              const year = dateObj.getFullYear();
              
              // Dynamic time badge
              const isToday = dateObj.toDateString() === now.toDateString();
              const daysDiff = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24));
              let timeLabel = "";
              if (activeTab === "upcoming") {
                if (isToday) timeLabel = "Happening Today";
                else if (daysDiff === 1) timeLabel = "Tomorrow";
                else if (daysDiff <= 7) timeLabel = `In ${daysDiff} Days`;
              } else {
                timeLabel = "Concluded";
              }

              return (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    {/* Calendar Block */}
                    <div style={styles.dateBlock}>
                      <span style={styles.dateMonth}>{month}</span>
                      <span style={styles.dateDay}>{day}</span>
                      <span style={styles.dateYear}>{year}</span>
                    </div>
                    
                    <div style={styles.cardHeaderInfo}>
                      <div style={styles.titleRow}>
                        <h3 style={styles.cardTitle}>{event.title}</h3>
                        {timeLabel && (
                          <span style={{
                            ...styles.timeBadge, 
                            backgroundColor: activeTab === "upcoming" ? "#FEF3C7" : "#F1F5F9",
                            color: activeTab === "upcoming" ? "#D97706" : "#64748B"
                          }}>
                            {timeLabel}
                          </span>
                        )}
                      </div>
                      <p style={styles.locationMeta}>
                        <MapPin size={14} /> Gram Panchayat Ground
                      </p>
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.description}>{event.description}</p>
                    
                    <div style={styles.expertSection}>
                      <div style={styles.expertAvatar}>
                        <User size={20} color="#2563EB" />
                      </div>
                      <div style={styles.expertInfo}>
                        <span style={styles.expertRole}>Expert Host</span>
                        <span style={styles.expertName}>{event.expertName}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <button
                      style={styles.chatButton}
                      onClick={() => handleChatRedirect(event.expertEmail)}
                    >
                      <span><MessageCircle size={18} /> Chat with Expert</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    padding: "0 0 80px 0",
    background: "#F8FAFC",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  heroHeader: {
    background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
    padding: "120px 20px 80px 20px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  heading: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#FFFFFF",
    margin: "0 0 16px 0",
    letterSpacing: "-1px",
  },
  subheading: {
    fontSize: "18px",
    color: "#DBEAFE",
    margin: 0,
    lineHeight: "1.6",
    fontWeight: "400",
  },
  
  tabWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "-25px", // Overlap the hero
    marginBottom: "40px",
    position: "relative",
    zIndex: 10,
  },
  tabContainer: {
    display: "flex",
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "6px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    gap: "4px",
  },
  tab: {
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#64748B",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeTab: {
    background: "#EFF6FF",
    color: "#2563EB",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    padding: "24px 24px 0 24px",
    gap: "16px",
  },
  dateBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "16px",
    width: "70px",
    height: "80px",
    flexShrink: 0,
  },
  dateMonth: { fontSize: "12px", fontWeight: "800", color: "#EF4444", textTransform: "uppercase" },
  dateDay: { fontSize: "24px", fontWeight: "900", color: "#0F172A", lineHeight: "1.1" },
  dateYear: { fontSize: "11px", fontWeight: "700", color: "#64748B" },
  
  cardHeaderInfo: { flex: 1 },
  titleRow: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" },
  cardTitle: { fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0, lineHeight: "1.3" },
  timeBadge: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
  locationMeta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B", margin: "8px 0 0 0", fontWeight: "500" },

  cardBody: {
    padding: "20px 24px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  description: { fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 24px 0", flex: 1 },
  
  expertSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "16px",
    border: "1px dashed #CBD5E1"
  },
  expertAvatar: {
    width: "40px", height: "40px", borderRadius: "12px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center"
  },
  expertInfo: { display: "flex", flexDirection: "column" },
  expertRole: { fontSize: "11px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" },
  expertName: { fontSize: "14px", color: "#0F172A", fontWeight: "700" },

  cardFooter: {
    padding: "20px 24px 24px 24px",
  },
  chatButton: {
    width: "100%",
    padding: "14px",
    background: "#0F172A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background 0.3s ease",
  },
  
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIconCircle: {
    width: "80px", height: "80px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px"
  },
  emptyTitle: { fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: "0 0 8px 0" },
  emptyText: { fontSize: "15px", color: "#64748B", margin: 0 },
};

export default VillageEvents;
