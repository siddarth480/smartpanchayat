import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClipboardList,
  FaHandsHelping,
  FaUsers,
  FaMoneyBill,
  FaTrash,
  FaComments,
  FaArrowRight,
  FaVoteYea,
} from "react-icons/fa";

const Services = ({ user }) => {
  const navigate = useNavigate();
  const role = user?.role || "villager";
  const [current, setCurrent] = useState(0);

  // Carousel Data
  const slides = [
    {
      src: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1600&q=80",
      title: "Digital Grampanchayat",
      subtitle:
        "Empowering villages through smart governance and transparency.",
    },
    {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
      title: "Transparent Governance",
      subtitle: "Track village schemes, budgets, and events in real-time.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(interval);
  }, [slides.length]);

  const pathMap = {
    complaint: {
      villager: "/complaints",
      operator: "/services/operator-complaints",
      member: "/services/acknowledge",
    },
    schemes: {
      villager: "/schemes",
      operator: "/operator/schemes",
      member: "/member/schemes",
    },

    polls: {
      villager: "/services/polls",
      operator: "/operator/create-poll",
      member: "/member/poll-results",
    },
    events: {
      villager: "/services/events",
      operator: "/services/events",
      member: "/services/events",
      expert: "/expert-inbox",
    },
    budget: {
      villager: "/budget",
      operator: "/budget/manage",
      member: "/budget/approval",
    },
    garbage: {
      villager: "/garbage-management",
      operator: "/garbage-management",
      member: "/garbage-management",
    },
    meeting: {
      villager: "/meetings/live-view",
      operator: "/meetings/start-analysis",
      member: "/meetings/live-view",
    },
    messages: { expert: "/expert-inbox" },
    payment: { villager: "/payment", operator: "/operator/payments" },
  };

  const handleNavigate = (key) => {
    const baseRoute = pathMap[key]?.[role];

    if (!baseRoute) return; // Safety check

    if (key === "meeting") {
      // Generate an ID based on today's date (e.g., "2025-12-31")
      const todayId = new Date().toISOString().split("T")[0];

      // This combines the path from pathMap with the ID
      // Example Result: /meetings/live-view/2025-12-31
      navigate(`${baseRoute}/${todayId}`);
    } else {
      // Regular navigation for all other services
      navigate(baseRoute);
    }
  };

  const servicesByRole = {
    villager: [
      {
        key: "complaint",
        title: "Raise Complaint",
        desc: "Report issues regarding water, roads, or electricity.",
        icon: <FaClipboardList />,
        color: "#6366f1",
      },
      {
        key: "schemes",
        title: "Apply for Scheme",
        desc: "Browse and apply for govt welfare schemes.",
        icon: <FaHandsHelping />,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Village Events",
        desc: "Stay updated on local festivals and meetings.",
        icon: <FaUsers />,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "View Budget",
        desc: "Monitor annual village fund expenditures.",
        icon: <FaMoneyBill />,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Waste Management",
        desc: "Request home pickup, track collection vehicles, and report village blackspots.",
        icon: <FaTrash />,
        color: "#10b981", // Changed to green for eco-friendly look
      },
      {
        key: "payment",
        title: "Online Payment",
        desc: "Securely pay house and water taxes online.",
        icon: <FaMoneyBill />,
        color: "#8b5cf6",
      },
      {
        key: "meeting",
        title: "Live Meeting",
        desc: "Watch live Panchayat meetings with AI summaries.",
        icon: <FaComments />,
        color: "#8b5cf6",
      },

      {
        key: "polls",
        title: "Democratic Polls",
        desc: "Vote on village development projects and community decisions.",
        icon: <FaVoteYea />,
        color: "#ef4444",
      },
    ],
    operator: [
      {
        key: "complaint",
        title: "Manage Issues",
        desc: "Track, assign, and resolve villager complaints.",
        icon: <FaClipboardList />,
        color: "#6366f1",
      },
      {
        key: "schemes",
        title: "Manage Schemes",
        desc: "Update eligibility and add new village schemes.",
        icon: <FaHandsHelping />,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Manage Events",
        desc: "Organize community programs and sessions.",
        icon: <FaUsers />,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "Manage Budget",
        desc: "Upload and maintain official financial records.",
        icon: <FaMoneyBill />,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Duty Dashboard",
        desc: "View pending pickup requests and manage daily collection routes.",
        icon: <FaTrash />,
        color: "#ef4444",
      },
      {
        key: "payment",
        title: "Payment Records",
        desc: "Verify and manage villager tax payments.",
        icon: <FaMoneyBill />,
        color: "#8b5cf6",
      },
      {
        key: "meeting",
        title: "Meeting AI",
        desc: "Start AI transcription and summarization for meetings.",
        icon: <FaComments />,
        color: "#8b5cf6",
      },
      {
        key: "polls",
        title: "Manage Polls",
        desc: "Create new community polls and set voting dates.",
        icon: <FaVoteYea />,
        color: "#ef4444",
      },
    ],
    member: [
      {
        key: "complaint",
        title: "Complaint Review",
        desc: "Acknowledge and oversee resolution progress.",
        icon: <FaClipboardList />,
        color: "#6366f1",
      },
      {
        key: "schemes",
        title: "Scheme Status",
        desc: "Monitor approval rates for applications.",
        icon: <FaHandsHelping />,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Village Events",
        desc: "Participate in festivals and gatherings.",
        icon: <FaUsers />,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "View Budget",
        desc: "Detailed access to fund usage and reports.",
        icon: <FaMoneyBill />,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Sanitation Oversight",
        desc: "Monitor village cleanliness, operator efficiency, and resolve waste complaints.",
        icon: <FaTrash />,
        color: "#3b82f6",
      },
      {
        key: "meeting",
        title: "Meeting Portal",
        desc: "Access live meeting transcripts and AI decisions.",
        icon: <FaComments />,
        color: "#8b5cf6",
      },
      {
        key: "polls",
        title: "Poll Analytics",
        desc: "View community consensus and live voting results.",
        icon: <FaVoteYea />,
        color: "#ef4444",
      },
    ],
    expert: [
      {
        key: "messages",
        title: "Villager Messages",
        desc: "Respond to expert queries and give guidance.",
        icon: <FaComments />,
        color: "#6366f1",
      },
      {
        key: "events",
        title: "Join Discussions",
        desc: "Engage in live village awareness programs.",
        icon: <FaUsers />,
        color: "#f59e0b",
      },
    ],
  };

  const services = servicesByRole[role] || [];

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* --- BALANCED HERO SECTION (55vh) --- */}
      <div
        style={{
          position: "relative",
          height: "55vh",
          minHeight: "400px",
          overflow: "hidden",
          marginTop: "70px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={slides[current].src}
            src={slides[current].src}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
            }}
          />
        </AnimatePresence>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.8))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: "900",
              marginBottom: "15px",
            }}
          >
            {slides[current].title}
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
              maxWidth: "700px",
              opacity: 0.9,
              fontWeight: "300",
            }}
          >
            {slides[current].subtitle}
          </motion.p>
        </div>
      </div>

      {/* --- DASHBOARD CONTENT --- */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 20px 100px",
        }}
      >
        <div
          style={{
            marginBottom: "40px",
            textAlign: "left",
            borderLeft: "6px solid #2563eb",
            paddingLeft: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              color: "#0f172a",
              fontWeight: "800",
              margin: 0,
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h2>
          <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: "1rem" }}>
            Access your smart village services
          </p>
        </div>

        <div
          className="services-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "25px",
          }}
        >
          {services.map((item) => (
            <motion.div
              key={item.key}
              whileHover={{ y: -10 }}
              onClick={() => handleNavigate(item.key)}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "30px",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #f1f5f9",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "14px",
                  background: `${item.color}15`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                {item.icon}
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  color: "#1e293b",
                  marginBottom: "10px",
                  fontWeight: "700",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "#475569",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  marginBottom: "25px",
                  flexGrow: 1,
                }}
              >
                {item.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "15px",
                  borderTop: "1px solid #f1f5f9",
                  color: item.color,
                  fontWeight: "700",
                  fontSize: "0.8rem",
                }}
              >
                LAUNCH SERVICE <FaArrowRight />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <style>
        {`
          @media (max-width: 1024px) {
            .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 640px) {
            .services-grid { grid-template-columns: 1fr !important; }
            main { padding-top: 30px !important; }
            div[style*="height: 55vh"] { height: 40vh !important; min-height: 300px !important; }
          }
          .services-grid > div:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Services;
