import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CreditCard,
  MessageSquareWarning,
  PenSquare,
  X,
  Image as ImageIcon,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Shield,
  Map,
  Activity,
  UserPlus,
  Building,
  UploadCloud,
  TrendingUp,
  BarChart2,
  PieChart,
  Bell
} from "lucide-react";
import "./Dashboard.css";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stats for Oversight
  const [stats, setStats] = useState({
    posts: 0,
    schemes: 0,
    complaints: 0,
  });

  // Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementType, setAnnouncementType] = useState("Info");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);

  const tips = [
    "Save water by fixing leaks promptly.",
    "Dispose of garbage according to schedule.",
    "Participate in village meetings to voice concerns.",
    "Check your eligibility for new government schemes.",
    "Report damaged roads or infrastructure immediately.",
  ];

  const initiatives = [
    {
      icon: Shield,
      title: "Secure Governance",
      description: "Access transparent records, track local projects, and monitor village budgets directly from your dashboard.",
      details: ["Real-time budget tracking", "Project milestones", "Expenditure reports"],
    },
    {
      icon: Map,
      title: "Village Planning",
      description: "Participate in mapping out new infrastructure and improving the layout of your community.",
      details: ["Infrastructure polls", "Road planning", "Resource mapping"],
    },
    {
      icon: Activity,
      title: "Health & Sanitation",
      description: "Stay updated on health camps, sanitation drives, and waste management schedules.",
      details: ["Waste collection routes", "Health camp dates", "Cleanliness drives"],
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: "Complete Your Profile",
      step: "01",
      description: "Ensure your details are up-to-date to access personalized schemes and services.",
    },
    {
      icon: FileText,
      title: "Apply for Services",
      step: "02",
      description: "Use the Quick Actions panel to apply for schemes or raise complaints instantly.",
    },
    {
      icon: Building,
      title: "Engage with Panchayat",
      step: "03",
      description: "Stay active, vote in polls, and help build a stronger, digitally empowered community.",
    },
  ];

  // Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ ...currentUser, ...userDoc.data() });
          } else {
            setUser({
              ...currentUser,
              fullName: "Unknown User",
              role: "villager",
            });
          }

          // Fetch Stats
          fetchStats();

        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch Live Announcements
  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(fetched);
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      const postsSnap = await getDocs(collection(db, "memberPosts"));
      const schemesSnap = await getDocs(collection(db, "schemes"));
      const complaintsSnap = await getDocs(collection(db, "complaints"));

      setStats({
        posts: postsSnap.size,
        schemes: schemesSnap.size,
        complaints: complaintsSnap.size,
      });
    } catch (error) {
      console.log("Error fetching stats:", error);
    }
  };

  // Scroll Animation Logic
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  // --- Quick Post Logic ---
  const handleMediaSelect = (e) => {
    setMediaFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeMedia = (index) => {
    const updated = [...mediaFiles];
    updated.splice(index, 1);
    setMediaFiles(updated);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const type = file.type.startsWith("video") ? "video" : "image";
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return { url: data.secure_url, type };
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && mediaFiles.length === 0)
      return alert("Add a caption or media.");

    setSubmitting(true);
    try {
      const uploaded = [];
      for (const file of mediaFiles) {
        uploaded.push(await uploadToCloudinary(file));
      }

      await addDoc(collection(db, "memberPosts"), {
        caption,
        media: uploaded,
        createdAt: serverTimestamp(),
        email: user.email,
        userId: user.uid,
      });

      setCaption("");
      setMediaFiles([]);
      setSuccessMessage("Post submitted successfully!");
      fetchStats(); // Update stats
      setTimeout(() => {
        setSuccessMessage("");
        setShowPostModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementMessage.trim()) return;
    setAnnouncementSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        type: announcementType,
        message: announcementMessage,
        createdAt: serverTimestamp(),
        author: user.fullName || user.email,
        userId: user.uid,
      });
      setAnnouncementMessage("");
      setSuccessMessage("Announcement posted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        setShowAnnouncementModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit announcement.");
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "100px" }}>Loading Dashboard...</p>;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Mock calculations for visual data oversight based on real fetched counts
  const mockResolutionRate = stats.complaints > 0 ? Math.min(Math.round((stats.complaints * 0.7)), stats.complaints) : 0;
  const mockSchemesReached = stats.schemes * 15;

  return (
    <div className="dashboard-wrapper">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="dashboard-bubble float" style={{ top: "10%", left: "5%", width: "120px", height: "120px" }}></div>
        <div className="dashboard-bubble float" style={{ bottom: "20%", right: "8%", width: "180px", height: "180px", animationDelay: "2s" }}></div>
        
        <div className="hero-container">
          <div className="hero-header-content">
            <div className="role-badge animate-slide-up delay-100">
               <Shield size={16} /> 
               {user?.role === "member" ? " Panchayat Member" : user?.role === "operator" ? "Village Operator" : "Village Resident"}
            </div>
            <h1 className="hero-greeting animate-slide-up delay-200">
              {getGreeting()}, <span className="gradient-text">{user?.fullName?.split(" ")[0] || "User"}</span>
            </h1>
            <p className="hero-subtitle animate-slide-up delay-300">
              Welcome to your SmartPanchayat Dashboard. Monitor activities, access digital services, and stay connected.
            </p>
            {user?.role === "member" && (
              <div className="hero-action-buttons animate-slide-up delay-400">
                <button 
                  className="hero-announcement-btn"
                  onClick={() => setShowAnnouncementModal(true)}
                >
                  <Bell size={18} /> Add Announcement
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bottom-wave">
          <svg
            viewBox="0 0 1440 120"
            className="wave-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <path
              fill="url(#wave-gradient)"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,85.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Broadcast Marquee */}
      <div className="broadcast-marquee-wrapper">
        <div className="broadcast-marquee-container">
          <div className="broadcast-label">
            <Bell size={18} color="#d97706" />
            <span>Announcements</span>
          </div>
          <div className="broadcast-track-container">
            <div className="broadcast-track">
              {announcements.length > 0 ? (
                <>
                  {announcements.map((ann, idx) => (
                    <React.Fragment key={idx}>
                      <span>
                        <strong style={{ color: ann.type === 'Alert' ? '#ef4444' : ann.type === 'Info' ? '#10b981' : '#3b82f6' }}>
                          {ann.type}:
                        </strong> {ann.message}
                      </span>
                      <span className="broadcast-separator">•</span>
                    </React.Fragment>
                  ))}
                  {/* Duplicate for infinite loop */}
                  {announcements.map((ann, idx) => (
                    <React.Fragment key={`dup-${idx}`}>
                      <span>
                        <strong style={{ color: ann.type === 'Alert' ? '#ef4444' : ann.type === 'Info' ? '#10b981' : '#3b82f6' }}>
                          {ann.type}:
                        </strong> {ann.message}
                      </span>
                      <span className="broadcast-separator">•</span>
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <span>No new announcements at this time.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        
        {/* Village Data Oversight Section */}
        <section>
          <div className="section-heading-wrapper reveal reveal-up">
            <h2 className="section-heading">Village Data <span className="gradient-text">Oversight</span></h2>
            <p className="section-description">A detailed look at the current status of government initiatives, community engagement, and issue resolution in your area.</p>
          </div>
          
          <div className="oversight-grid">
            {/* Oversight Card 1: Posts/Engagement */}
            <div className="oversight-card card-blue reveal reveal-up delay-1">
              <div className="oversight-card-header">
                <div className="oversight-icon-box">
                  <Users size={28} />
                </div>
                <PieChart size={24} color="#94a3b8" />
              </div>
              <h3 className="oversight-card-title">Community Updates</h3>
              <div className="oversight-main-stat">{stats.posts}</div>
              <div className="oversight-sub-stat">
                <TrendingUp size={16} color="#10b981" /> Official uploads tracking
              </div>
              <div className="oversight-progress-bg">
                <div className="oversight-progress-bar" style={{ width: '85%' }}></div>
              </div>
              <div className="oversight-footer">
                <span>Engagement Health</span>
                <span style={{ color: '#3b82f6' }}>Active</span>
              </div>
            </div>

            {/* Oversight Card 2: Schemes */}
            <div className="oversight-card card-green reveal reveal-up delay-2">
              <div className="oversight-card-header">
                <div className="oversight-icon-box">
                  <FileSpreadsheet size={28} />
                </div>
                <BarChart2 size={24} color="#94a3b8" />
              </div>
              <h3 className="oversight-card-title">Active Govt Schemes</h3>
              <div className="oversight-main-stat">{stats.schemes}</div>
              <div className="oversight-sub-stat">
                <Users size={16} color="#10b981" /> Est. {mockSchemesReached}+ Beneficiaries
              </div>
              <div className="oversight-progress-bg">
                <div className="oversight-progress-bar" style={{ width: '70%' }}></div>
              </div>
              <div className="oversight-footer">
                <span>Implementation Rate</span>
                <span style={{ color: '#10b981' }}>Good</span>
              </div>
            </div>

            {/* Oversight Card 3: Complaints */}
            <div className="oversight-card card-orange reveal reveal-up delay-3">
              <div className="oversight-card-header">
                <div className="oversight-icon-box">
                  <AlertTriangle size={28} />
                </div>
                <Activity size={24} color="#94a3b8" />
              </div>
              <h3 className="oversight-card-title">Reported Issues</h3>
              <div className="oversight-main-stat">{stats.complaints}</div>
              <div className="oversight-sub-stat">
                <CheckCircle size={16} color="#f59e0b" /> {mockResolutionRate} Cases Resolved
              </div>
              <div className="oversight-progress-bg">
                <div className="oversight-progress-bar" style={{ width: stats.complaints > 0 ? `${(mockResolutionRate / stats.complaints) * 100}%` : '0%' }}></div>
              </div>
              <div className="oversight-footer">
                <span>Resolution Progress</span>
                <span style={{ color: '#f59e0b' }}>In Progress</span>
              </div>
            </div>
          </div>
        </section>

        {/* Village Initiatives Section (Features) */}
        <section>
          <div className="section-heading-wrapper reveal reveal-up">
            <h2 className="section-heading">
              Village <span className="gradient-text">Initiatives</span>
            </h2>
            <p className="section-description">
              Programs and tools designed to uplift your community and streamline digital governance.
            </p>
          </div>
          <div className="features-grid">
            {initiatives.map((init, i) => (
              <div
                key={i}
                className={`feature-card reveal reveal-left delay-${i + 1}`}
              >
                <div className="feature-icon">
                  <init.icon size={32} color="#22c55e" />
                </div>
                <h3>{init.title}</h3>
                <p>{init.description}</p>
                <ul>
                  {init.details.map((d, idx) => (
                    <li key={idx}>
                      <div className="feature-bullet"></div>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Participation Guide Section (Steps) */}
        <section>
          <div className="section-heading-wrapper reveal reveal-up">
            <h2 className="section-heading">
              Your <span className="gradient-text">Participation Guide</span>
            </h2>
            <p className="section-description">How to make the most of your digital panchayat and contribute effectively.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`step-wrapper reveal reveal-pop delay-${i + 1}`}
              >
                <div className="step-number">{s.step}</div>
                <div className="step-card">
                  <div style={{ marginBottom: "15px" }}>
                    <s.icon size={44} color="#3b82f6" />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Village Tips Grid */}
        <section className="tips-section reveal reveal-up">
          <div className="section-heading-wrapper" style={{ marginBottom: "40px" }}>
             <h2 className="section-heading" style={{ fontSize: '2rem' }}>Smart Village <span className="gradient-text">Tips</span></h2>
             <p className="section-description">Everyday practices to build a better, cleaner community.</p>
          </div>
          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className={`tip-card-modern reveal reveal-up delay-${(index % 3) + 1}`}>
                <div className="tip-icon-modern">💡</div>
                <p className="tip-text-modern">{tip}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Quick Post / Data Upload Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPostModal(false)}>
              <X size={24} />
            </button>
            <h2 className="modal-title">Upload Official Data</h2>
            <p className="modal-subtitle">Share announcements, images, or records to the central dashboard tracking.</p>
            
            {successMessage ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a' }}>
                <CheckCircle size={72} style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{successMessage}</h3>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit}>
                <label className="upload-area">
                  <UploadCloud size={48} style={{ margin: '0 auto 15px', color: '#94a3b8' }} />
                  <p style={{ color: '#475569', fontWeight: 600, fontSize: '1.1rem' }}>Tap or Click to Select Documents / Media</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Supported formats: Images & Videos</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaSelect}
                    style={{ display: "none" }}
                  />
                </label>

                {mediaFiles.length > 0 && (
                  <div className="upload-preview-grid">
                    {mediaFiles.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="upload-preview-item">
                          {file.type.startsWith("image") ? (
                            <img src={url} alt="preview" />
                          ) : (
                            <video src={url} />
                          )}
                          <button
                             type="button"
                             onClick={() => removeMedia(idx)}
                             className="remove-media-btn"
                          >
                            <X size={16} color="#ef4444" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <textarea
                  placeholder="Provide a detailed description or caption for this data..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="post-textarea"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="submit-post-btn"
                >
                  {submitting ? "Processing Upload..." : "Submit to Dashboard"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAnnouncementModal(false)}>
              <X size={24} />
            </button>
            <h2 className="modal-title">Broadcast Announcement</h2>
            <p className="modal-subtitle">Push a live scrolling message to all village residents.</p>
            
            {successMessage && !announcementSubmitting ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a' }}>
                <CheckCircle size={72} style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{successMessage}</h3>
              </div>
            ) : (
              <form onSubmit={handleAnnouncementSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155" }}>Announcement Type</label>
                  <select 
                    value={announcementType} 
                    onChange={(e) => setAnnouncementType(e.target.value)}
                    className="post-textarea"
                    style={{ minHeight: "auto", padding: "12px", borderRadius: "12px" }}
                  >
                    <option value="New">New</option>
                    <option value="Info">Info</option>
                    <option value="Alert">Alert</option>
                  </select>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155" }}>Message</label>
                  <textarea
                    placeholder="Enter the announcement message to broadcast..."
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    className="post-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={announcementSubmitting}
                  className="submit-post-btn"
                >
                  {announcementSubmitting ? "Broadcasting..." : "Broadcast Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
