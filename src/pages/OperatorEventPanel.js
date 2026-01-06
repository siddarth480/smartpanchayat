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
import { CalendarDays, Clock, PlusCircle } from "lucide-react";

const secondaryAppName = "Secondary";
const secondaryApp =
  getApps().find((app) => app.name === secondaryAppName) ||
  initializeSecondaryApp(
    {
      apiKey: "AIzaSyAtIvRKozyar8ZIRO9D12UVadJPoWgZ494",
      authDomain: "smartpanchayat-d803c.firebaseapp.com",
      projectId: "smartpanchayat-d803c",
      storageBucket: "smartpanchayat-d803c.appspot.com",
      messagingSenderId: "369644064365",
      appId: "1:369644064365:web:f6a2e2a107c4b9d68e3964",
      measurementId: "G-ZT9KHM1BQM",
    },
    secondaryAppName
  );

const secondaryAuth = getAuth(secondaryApp);

const OperatorEventPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    expertName: "",
    expertEmail: "",
    expertPassword: "",
    expertise: "",
  });

  // Responsive detection
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

    if (
      !title ||
      !description ||
      !date ||
      !expertName ||
      !expertEmail ||
      !expertPassword ||
      !expertise
    ) {
      alert("Please fill in all fields.");
      return;
    }

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
      alert("✅ Event and expert created successfully!");

      setNewEvent({
        title: "",
        description: "",
        date: "",
        expertName: "",
        expertEmail: "",
        expertPassword: "",
        expertise: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const eventDate = event.eventDate?.toDate?.();
    return activeTab === "upcoming" ? eventDate >= now : eventDate < now;
  });

  return (
    <div
      style={{
        ...styles.container,
        paddingBottom: isMobile ? "90px" : "80px",
      }}
    >
      <h2 style={styles.heading}>📅 Operator Event Management</h2>
      <p style={styles.subheading}>
        Manage village events and create expert accounts seamlessly.
      </p>

      {/* Tabs */}
      <div
        style={{
          ...styles.tabContainer,
          width: isMobile ? "95%" : 340,
        }}
      >
        <div
          onClick={() => setActiveTab("upcoming")}
          style={{
            ...styles.tab,
            ...(activeTab === "upcoming" ? styles.activeTab : {}),
            fontSize: isMobile ? 13 : 15,
          }}
        >
          <Clock size={18} style={styles.tabIcon} />
          Upcoming
        </div>
        <div
          onClick={() => setActiveTab("past")}
          style={{
            ...styles.tab,
            ...(activeTab === "past" ? styles.activeTab : {}),
            fontSize: isMobile ? 13 : 15,
          }}
        >
          <CalendarDays size={18} style={styles.tabIcon} />
          Past
        </div>
      </div>

      {/* Form */}
      {activeTab === "upcoming" && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>🧾 Add New Event with Expert</h3>

          <div
            style={{
              ...styles.formGrid,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
              gap: isMobile ? 12 : 16,
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Event Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="e.g., Free vet checkup"
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Expertise</label>
              <input
                type="text"
                value={newEvent.expertise}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, expertise: e.target.value })
                }
                placeholder="e.g., Vet, Doctor, Agronomist"
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Short event details..."
                style={{
                  ...styles.textarea,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Expert Name</label>
              <input
                type="text"
                value={newEvent.expertName}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, expertName: e.target.value })
                }
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Expert Email</label>
              <input
                type="email"
                value={newEvent.expertEmail}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, expertEmail: e.target.value })
                }
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={newEvent.expertPassword}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, expertPassword: e.target.value })
                }
                style={{
                  ...styles.input,
                  padding: isMobile ? "9px 10px" : "10px 12px",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
              <button onClick={handleAddEvent} style={styles.primaryButton}>
                <PlusCircle size={16} style={{ marginRight: 8 }} />
                Add Event with Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events */}
      <div
        style={{
          ...styles.eventGrid,
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
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
                <strong>Expert:</strong> {event.expertName} ({event.expertEmail})
              </p>
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

// Styles
const styles = {
  container: {
    padding: "80px 5%",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
    minHeight: "100vh",
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#1e293b",
    boxSizing: "border-box",
  },
  heading: { fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 },
  subheading: { textAlign: "center", color: "#64748b", fontSize: 14, marginBottom: 28 },
  tabContainer: {
    margin: "0 auto 36px",
    display: "flex",
    backgroundColor: "#dbe4f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },
  activeTab: {
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#fff",
  },
  formCard: {
    width: "100%",
    maxWidth: 1210,
    margin: "0 auto 40px",
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    boxSizing: "border-box",
  },
  formTitle: { fontSize: 18, fontWeight: 700, color: "#0f1724", marginBottom: 18 },
  formGrid: { display: "grid", width: "100%", boxSizing: "border-box" },
  label: { fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%",
    maxWidth: "100%",
    borderRadius: 10,
    border: "1px solid #d1d9e3",
    backgroundColor: "#f9fbff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 100,
    borderRadius: 10,
    border: "1px solid #d1d9e3",
    backgroundColor: "#f9fbff",
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 10,
    background: "linear-gradient(90deg,#2563eb,#3b82f6)",
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  eventGrid: {
    display: "grid",
    gap: 20,
    width: "100%",
    boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
  },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  eventDetail: { fontSize: 14, color: "#475569", marginBottom: 8 },
  empty: { textAlign: "center", color: "#94a3b8", padding: 20 },
};

export default OperatorEventPanel;
