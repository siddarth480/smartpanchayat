// src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import BirdGif from "../assets/birds.gif";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import VillageImage from "../assets/home.png";
import VillageInfo1 from "../assets/img1.png";
import VillageInfo2 from "../assets/img2.png";
import VillageInfo3 from "../assets/img3.png";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const commentRefs = useRef({});

  // ---------------- Smart Tips Carousel (Different Design) ----------------
  const tips = [
    "Save water by fixing leaks promptly.",
    "Dispose of garbage according to schedule.",
    "Participate in village meetings to voice concerns.",
    "Check your eligibility for new government schemes.",
    "Report damaged roads or infrastructure immediately.",
  ];

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) navigate("/login");
      else {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) setUser({ ...currentUser, ...userDoc.data() });
          else
            setUser({
              ...currentUser,
              fullName: "Unknown User",
              role: "villager",
            });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const snap = await getDocs(
        query(collection(db, "memberPosts"), orderBy("createdAt", "desc"))
      );
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };
    fetchPosts();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const all = {};
      for (const post of posts) {
        const snap = await getDocs(
          query(
            collection(db, "memberPosts", post.id, "comments"),
            orderBy("createdAt", "asc")
          )
        );
        all[post.id] = snap.docs.map((d) => d.data());
      }
      setComments(all);
    };
    if (posts.length > 0) fetchComments();
  }, [posts]);

  // Add comment
  const handleCommentSubmit = async (postId) => {
    const text = newComment[postId]?.trim();
    if (!text) return;

    const comment = {
      text,
      email: user?.email || "anonymous",
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "memberPosts", postId, "comments"), comment);

    setNewComment((prev) => ({ ...prev, [postId]: "" }));
    setComments((prev) => {
      const updated = {
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          { ...comment, createdAt: new Date() },
        ],
      };
      setTimeout(() => {
        commentRefs.current[postId]?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return updated;
    });
  };

  // Scroll-in animation hook
  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-animate");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("visible")
        );
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, [posts]);

  const filteredPosts = posts.filter(
    (post) =>
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "100px" }}>Loading...</p>
    );

  return (
    <div style={styles.wrapper}>
      {/* KEYFRAMES: birds start at header top-left and stay fully opaque */}
      <style>{`
        @keyframes flyLoop {
          0%   { transform: translateX(0vw)   translateY(0vh)  rotate(0deg);   opacity: 1; }
          25%  { transform: translateX(25vw)  translateY(10vh) rotate(10deg);  opacity: 1; }
          50%  { transform: translateX(55vw)  translateY(22vh) rotate(-8deg);  opacity: 1; }
          75% { transform: translateX(90vw) translateY(10vh) rotate(5deg); opacity: 1; }
          100% { transform: translateX(110vw) translateY(-10vh) rotate(0deg); opacity: 1; }
        }

        /* Other animations & responsive rules */
        @keyframes fadeSlideUp {0% {opacity:0; transform:translateY(20px);}100% {opacity:1; transform:translateY(0);}}
        @keyframes fadeIn {0% {opacity:0;}100% {opacity:1;}}
        @keyframes gradientText {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}

        .animate-title {
          opacity:0;
          animation: fadeSlideUp 1s ease forwards, gradientText 3s ease infinite;
          background: linear-gradient(90deg,#ff7e5f,#feb47b,#ff7e5f);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .post-card-animate { opacity:0; transform: translateY(20px); transition: all 0.6s ease; }
        .post-card-animate.visible { opacity:1; transform: translateY(0); }
        .post-card-animate:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 16px 32px rgba(0,0,0,0.2); }
        .scroll-animate { opacity:0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .scroll-animate.visible { opacity:1; transform: translateY(0); }
        .comment-bubble { animation: fadeIn 0.4s ease forwards; padding:10px 14px; border-radius:16px; margin-bottom:8px; max-width:75%; word-wrap: break-word; }
        .comment-bubble.user { background-color:#1e3a8a; color:#fff; align-self:flex-end; }
        .comment-bubble.other { background-color:#e5e7eb; color:#111827; align-self:flex-start; }
        .comment-list { display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:300px; padding-right:6px; }
        input:focus { border-color: #1e3a8a; box-shadow: 0 0 5px rgba(30,58,138,0.3); }

        @media (max-width: 1024px) { .headerContent { gap: 20px; } .headerImage { max-width: 400px; } }
        @media (max-width: 768px) {
        .headerContent {
          display: flex;
          flex-direction: column; /* stack text and image */
          align-items: center;    /* center horizontally */
          text-align: center;     /* center text */
          gap: 20px;              /* spacing between title and image */
        }
        .headerTitle {
          font-size: 36px;        /* smaller font for mobile */
        }
        .headerSubtitle {
          font-size: 16px;        /* smaller subtitle */
        }
        .headerImage {
          max-width: 80%;         /* scale image to fit mobile screen */
          height: auto;           /* maintain aspect ratio */
        }
      }

      @media (max-width: 480px) {
        .headerTitle {
          font-size: 28px;        /* very small screens */
        }
        .headerSubtitle {
          font-size: 14px;
        }
        .headerImage {
          max-width: 100%;
        }
      }

      `}</style>
      {/* Header */}
      <section style={styles.header}>
        <div className="headerContent" style={styles.headerContent}>
          <div>
            <h1
              className="animate-title headerTitle"
              style={styles.headerTitle}
            >
              🌿 SmartPanchayat
            </h1>
            <p className="headerSubtitle" style={styles.headerSubtitle}>
              Empowering villages with transparency & technology
            </p>
          </div>
          <div>
            <img
              className="headerImage"
              src={VillageImage}
              alt="Village Illustration"
              style={styles.headerImage}
            />
          </div>
        </div>

        {/* Birds animation */}
        <div style={styles.birdsContainer}>
          <img
            src={BirdGif}
            alt="bird"
            style={{ ...styles.bird, ...styles.bird1 }}
          />
          <img
            src={BirdGif}
            alt="bird"
            style={{ ...styles.bird, ...styles.bird2 }}
          />
          <img
            src={BirdGif}
            alt="bird"
            style={{ ...styles.bird, ...styles.bird3 }}
          />
        </div>
      </section>
      {/* Info Section */}
      <section style={styles.infoSection}>
        <h2 style={styles.infoSectionTitle}>Why Choose SmartPanchayat?</h2>
        {[
          {
            img: VillageInfo1,
            title: "Transparent Governance",
            text: "SmartPanchayat enables villages to maintain transparent records, track projects, and ensure accountability at every level.",
            list: [
              "Project tracking dashboard",
              "Financial transparency reports",
              "Real-time notifications of decisions",
            ],
            reverse: false,
          },
          {
            img: VillageInfo2,
            title: "Community Engagement",
            text: "Engage villagers through notifications, posts, and discussion boards. Encourage collaboration and participation.",
            list: [
              "Discussion boards & polls",
              "Event notifications",
              "Community surveys",
            ],
            reverse: true,
          },
          {
            img: VillageInfo3,
            title: "Digital Services",
            text: "Access essential services online, from bill payments to approvals, making administration faster and convenient.",
            list: [
              "Bill payments & approvals",
              "Service request tracking",
              "Online grievance submissions",
            ],
            reverse: false,
          },
        ].map((info, i) => (
          <div
            key={i}
            style={{
              ...styles.infoRow,
              flexDirection: info.reverse ? "row-reverse" : "row",
            }}
            className="scroll-animate"
          >
            <div style={styles.infoImageWrapper}>
              <img src={info.img} alt={info.title} style={styles.infoImage} />
            </div>
            <div style={styles.infoText}>
              <h2 style={styles.infoTextTitle}>{info.title}</h2>
              <p style={styles.infoTextBody}>{info.text}</p>
              <ul style={styles.infoList}>
                {info.list.map((item, j) => (
                  <li key={j} style={styles.infoListItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
      // Inside your component return, below Services section:
      <div
        style={{  
          padding: "60px 20px",
          overflow: "hidden",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "34px",
            fontWeight: "700",
            color: "#d97706", // amber-dark
            marginBottom: "40px",
          }}
        >
          Smart Village Tips
        </h2>

        <motion.div
          style={{
            display: "flex",
            gap: "20px",
          }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {tips.concat(tips).map((tip, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              style={{
                flex: "0 0 280px",
                background: "linear-gradient(135deg, #ffedd5, #fed7aa)",
                borderRadius: "25px",
                padding: "25px",
                textAlign: "center",
                boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                fontSize: "16px",
                fontWeight: "600",
                color: "#7c2d12",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                💡
              </span>
              {tip}
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <h3 style={styles.footerTitle}>🌿 SmartPanchayat</h3>
          <p style={styles.footerText}>
            Building smarter, more transparent villages with technology.
          </p>
          <p style={styles.footerCopy}>
            © {new Date().getFullYear()} SmartPanchayat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
// Styles
const styles = {
  wrapper: {
    fontFamily: "Segoe UI, sans-serif",
    minHeight: "100vh",
    color: "#fff",
  },
  header: {
    position: "relative", // ✅ needed so birds position inside header
    height: "73vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
    overflow: "hidden",
    backgroundColor: "#1d3a90",
  },
  headerContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "10px",
    maxWidth: "1200px",
    width: "118%",
    height: "100%",
  },
  headerImage: {
    width: "140%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  headerTitle: { fontSize: "52px", fontWeight: "700", marginBottom: "16px" },
  headerSubtitle: { fontSize: "20px", color: "#cbd5e1" },

  infoSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "80px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "80px",
    backgroundColor: "#fff",
    color: "#111827",
  },
  infoSectionTitle: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#1e3a8a",
    textAlign: "center",
    marginBottom: "40px",
    letterSpacing: "-0.5px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "50px",
    flexWrap: "wrap",
  },
  infoImageWrapper: { flex: 1, minWidth: "320px" },
  infoImage: {
    width: "100%",
    borderRadius: "20px",
    transition: "transform 0.4s ease",
  },
  infoText: { flex: 1, minWidth: "320px" },
  infoTextTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "16px",
  },
  infoTextBody: {
    fontSize: "18px",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "16px",
  },
  infoList: {
    listStyle: "disc inside",
    paddingLeft: "0",
    margin: 0,
  },
  infoListItem: {
    fontSize: "16px",
    marginBottom: "8px",
    color: "#4b5563",
  },

  // Footer
  footer: {
    backgroundColor: "#1d3a90",
    color: "#fff",
    textAlign: "center",
    padding: "40px 20px",
    marginTop: "60px",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
  },
  footerContent: { maxWidth: "800px", margin: "0 auto" },
  footerTitle: { fontSize: "24px", fontWeight: "700", marginBottom: "12px" },
  footerText: { fontSize: "16px", color: "#e5e7eb", marginBottom: "16px" },
  footerCopy: { fontSize: "14px", color: "#9ca3af" },

  main: {
    backgroundColor: "#f9fafb",
    color: "#111827",
    padding: "40px 20px",
    marginTop: "-60px",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#1e3a8a",
    textAlign: "center",
  },

  postCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    marginBottom: "32px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  postLeft: { padding: "20px", borderRight: "1px solid #e5e7eb" },
  postRight: { padding: "20px", display: "flex", flexDirection: "column" },
  postHeader: { display: "flex", alignItems: "center", marginBottom: "12px" },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginRight: "12px",
    fontSize: "20px",
  },
  author: { fontWeight: "600", fontSize: "16px" },
  date: { fontSize: "12px", color: "#6b7280" },
  caption: { marginBottom: "12px", fontSize: "16px" },
  mediaWrapper: { marginBottom: "12px" },
  media: {
    width: "100%",
    borderRadius: "12px",
    maxHeight: "300px",
    objectFit: "cover",
    transition: "all 0.3s ease",
  },

  commentTitle: { fontWeight: "600", marginBottom: "8px" },
  commentInputRow: { display: "flex", gap: "8px", marginTop: "auto" },
  input: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },
  sendButton: {
    backgroundColor: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background 0.3s ease",
  },

  searchBar: {
    display: "block",
    margin: "20px auto",
    width: "100%",
    maxWidth: "500px",
    padding: "12px 20px",
    borderRadius: "30px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },

  // Birds overlay
  birdsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    overflow: "hidden",
  },
  bird: {
    position: "absolute",
    top: "20%",
    left: "-10%",
    width: "60px", // ✅ reduce size here
    height: "auto", // keep aspect ratio
    animation: "flyLoop 25s linear infinite",
    zIndex: 2,
  },

  bird1: { top: "20%", animationDelay: "0s", width: "50px" },
  bird2: { top: "40%", animationDelay: "5s", width: "70px" },
  bird3: { top: "10%", animationDelay: "10s", width: "40px" },
};

export default Dashboard;
