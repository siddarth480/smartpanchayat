import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ExpertInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;

      try {
        const snapshot = await getDocs(collection(db, "chats"));
        const chats = [];

        snapshot.forEach((doc) => {
          const chatId = doc.id;
          const data = doc.data();

          if (chatId.includes(currentUser.email)) {
            const [email1, email2] = chatId.split("_");
            const otherUser = email1 === currentUser.email ? email2 : email1;

            const lastMsg = data.lastMessage || {};
            const isUnread =
              lastMsg.sender !== currentUser.email &&
              !(lastMsg.readBy || []).includes(currentUser.email);

            chats.push({
              chatId,
              otherUser,
              lastMessage: lastMsg.text || "No messages yet",
              timestamp: lastMsg.timestamp?.toDate() || null,
              isUnread,
            });
          }
        });

        chats.sort(
          (a, b) =>
            (b.timestamp?.getTime?.() || 0) - (a.timestamp?.getTime?.() || 0)
        );

        setConversations(chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchConversations();
  }, [currentUser]);

  const goToChat = (villagerEmail) => {
    navigate(`/expert-chat/${encodeURIComponent(villagerEmail)}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const tsDate = timestamp.toDateString();

    if (tsDate === today) {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (tsDate === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📨 Villager Messages</h2>

      {loading ? (
        <p style={styles.loading}>Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p style={styles.noChats}>No conversations yet.</p>
      ) : (
        <div style={styles.list}>
          {conversations.map((conv) => (
            <div
              key={conv.chatId}
              style={{ ...styles.card, borderLeftColor: conv.isUnread ? "#2563eb" : "#e5e7eb" }}
              onClick={() => goToChat(conv.otherUser)}
            >
              <div style={styles.avatar}>👤</div>
              <div style={styles.details}>
                <div style={styles.row}>
                  <strong style={styles.userEmail}>{conv.otherUser}</strong>
                  <div style={styles.meta}>
                    {conv.isUnread && <span style={styles.newBadge}>New</span>}
                    {conv.timestamp && (
                      <span style={styles.timestamp}>{formatTime(conv.timestamp)}</span>
                    )}
                  </div>
                </div>
                <p style={styles.preview}>
                  {conv.lastMessage.length > 60
                    ? conv.lastMessage.slice(0, 60) + "..."
                    : conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "850px",
    margin: "80px auto",
    padding: "24px",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f0f6ff",
  },
  title: {
    fontSize: "28px",
    fontWeight: 600,
    textAlign: "center",
    color: "#1e40af",
    marginBottom: "30px",
  },
  loading: {
    textAlign: "center",
    color: "#4b5563",
  },
  noChats: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    gap: "16px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    borderLeft: "4px solid #2563eb",
  },
  avatar: {
    fontSize: "28px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  userEmail: {
    fontSize: "16px",
    color: "#1e40af",
  },
  preview: {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  timestamp: {
    fontSize: "13px",
    color: "#6b7280",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  newBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
};

export default ExpertInbox;
