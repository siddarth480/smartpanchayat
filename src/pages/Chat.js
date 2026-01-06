import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

const Chat = () => {
  const { expertEmail } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const chatEndRef = useRef(null);

  const chatId =
    currentUser && expertEmail
      ? [currentUser.email, expertEmail].sort().join("_")
      : null;

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !chatId) return;

    const message = {
      text: input.trim(),
      sender: currentUser.email,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), message);

      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [currentUser.email, expertEmail],
          lastMessage: message,
        },
        { merge: true }
      );

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.chatCard}>
        <div style={styles.header}>
          💬 Chat with <strong>{decodeURIComponent(expertEmail)}</strong>
        </div>

        <div style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                alignSelf:
                  msg.sender === currentUser.email ? "flex-end" : "flex-start",
                backgroundColor:
                  msg.sender === currentUser.email ? "#3b82f6" : "#e2e8f0",
                color: msg.sender === currentUser.email ? "#fff" : "#1e293b",
              }}
            >
              <div>{msg.text}</div>
              <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div style={styles.inputSection}>
          <textarea
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

const TAB_HEIGHT = 100; // your bottom nav height

const styles = {
  pageWrapper: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflow: "hidden",
    paddingTop: "100px", // desktop only
    boxSizing: "border-box",
  },
  chatCard: {
    width: "100%",
    maxWidth: "720px",
    height: `calc(93vh - 100px)`,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },
  header: {
    padding: "16px",
    fontSize: "18px",
    fontWeight: "600",
    backgroundColor: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    gap: "12px",
    backgroundColor: "#f8fafc",
  },
  message: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: "16px",
    fontSize: "15px",
    wordBreak: "break-word",
    display: "flex",
    flexDirection: "column",
  },
  timestamp: {
    fontSize: "11px",
    textAlign: "right",
    marginTop: "4px",
    opacity: 0.6,
  },
  inputSection: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    gap: "8px",
  },
  input: {
    flex: 1,
    resize: "none",
    borderRadius: "16px",
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  sendButton: {
    padding: "10px 12px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
  },

  // --- Mobile fixes ---
  "@media (max-width: 640px)": {
    pageWrapper: {
      paddingTop: "0px", // remove top gap
      backgroundColor: "#fff",
    },
    chatCard: {
      height: "100vh", // full height
      borderRadius: "0",
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    header: {
      fontSize: "16px",
      padding: "12px",
      backgroundColor: "#fff",
      borderBottom: "1px solid #eee",
    },
    messagesContainer: {
      padding: "10px",
      backgroundColor: "#fff",
      paddingBottom: `${TAB_HEIGHT + 60}px`, // leave room for input + nav
    },
    inputSection: {
      position: "fixed",
      bottom: `${TAB_HEIGHT}px`, // sit above nav bar
      left: 0,
      right: 0,
      maxWidth: "720px",
      margin: "0 auto",
      backgroundColor: "#fff",
    },
    message: {
      maxWidth: "85%",
      fontSize: "14px",
    },
  },
};


export default Chat;
