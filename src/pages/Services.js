import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  HeartHandshake,
  Users,
  Banknote,
  Trash2,
  MessageSquare,
  ArrowRight,
  Vote,
  Search,
  Landmark,
  ShieldAlert,
  CalendarCheck,
  FileText,
  FileSignature
} from "lucide-react";
import "./Services.css";

const Services = ({ user }) => {
  const navigate = useNavigate();
  const role = user?.role || "villager";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Carousel Data
  const slides = [
    {
      src: "/digital_panchayat_office_1778152566768.png",
      title: "Digital Grampanchayat",
      subtitle: "Empowering villages through smart governance and transparency.",
    },
    {
      src: "/transparent_village_governance_1778152632290.png",
      title: "Transparent Governance",
      subtitle: "Track village schemes, budgets, and events in real-time.",
    },
    {
      src: "/community_village_gathering_1778152695389.png",
      title: "Community First",
      subtitle: "Participate in polls, report issues, and shape the future of your village.",
    }
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
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
    certificates: {
      villager: "/certificates",
      operator: "/certificate-requests",
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

    if (!baseRoute) return;

    if (key === "meeting") {
      const todayId = new Date().toISOString().split("T")[0];
      navigate(`${baseRoute}/${todayId}`);
    } else {
      navigate(baseRoute);
    }
  };

  const servicesByRole = {
    villager: [
      {
        key: "complaint",
        title: "Raise Complaint",
        desc: "Report issues regarding water, roads, or electricity.",
        icon: ShieldAlert,
        color: "#6366f1",
      },
      {
        key: "certificates",
        title: "Certificates",
        desc: "Apply for and download Birth and Death certificates.",
        icon: FileText,
        color: "#2563eb",
      },
      {
        key: "schemes",
        title: "Apply for Scheme",
        desc: "Browse and apply for govt welfare schemes.",
        icon: HeartHandshake,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Village Events",
        desc: "Stay updated on local festivals and meetings.",
        icon: CalendarCheck,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "View Budget",
        desc: "Monitor annual village fund expenditures.",
        icon: Landmark,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Waste Management",
        desc: "Request home pickup, track collection vehicles, and report blackspots.",
        icon: Trash2,
        color: "#10b981",
      },
      {
        key: "payment",
        title: "Online Payment",
        desc: "Securely pay house and water taxes online.",
        icon: Banknote,
        color: "#8b5cf6",
      },
      {
        key: "meeting",
        title: "Live Meeting",
        desc: "Watch live Panchayat meetings with AI summaries.",
        icon: MessageSquare,
        color: "#8b5cf6",
      },

      {
        key: "polls",
        title: "Democratic Polls",
        desc: "Vote on village development projects and community decisions.",
        icon: Vote,
        color: "#ef4444",
      },
    ],
    operator: [
      {
        key: "complaint",
        title: "Manage Issues",
        desc: "Track, assign, and resolve villager complaints.",
        icon: ClipboardList,
        color: "#6366f1",
      },
      {
        key: "certificates",
        title: "Certificate Requests",
        desc: "Review and approve villager certificate applications.",
        icon: FileSignature,
        color: "#2563eb",
      },
      {
        key: "schemes",
        title: "Manage Schemes",
        desc: "Update eligibility and add new village schemes.",
        icon: HeartHandshake,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Manage Events",
        desc: "Organize community programs and sessions.",
        icon: CalendarCheck,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "Manage Budget",
        desc: "Upload and maintain official financial records.",
        icon: Landmark,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Duty Dashboard",
        desc: "View pending pickup requests and manage daily routes.",
        icon: Trash2,
        color: "#ef4444",
      },
      {
        key: "payment",
        title: "Payment Records",
        desc: "Verify and manage villager tax payments.",
        icon: Banknote,
        color: "#8b5cf6",
      },
      {
        key: "meeting",
        title: "Meeting AI",
        desc: "Start AI transcription and summarization for meetings.",
        icon: MessageSquare,
        color: "#8b5cf6",
      },
      {
        key: "polls",
        title: "Manage Polls",
        desc: "Create new community polls and set voting dates.",
        icon: Vote,
        color: "#ef4444",
      },
    ],
    member: [
      {
        key: "complaint",
        title: "Complaint Review",
        desc: "Acknowledge and oversee resolution progress.",
        icon: ClipboardList,
        color: "#6366f1",
      },
      {
        key: "schemes",
        title: "Scheme Status",
        desc: "Monitor approval rates for applications.",
        icon: HeartHandshake,
        color: "#10b981",
      },
      {
        key: "events",
        title: "Village Events",
        desc: "Participate in festivals and gatherings.",
        icon: CalendarCheck,
        color: "#f59e0b",
      },
      {
        key: "budget",
        title: "View Budget",
        desc: "Detailed access to fund usage and reports.",
        icon: Landmark,
        color: "#3b82f6",
      },
      {
        key: "garbage",
        title: "Sanitation Oversight",
        desc: "Monitor village cleanliness and operator efficiency.",
        icon: Trash2,
        color: "#3b82f6",
      },
      {
        key: "meeting",
        title: "Meeting Portal",
        desc: "Access live meeting transcripts and AI decisions.",
        icon: MessageSquare,
        color: "#8b5cf6",
      },
      {
        key: "polls",
        title: "Poll Analytics",
        desc: "View community consensus and live voting results.",
        icon: Vote,
        color: "#ef4444",
      },
    ],
    expert: [
      {
        key: "messages",
        title: "Villager Messages",
        desc: "Respond to expert queries and give guidance.",
        icon: MessageSquare,
        color: "#6366f1",
      },
      {
        key: "events",
        title: "Join Discussions",
        desc: "Engage in live village awareness programs.",
        icon: Users,
        color: "#f59e0b",
      },
    ],
  };

  const services = servicesByRole[role] || [];
  
  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    service.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="services-page-wrapper">
      
      {/* Hero Section with Background Carousel */}
      <section className="services-hero">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.src} alt={slide.title} className="hero-slide-bg" />
          </div>
        ))}
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">{slides[currentSlide].title}</h1>
          <p className="hero-subtitle">{slides[currentSlide].subtitle}</p>
        </div>
      </section>

      {/* Search/Filter Bar */}
      <div className="services-search-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder={`Search ${role} services...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="services-search-input"
          />
        </div>
      </div>

      {/* Main Services Grid */}
      <main className="services-main">
        <div className="services-header">
          <h2>
            <span style={{ textTransform: 'capitalize' }}>{role}</span> <span className="gradient-text">Services Portal</span>
          </h2>
          <p>Access your designated tools, track progress, and stay engaged.</p>
        </div>

        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((item) => (
              <div
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className="service-card"
              >
                <div
                  className="service-icon-box"
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  <item.icon size={32} />
                </div>

                <h3 className="service-title">{item.title}</h3>

                <p className="service-desc">{item.desc}</p>

                <div 
                  className="service-action"
                  style={{ color: item.color }}
                >
                  <span>LAUNCH SERVICE</span>
                  <ArrowRight size={18} className="service-action-icon" />
                </div>
              </div>
            ))
          ) : (
            <div className="no-services-found">
              <p>No services found matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Services;
