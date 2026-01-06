import React, { useState, useEffect } from "react";
import {
  AiOutlineBell,
  AiOutlineSend,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlineAlert,
  AiOutlineCalendar,
  AiOutlineFileText,
  AiOutlineTool,
} from "react-icons/ai";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const NotifyPage = () => {
  const currentUser = auth.currentUser;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  const getTypeStyle = (type) => {
    switch (type) {
      case "danger":
        return { bg: "#fef2f2", color: "#dc2626", icon: <AiOutlineAlert /> };
      case "meeting":
        return { bg: "#eff6ff", color: "#2563eb", icon: <AiOutlineCalendar /> };
      case "program":
        return {
          bg: "#faf5ff",
          color: "#9333ea",
          icon: <AiOutlineInfoCircle />,
        };
      case "scheme":
        return { bg: "#f0fdf4", color: "#166534", icon: <AiOutlineFileText /> };
      case "complaint":
        return { bg: "#fff7ed", color: "#ea580c", icon: <AiOutlineTool /> };
      default:
        return { bg: "#f8fafc", color: "#475569", icon: <AiOutlineBell /> };
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendOrUpdate = async () => {
    if (!message.trim()) return showToast("Please enter a message!", "error");
    setSending(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "notifications", editingId), {
          title,
          message,
          type,
        });
        showToast("Notification updated!", "success");
      } else {
        await addDoc(collection(db, "notifications"), {
          title,
          message,
          type,
          role: "all",
          readBy: [],
          senderId: currentUser?.uid || null,
          timestamp: serverTimestamp(),
        });
        showToast("Notification sent!", "success");
      }
      resetForm();
    } catch (err) {
      showToast("Operation failed", "error");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this notification?")) {
      try {
        await deleteDoc(doc(db, "notifications", id));
        showToast("Notification removed", "success");
      } catch (err) {
        showToast("Delete failed", "error");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setType("general");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Notification Center</h1>
        <p style={styles.subTitle}>
          Broadcast alerts, schemes, and updates to the village members.
        </p>
      </div>

      <div style={styles.contentGrid}>
        {/* Left: Form */}
        <div style={styles.formCard}>
          <h2 style={styles.cardTitle}>
            {editingId ? <AiOutlineEdit /> : <AiOutlineSend />}
            {editingId ? "Modify Announcement" : "Create Announcement"}
          </h2>

          {toast && (
            <div
              style={{
                ...styles.toast,
                backgroundColor:
                  toast.type === "success" ? "#d1fae5" : "#fee2e2",
                color: toast.type === "success" ? "#065f46" : "#991b1b",
              }}
            >
              {toast.msg}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Heading</label>
            <input
              style={styles.input}
              placeholder="e.g. Gram Sabha Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Message Content</label>
            <textarea
              style={styles.textarea}
              placeholder="Detailed announcement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              style={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="general">Standard Update</option>
              <option value="danger">High Alert / Emergency</option>
              <option value="meeting">Meeting Announcement</option>
              <option value="program">Event / Program</option>
              <option value="scheme">New Government Scheme</option>
              <option value="complaint">Complaint Resolution</option>
            </select>
          </div>

          <div style={styles.buttonRow}>
            <button
              style={{ ...styles.mainButton, opacity: sending ? 0.7 : 1 }}
              onClick={handleSendOrUpdate}
              disabled={sending}
            >
              {editingId ? "Update Now" : "Publish Notification"}
            </button>
            {editingId && (
              <button style={styles.cancelButton} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Right: List */}
        <div style={styles.listSection}>
          <h2 style={styles.cardTitle}>
            <AiOutlineBell /> Recent Broadcasts
          </h2>
          <div style={styles.scrollArea}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>No notifications sent yet.</div>
            ) : (
              notifications.map((n) => {
                const config = getTypeStyle(n.type);
                return (
                  <div key={n.id} style={styles.notifCard}>
                    <div
                      style={{
                        ...styles.typeBadge,
                        backgroundColor: config.bg,
                        color: config.color,
                      }}
                    >
                      {config.icon} {n.type?.toUpperCase()}
                    </div>
                    <div style={styles.notifContent}>
                      <h4 style={styles.notifTitle}>
                        {n.title || "Announcement"}
                      </h4>
                      <p style={styles.notifText}>{n.message}</p>
                      <span style={styles.notifTime}>
                        {n.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>
                    <div style={styles.cardActions}>
                      <button
                        style={styles.iconBtn}
                        onClick={() => {
                          setTitle(n.title);
                          setMessage(n.message);
                          setType(n.type);
                          setEditingId(n.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <AiOutlineEdit color="#4f46e5" size={18} />
                      </button>
                      <button
                        style={styles.iconBtn}
                        onClick={() => handleDelete(n.id)}
                      >
                        <AiOutlineDelete color="#dc2626" size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "100px 20px 40px",
    fontFamily: "'Inter', sans-serif",
    color: "#1e293b",
  },
  header: { marginBottom: "30px" },
  mainTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "8px",
  },
  subTitle: { color: "#64748b", fontSize: "16px" },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
    alignItems: "start",
  },
  formCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#334155",
  },
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minHeight: "100px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  buttonRow: { display: "flex", gap: "10px", marginTop: "10px" },
  mainButton: {
    flex: 1,
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },
  cancelButton: {
    padding: "14px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "10px",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
  },
  listSection: { display: "flex", flexDirection: "column", gap: "15px" },
  scrollArea: { maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" },
  notifCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "15px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    position: "relative",
    transition: "0.2s",
    ":hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  },
  typeBadge: {
    alignSelf: "flex-start",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  notifContent: { paddingRight: "60px" },
  notifTitle: { margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700" },
  notifText: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.5",
  },
  notifTime: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "8px",
    display: "block",
  },
  cardActions: {
    position: "absolute",
    top: "16px",
    right: "16px",
    display: "flex",
    gap: "8px",
  },
  iconBtn: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  toast: {
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default NotifyPage;
