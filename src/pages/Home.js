import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LogIn,
  Shield,
  Users,
  Smartphone,
  UserPlus,
  Building,
  Sparkles,
  Heart,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import heroImage from "../assets/hero-village.png";

const Home = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Scroll Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Transparent Governance",
      description:
        "Project tracking dashboard, financial transparency, and real-time updates on all government initiatives.",
      details: [
        "Budget tracking",
        "Project milestones",
        "Public expenditure reports",
      ],
    },
    {
      icon: Users,
      title: "Community Engagement",
      description:
        "Discussion boards, polls, and notifications to keep every villager connected and informed.",
      details: ["Village forums", "Democratic polls", "Notifications"],
    },
    {
      icon: Smartphone,
      title: "Digital Services",
      description:
        "Bill payments, approvals, and service request tracking - all from your smartphone.",
      details: ["Online payments", "Document approvals", "Status tracking"],
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: "Register Online",
      step: "01",
      description: "Quick and easy registration process for community members.",
    },
    {
      icon: Smartphone,
      title: "Access Services",
      step: "02",
      description:
        "Use digital services, join discussions, and vote on issues.",
    },
    {
      icon: Building,
      title: "Build Communities",
      step: "03",
      description:
        "Create accountable governance and inclusive decision-making.",
    },
  ];

  return (
    <div style={styles.container}>
      <style>{`
        :root {
          --radius: 1.5rem;
        }
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; overflow-x: hidden; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        .gradient-text {
          background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* --- Floating Bubbles --- */

        .float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: blur(40px);
          animation: floatAnim 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        /* --- Scroll Animations --- */
        .reveal { opacity: 0; transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .reveal-up { transform: translateY(50px); }
        .reveal-left { transform: translateX(-50px); }
        .reveal-pop { transform: scale(0.9); }
        .reveal.active { opacity: 1; transform: translate(0) scale(1); }
        .delay-1 { transition-delay: 0.1s; } .delay-2 { transition-delay: 0.2s; } .delay-3 { transition-delay: 0.3s; }

        /* --- Buttons --- */
        .button {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 16px 32px; border-radius: 12px; font-weight: 600;
          cursor: pointer; transition: 0.3s; border: none; text-decoration: none; gap: 10px;
        }
        .button-primary { background: #22c55e; color: white; }
        .button-glass { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); }
        .button:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }

        /* --- Responsive Design --- */
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .hero-image-container { display: none !important; }
          .hero-title { font-size: 2.8rem !important; }
          .hero-buttons { flex-direction: column; width: 100%; max-width: 320px; }
          .button { width: 100%; }
        }
      `}</style>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.floatingElements}>
          <div style={styles.float1} className="float"></div>
          <div
            style={{ ...styles.float2, animationDelay: "2s" }}
            className="float"
          ></div>
        </div>

        <div
          className="bubble"
          style={{
            bottom: "20%",
            right: "8%",
            width: "180px",
            height: "180px",
            animationDelay: "2s",
          }}
        ></div>

        <div className="container">
          <div style={styles.heroGrid} className="hero-grid">
            <div
              style={styles.heroContent}
              className="hero-content reveal reveal-up active"
            >
              <h1 style={styles.heroTitle} className="hero-title">
                SmartPanchayat
              </h1>
              <p style={styles.heroSubtitle}>Digitalizing Rural Governance</p>
              <p style={styles.heroDescription}>
                Join the revolution transforming rural India. Empower your
                community with real-time tracking, transparent finances, and
                digital services.
              </p>
              <div style={styles.heroButtons} className="hero-buttons">
                <button
                  className="button button-primary"
                  onClick={() => navigate("/register")}
                >
                  Get Started <ArrowRight size={20} />
                </button>
                <button
                  className="button button-glass"
                  onClick={() => navigate("/login")}
                >
                  <LogIn size={20} /> Login
                </button>
              </div>
            </div>
            <div
              className="hero-image-container"
              style={styles.heroImageContainer}
            >
              <img src={heroImage} alt="Hero" style={styles.heroImage} />
            </div>
          </div>
        </div>

        <div style={styles.bottomWave}>
          <svg
            viewBox="0 0 1440 120"
            style={styles.waveSvg}
            preserveAspectRatio="none"
          >
            <path
              fill="#f8fafc"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,85.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div className="container">
          <div style={styles.sectionHeader} className="reveal reveal-up">
            <h2 style={styles.sectionTitle}>
              Transforming <span className="gradient-text">Village Life</span>
            </h2>
            <p style={styles.sectionDescription}>
              Modern tools for modern communities.
            </p>
          </div>
          <div style={styles.cardGrid}>
            {features.map((f, i) => (
              <div
                key={i}
                className={`reveal reveal-left delay-${i + 1}`}
                style={styles.featureCard}
              >
                <div style={styles.featureIcon}>
                  <f.icon size={32} color="#22c55e" />
                </div>
                <h3 style={{ marginBottom: "15px" }}>{f.title}</h3>
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "20px",
                  }}
                >
                  {f.description}
                </p>
                <ul
                  style={{ listStyle: "none", padding: 0, textAlign: "left" }}
                >
                  {f.details.map((d, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                        color: "#64748b",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          background: "#22c55e",
                          borderRadius: "50%",
                        }}
                      ></div>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section style={{ padding: "100px 0", background: "white" }}>
        <div className="container">
          <div style={styles.sectionHeader} className="reveal reveal-up">
            <h2 style={styles.sectionTitle}>
              How <span className="gradient-text">It Works</span>
            </h2>
          </div>
          <div style={styles.cardGrid}>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`reveal reveal-pop delay-${i + 1}`}
                style={{ position: "relative", textAlign: "center" }}
              >
                <div style={styles.stepNumber}>{s.step}</div>
                <div style={styles.stepCard}>
                  <div style={{ marginBottom: "15px" }}>
                    <s.icon size={40} color="#22c55e" />
                  </div>
                  <h3 style={{ marginBottom: "10px" }}>{s.title}</h3>
                  <p style={{ color: "#64748b" }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seamless CTA Section with Bubbles */}
      <section style={styles.ctaSection}>
        <div
          className="bubble"
          style={{ top: "10%", right: "10%", width: "100px", height: "100px" }}
        ></div>
        <div
          className="bubble"
          style={{
            bottom: "15%",
            left: "8%",
            width: "130px",
            height: "130px",
            animationDelay: "1.5s",
          }}
        ></div>

        <div
          className="container reveal reveal-up"
          style={{ textAlign: "center", position: "relative", zIndex: 5 }}
        >
          <Sparkles size={48} color="white" style={{ marginBottom: "20px" }} />
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              color: "white",
              marginBottom: "20px",
            }}
          >
            Ready to Transform Your Village?
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "40px",
              maxWidth: "700px",
              margin: "0 auto 40px",
            }}
          >
            Join thousands of villages already experiencing transparent
            governance and digital empowerment.
          </p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="button button-glass"
                style={{ background: "white", color: "#166534" }}
                onClick={() => navigate("/register")}
              >
                <UserPlus size={20} /> Register Now
              </button>

              <button
                className="button button-glass"
                onClick={() => navigate("/login")}
              >
                <LogIn size={20} /> Citizen Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container">
          <div style={styles.footerGrid}>
            <div style={{ flex: 1 }}>
              <h3
                className="gradient-text"
                style={{ fontSize: "1.8rem", marginBottom: "15px" }}
              >
                🌿 SmartPanchayat
              </h3>
              <p style={{ opacity: 0.7, maxWidth: "350px", lineHeight: "1.6" }}>
                Building stronger, more connected rural communities through
                digital governance.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "20px",
                  opacity: 0.8,
                }}
              >
                <Heart size={16} color="#ef4444" /> Made for Rural India
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Mail size={18} color="#22c55e" /> hello@smartpanchayat.in
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Phone size={18} color="#22c55e" /> +91 1800-SMART-01
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <MapPin size={18} color="#22c55e" /> Pune, India
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "60px",
              paddingTop: "30px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
              opacity: 0.5,
              fontSize: "0.9rem",
            }}
          >
            © {currentYear} SmartPanchayat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  floatingElements: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  float1: {
    position: "absolute",
    top: "10%",
    left: "5%",
    width: "100px",
    height: "100px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "50%",
  },

  float2: {
    position: "absolute",
    top: "20%",
    right: "10%",
    width: "150px",
    height: "150px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "50%",
  },

  container: { minHeight: "100vh" },
  heroSection: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #166534 0%, #1e40af 100%)",
    overflow: "hidden",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "50px",
    alignItems: "center",
    position: "relative",
    zIndex: 3,
  },
  heroTitle: {
    fontSize: "4rem",
    fontWeight: "800",
    color: "white",
    margin: "0 0 20px",
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: "1.6rem",
    color: "rgba(255,255,255,0.9)",
    margin: "0 0 20px",
  },
  heroDescription: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.6,
    marginBottom: "40px",
    maxWidth: "550px",
  },
  heroButtons: { display: "flex", gap: "16px" },
  heroImage: {
    width: "100%",
    borderRadius: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  bottomWave: { position: "absolute", bottom: -2, width: "100%", zIndex: 2 },
  waveSvg: { position: "relative", top: "2px", width: "100%", height: "80px" },

  featuresSection: { padding: "100px 0", background: "#f8fafc" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  featureCard: {
    padding: "40px",
    background: "white",
    borderRadius: "1.5rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  featureIcon: {
    marginBottom: "20px",
    display: "inline-block",
    padding: "15px",
    background: "#f0fdf4",
    borderRadius: "1rem",
  },

  stepNumber: {
    width: "45px",
    height: "45px",
    background: "#22c55e",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    margin: "0 auto -22px",
    position: "relative",
    zIndex: 5,
  },
  stepCard: {
    padding: "50px 30px",
    background: "#f8fafc",
    borderRadius: "1.5rem",
    border: "1px solid #e2e8f0",
  },

  ctaSection: {
    position: "relative",
    padding: "120px 0",
    background: "linear-gradient(135deg, #166534 0%, #1e40af 100%)",
    overflow: "hidden",
  },
  footer: { padding: "80px 0 40px", background: "#0f172a", color: "white" },
  footerGrid: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "50px",
  },

  sectionHeader: { textAlign: "center", marginBottom: "60px" },
  sectionTitle: { fontSize: "2.8rem", fontWeight: "800", margin: "0 0 15px" },
  sectionDescription: { color: "#64748b", fontSize: "1.2rem" },
};

export default Home;
