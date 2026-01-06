import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase/firebase";
import { useParams } from "react-router-dom";

const ExpertChat = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { villagerEmail } = useParams(); // ← Read from route
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [villagers, setVillagers] = useState([]);
  const [selectedVillager, setSelectedVillager] = useState(null);
  const bottomRef = useRef(null);

  // Set selected villager from URL
  useEffect(() => {
    if (villagerEmail) {
      setSelectedVillager(decodeURIComponent(villagerEmail));
    }
  }, [villagerEmail]);

  const chatId =
    currentUser && selectedVillager
      ? [currentUser.email, selectedVillager].sort().join("_")
      : null;

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Load all villagers
  useEffect(() => {
    const fetchVillagers = async () => {
      if (!currentUser) return;

      const snapshot = await getDocs(collection(db, "chats"));
      const chatUsers = snapshot.docs
        .filter((doc) => doc.id.includes(currentUser.email))
        .map((doc) => {
          const [u1, u2] = doc.id.split("_");
          return u1 === currentUser.email ? u2 : u1;
        });

      setVillagers([...new Set(chatUsers)]);
    };

    fetchVillagers();
  }, [currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !chatId) return;

    const message = {
      text: input.trim(),
      sender: currentUser.email,
      timestamp: serverTimestamp(),
    };

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [currentUser.email, selectedVillager],
          lastMessage: message,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), message);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatContainer}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarHeader}>SmartPanchayat</h2>
          {villagers.map((villager, idx) => (
            <div
              key={idx}
              style={{
                ...styles.villagerBox,
                backgroundColor:
                  villager === selectedVillager ? "#dbeafe" : "#eff6ff",
              }}
              onClick={() => setSelectedVillager(villager)}
            >
              {villager}
            </div>
          ))}
        </aside>

        {/* Chat Window */}
        <div style={styles.chatBox}>
          <div style={styles.chatHeader}>
            {selectedVillager ? (
              <>
                Chat with{" "}
                <span style={styles.chatUser}>{selectedVillager}</span>
              </>
            ) : (
              "Select a villager to start chatting"
            )}
          </div>

          <div style={styles.messages}>
            {selectedVillager &&
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.message,
                    alignSelf:
                      msg.sender === currentUser.email
                        ? "flex-end"
                        : "flex-start",
                    backgroundColor:
                      msg.sender === currentUser.email ? "#3b82f6" : "#e0f2fe",
                    color:
                      msg.sender === currentUser.email ? "#fff" : "#1e293b",
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={styles.timestamp}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedVillager
                  ? "Type your message..."
                  : "Select a villager first"
              }
              style={styles.input}
              disabled={!selectedVillager}
            />
            <button
              onClick={sendMessage}
              style={{
                ...styles.sendButton,
                opacity: selectedVillager ? 1 : 0.5,
                cursor: selectedVillager ? "pointer" : "not-allowed",
              }}
              disabled={!selectedVillager}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    backgroundColor: "#f0f9ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px", // 🔽 Less top padding
    boxSizing: "border-box",
  },

  chatContainer: {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    height: "calc(105vh - 160px)", // 🔽 Decreased from 92vh or similar
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: "60px", // 🔽 Lower than before (was 115px)
  },

  sidebar: {
    width: "260px",
    backgroundColor: "#fff",
    borderRight: "1px solid #e5e7eb",
    padding: "20px",
    overflowY: "auto",
  },

  sidebarHeader: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "20px",
  },

  villagerBox: {
    padding: "12px",
    backgroundColor: "#eff6ff",
    borderRadius: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "#1d4ed8",
    transition: "transform 0.2s, box-shadow 0.2s", // for hover animation
  },

  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f9ff",
    overflow: "hidden",
  },

  chatHeader: {
    padding: "16px",
    background: "linear-gradient(to right, #dbeafe, #60a5fa)",
    color: "#1e3a8a",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "16px",
  },

  chatUser: {
    color: "#1e40af",
  },

  messages: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
    backgroundColor: "#f0f9ff",
  },

  message: {
    padding: "12px 16px",
    borderRadius: "20px",
    maxWidth: "65%",
    fontSize: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  timestamp: {
    fontSize: "11px",
    opacity: 0.6,
    textAlign: "right",
  },

  inputWrapper: {
    padding: "16px",
    display: "flex",
    backgroundColor: "#fff",
    borderTop: "1px solid #e5e7eb",
  },

  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "30px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  },

  sendButton: {
    marginLeft: "12px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "0 20px",
    borderRadius: "30px",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default ExpertChat;
