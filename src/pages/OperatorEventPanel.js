import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  Timestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { initializeApp as initializeSecondaryApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  User, 
  Mail, 
  Lock, 
  Briefcase,
  Type,
  FileText,
  CalendarPlus,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const secondaryAppName = "Secondary";
const secondaryApp =
  getApps().find((app) => app.name === secondaryAppName) ||
  initializeSecondaryApp(
    {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    },
    secondaryAppName
  );

const secondaryAuth = getAuth(secondaryApp);

const OperatorEventPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    expertName: "",
    expertEmail: "",
    expertPassword: "",
    expertise: "",
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleAddEvent = async () => {
    const {
      title,
      description,
      date,
      expertName,
      expertEmail,
      expertPassword,
      expertise,
    } = newEvent;

    if (!title || !description || !date || !expertName || !expertEmail || !expertPassword || !expertise) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        expertEmail,
        expertPassword
      );
      const expertUID = userCredential.user.uid;

      await setDoc(doc(db, "users", expertUID), {
        fullName: expertName,
        email: expertEmail,
        role: "expert",
        expertise,
        createdAt: Timestamp.now(),
      });

      await addDoc(collection(db, "events"), {
        title,
        description,
        eventDate: Timestamp.fromDate(new Date(date)),
        expertName,
        expertEmail,
        createdBy: user?.fullName || "Operator",
        createdAt: Timestamp.now(),
        status: "upcoming",
      });

      await signOut(secondaryAuth);
      
      setNewEvent({
        title: "", description: "", date: "", expertName: "", expertEmail: "", expertPassword: "", expertise: "",
      });
      alert("✅ Event and expert created successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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



  return (
    <div style={{ ...styles.container, paddingBottom: isMobile ? "90px" : "80px" }}>
      
      {/* Hero Header */}
      <div style={styles.heroHeader}>
        <div style={styles.heroContent}>
          <div style={styles.iconWrapper}>
            <ShieldCheck size={40} color="#FFFFFF" />
          </div>
          <h2 style={styles.heading}>Operator Event Management</h2>
          <p style={styles.subheading}>
            Schedule village events and automatically provision access credentials for visiting experts.
          </p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Form Area */}
      <AnimatePresence mode="wait">
        {activeTab === "upcoming" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.formCard}
          >
            <div style={styles.formHeader}>
              <div>
                <h3 style={styles.formTitle}>Schedule New Event</h3>
                <p style={styles.formSubtitle}>This will create an event and email credentials for the expert.</p>
              </div>
              <div style={styles.formBadge}>
                <CalendarPlus size={16} color="#2563EB" />
              </div>
            </div>

            <div style={{...styles.formGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)"}}>
              <div style={{ gridColumn: "1 / -1" }}>
                <InputWrapper label="Event Title" icon={<Type size={18} />}>
                  <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g., Free vet checkup" style={styles.input} />
                </InputWrapper>
              </div>

              <InputWrapper label="Event Date" icon={<CalendarDays size={18} />}>
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} style={styles.input} />
              </InputWrapper>

              <InputWrapper label="Expert's Field" icon={<Briefcase size={18} />}>
                <input type="text" value={newEvent.expertise} onChange={(e) => setNewEvent({ ...newEvent, expertise: e.target.value })} placeholder="e.g., Agronomist" style={styles.input} />
              </InputWrapper>

              <div style={{ gridColumn: "1 / -1" }}>
                <InputWrapper label="Event Description" icon={<FileText size={18} />}>
                  <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Provide detailed information about the event..." style={styles.textarea} />
                </InputWrapper>
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                <h4 style={styles.sectionDivider}>Expert Credentials Generation</h4>
              </div>

              <InputWrapper label="Expert Name" icon={<User size={18} />}>
                <input type="text" value={newEvent.expertName} onChange={(e) => setNewEvent({ ...newEvent, expertName: e.target.value })} placeholder="Full Name" style={styles.input} />
              </InputWrapper>

              <InputWrapper label="Expert Login Email" icon={<Mail size={18} />}>
                <input type="email" value={newEvent.expertEmail} onChange={(e) => setNewEvent({ ...newEvent, expertEmail: e.target.value })} placeholder="expert@example.com" style={styles.input} />
              </InputWrapper>

              <div style={{ gridColumn: "1 / -1" }}>
                <InputWrapper label="Expert Temporary Password" icon={<Lock size={18} />}>
                  <input type="password" value={newEvent.expertPassword} onChange={(e) => setNewEvent({ ...newEvent, expertPassword: e.target.value })} placeholder="Min 6 characters" style={styles.input} />
                </InputWrapper>
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                <button onClick={handleAddEvent} style={styles.primaryButton} disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Provisioning Expert..."
                  ) : (
                    <>
                      <Plus size={20} style={{ marginRight: 8 }} />
                      Create Event & Generate Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Grid */}
      <div style={styles.adminSectionHeader}>
        <h3 style={styles.adminSectionTitle}>{activeTab === "upcoming" ? "Scheduled Events" : "Archived Events"} ({filteredEvents.length})</h3>
      </div>

      <div style={{ ...styles.eventGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))" }}>
        {filteredEvents.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", ...styles.emptyState }}>
            <CalendarDays size={48} color="#CBD5E1" />
            <p>No {activeTab} events found.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={event.id} 
              style={styles.adminCard}
            >
              <div style={styles.adminCardHeader}>
                <h4 style={styles.adminCardTitle}>{event.title}</h4>
                <span style={styles.adminDateBadge}>{event.eventDate.toDate().toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
              </div>
              <div style={styles.adminCardBody}>
                <p style={styles.adminDesc}>{event.description}</p>
                <div style={styles.expertBlock}>
                  <div style={styles.expertBlockIcon}><User size={16} /></div>
                  <div>
                    <div style={styles.expertBlockName}>{event.expertName}</div>
                    <div style={styles.expertBlockEmail}>{event.expertEmail}</div>
                  </div>
                </div>
              </div>
              <div style={styles.adminCardFooter}>
                <div style={styles.creatorMeta}>
                  <CheckCircle2 size={14} /> Created by {event.createdBy}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
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
    padding: "100px 20px 60px 20px",
    textAlign: "center",
    position: "relative",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconWrapper: {
    width: "70px", height: "70px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  heading: { fontSize: "36px", fontWeight: "800", color: "#FFFFFF", margin: "0 0 16px 0", letterSpacing: "-1px" },
  subheading: { fontSize: "16px", color: "#94A3B8", margin: 0, lineHeight: "1.6" },
  
  tabWrapper: { display: "flex", justifyContent: "center", marginTop: "-25px", marginBottom: "40px", position: "relative", zIndex: 10 },
  tabContainer: { display: "flex", background: "#FFFFFF", borderRadius: "16px", padding: "6px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", gap: "4px" },
  tab: { padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", color: "#64748B", cursor: "pointer", transition: "all 0.3s ease" },
  activeTab: { background: "#EFF6FF", color: "#2563EB" },

  formCard: {
    maxWidth: "1000px",
    margin: "0 auto 40px auto",
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    overflow: "hidden",
  },
  formHeader: { padding: "30px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" },
  formTitle: { fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px 0" },
  formSubtitle: { fontSize: "14px", color: "#64748B", margin: 0 },
  formBadge: { width: "40px", height: "40px", borderRadius: "12px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" },
  
  formGrid: { display: "grid", gap: "20px", padding: "30px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#475569" },
  inputContainer: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "16px", color: "#94A3B8", display: "flex", pointerEvents: "none" },
  input: {
    width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "#FFFFFF", fontSize: "14px", color: "#0F172A", outline: "none", transition: "border 0.2s", boxSizing: "border-box"
  },
  textarea: {
    width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "#FFFFFF", fontSize: "14px", color: "#0F172A", outline: "none", minHeight: "120px", resize: "vertical", boxSizing: "border-box"
  },
  sectionDivider: { fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", margin: "10px 0", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" },
  
  primaryButton: {
    width: "100%", padding: "16px", background: "linear-gradient(90deg, #2563EB, #3B82F6)", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s ease", boxShadow: "0 4px 10px rgba(37,99,235,0.2)"
  },

  adminSectionHeader: { maxWidth: "1200px", margin: "0 auto 20px auto", padding: "0 20px" },
  adminSectionTitle: { fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0 },
  
  eventGrid: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "grid", gap: "24px" },
  adminCard: { background: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
  adminCardHeader: { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" },
  adminCardTitle: { fontSize: "16px", fontWeight: "800", color: "#0F172A", margin: 0, lineHeight: "1.4" },
  adminDateBadge: { padding: "6px 12px", background: "#F1F5F9", color: "#475569", borderRadius: "8px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" },
  adminCardBody: { padding: "0 20px 20px 20px", flex: 1 },
  adminDesc: { fontSize: "14px", color: "#64748B", margin: "0 0 20px 0", lineHeight: "1.6" },
  expertBlock: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#F8FAFC", borderRadius: "12px", border: "1px solid #F1F5F9" },
  expertBlockIcon: { width: "32px", height: "32px", borderRadius: "8px", background: "#E2E8F0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" },
  expertBlockName: { fontSize: "13px", fontWeight: "800", color: "#0F172A" },
  expertBlockEmail: { fontSize: "12px", color: "#64748B" },
  adminCardFooter: { padding: "16px 20px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" },
  creatorMeta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "#94A3B8" },

  emptyState: { textAlign: "center", color: "#94A3B8", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
};

const InputWrapper = ({ icon, children, label }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <div style={styles.inputContainer}>
      <div style={styles.inputIcon}>{icon}</div>
      {children}
    </div>
  </div>
);

export default OperatorEventPanel;
