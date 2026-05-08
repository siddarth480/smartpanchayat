import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  Activity,
  User,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AcknowledgeComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const [acknowledgements, setAcknowledgements] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("toUserRole", "==", "sarpanch")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // Sort to show newest first
      data.sort((a, b) => b.createdAt - a.createdAt);
      
      setComplaints(data);

      const currentSelected = data.find((c) => c.id === selectedId);
      if (!currentSelected || currentSelected.status !== activeTab) {
        const firstInTab = data.find((c) => c.status === activeTab);
        setSelectedId(firstInTab ? firstInTab.id : null);
      }
    });
    return unsub;
  }, [activeTab, selectedId]);

  const handleResolve = async (id) => {
    const text = acknowledgements[id]?.trim();
    if (!text) return alert("Please enter official resolution notes.");
    try {
      await updateDoc(doc(db, "complaints", id), {
        status: "resolved",
        acknowledgement: text,
        resolvedAt: Timestamp.now(),
        resolvedBy: user.fullName || "Member / Sarpanch",
      });
      alert("Complaint Resolved Successfully ✅");
      setAcknowledgements((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesTab = c.status === activeTab;
    const matchesSearch = c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedComplaint = complaints.find((c) => c.id === selectedId);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div style={styles.appWrapper}>
      <style>{`
        /* Custom Scrollbar for sleek UI */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        
        .list-item { transition: all 0.2s ease; border-left: 4px solid transparent; }
        .list-item:hover { background: #F8FAFC; }
        .active-item { background: #EFF6FF !important; border-left-color: #2563EB !important; }
      `}</style>

      {/* LEFT ICON SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <Layers size={24} />
        </div>
        <div style={styles.navGroup}>
          <button
            onClick={() => { setActiveTab("pending"); setSelectedId(null); setSearchTerm(""); }}
            style={{ ...styles.navIcon, ...(activeTab === "pending" ? styles.navActive : {}) }}
          >
            <Activity size={20} />
            <small>Active</small>
            {stats.pending > 0 && <span style={styles.badgeCount}>{stats.pending}</span>}
          </button>

          <button
            onClick={() => { setActiveTab("resolved"); setSelectedId(null); setSearchTerm(""); }}
            style={{ ...styles.navIcon, ...(activeTab === "resolved" ? styles.navActive : {}) }}
          >
            <CheckCircle2 size={20} />
            <small>History</small>
          </button>
        </div>
      </aside>

      <div style={styles.mainArea}>
        
        {/* TOP METRICS HEADER */}
        <header style={styles.header}>
          <div style={styles.welcome}>
            <h2 style={styles.title}>Member Administration Inbox</h2>
            <p style={styles.subtitle}>Review citizen complaints and operator notes for final resolution.</p>
          </div>

          <div style={styles.metricsRow}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statNum, color: "#F59E0B" }}>{stats.pending}</span>
                <span style={styles.statLabel}>Awaiting Action</span>
              </div>
              <div style={{...styles.statIconBox, backgroundColor: "#FEF3C7", color: "#D97706"}}>
                <AlertCircle size={20} />
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statNum, color: "#10B981" }}>{stats.resolved}</span>
                <span style={styles.statLabel}>Resolved Cases</span>
              </div>
              <div style={{...styles.statIconBox, backgroundColor: "#D1FAE5", color: "#059669"}}>
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* MULTI-COLUMN CONTENT */}
        <div style={styles.contentBody}>
          
          {/* LIST COLUMN (LEFT) */}
          <div style={styles.listColumn}>
            <div style={styles.listHeader}>
              <div style={styles.listHeaderTop}>
                <span style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: '800'}}>
                  <Inbox size={18} color="#2563EB" /> 
                  {activeTab === "pending" ? "ACTIVE TICKETS" : "RESOLVED TICKETS"}
                </span>
                <span style={styles.countBadge}>{filtered.length}</span>
              </div>
              <div style={styles.searchBox}>
                <Search size={14} color="#94A3B8" />
                <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="custom-scroll" style={styles.listScrollArea}>
              {filtered.length === 0 ? (
                <div style={styles.emptyContainer}>
                  <div style={styles.emptyIconCircle}>
                    <Inbox size={32} color="#CBD5E1" />
                  </div>
                  <p style={styles.emptyText}>No {activeTab} tickets</p>
                </div>
              ) : (
                filtered.map((c) => (
                  <div
                    key={c.id}
                    className={`list-item ${selectedId === c.id ? "active-item" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                    style={styles.listItem}
                  >
                    <div style={styles.itemTop}>
                      <span style={styles.itemUser}>{c.userName}</span>
                      <span style={styles.itemDate}>
                        {c.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 style={styles.itemSubject}>{c.category || "General Complaint"}</h4>
                    <p style={styles.itemDesc}>{c.description.substring(0, 50)}...</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DETAIL COLUMN (RIGHT) */}
          <div style={styles.detailColumn}>
            <AnimatePresence mode="wait">
              {selectedComplaint ? (
                <motion.div 
                  key={selectedComplaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={styles.detailCanvas}
                >
                  <div style={styles.detailHeader}>
                    <div style={styles.userBrief}>
                      <div style={styles.avatar}>
                        <User size={24} />
                      </div>
                      <div>
                        <h3 style={styles.userName}>{selectedComplaint.userName || "Citizen"}</h3>
                        <div style={styles.idLabel}>
                          Ticket #{selectedComplaint.id.slice(-6).toUpperCase()} • {selectedComplaint.createdAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: activeTab === "pending" ? "#FEF3C7" : "#D1FAE5",
                      color: activeTab === "pending" ? "#D97706" : "#059669",
                    }}>
                      {activeTab === "pending" ? "Awaiting Action" : "Resolved"}
                    </span>
                  </div>

                  <div className="custom-scroll" style={styles.scrollContent}>
                    
                    {/* Complaint Details Bubble */}
                    <div style={styles.messageBubble}>
                      <div style={styles.bubbleHeader}>
                        <User size={14} /> <strong>Citizen's Report</strong>
                      </div>
                      <p style={styles.mainText}>{selectedComplaint.description}</p>
                      
                      {selectedComplaint.imageUrl && (
                        <div style={styles.imageBox}>
                          <img src={selectedComplaint.imageUrl} style={styles.attachment} alt="Evidence" />
                          <a href={selectedComplaint.imageUrl} target="_blank" rel="noreferrer" style={styles.link}>
                            <ImageIcon size={14} /> View Full Image
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Operator Note Bubble */}
                    {selectedComplaint.operatorSuggestion && (
                      <div style={{...styles.messageBubble, ...styles.operatorBubble}}>
                        <div style={{...styles.bubbleHeader, color: '#0369A1'}}>
                          <MessageSquare size={14} /> <strong>Operator Note</strong>
                        </div>
                        <p style={{...styles.mainText, color: '#0C4A6E', fontStyle: 'italic'}}>
                          "{selectedComplaint.operatorSuggestion}"
                        </p>
                      </div>
                    )}

                    {/* Resolution Section */}
                    <div style={styles.actionArea}>
                      {activeTab === "pending" ? (
                        <div style={styles.formCard}>
                          <label style={styles.secTitle}>Administrative Resolution</label>
                          <textarea
                            style={styles.textarea}
                            placeholder="Type the official resolution or action taken by the Panchayat here..."
                            value={acknowledgements[selectedComplaint.id] || ""}
                            onChange={(e) => setAcknowledgements({
                              ...acknowledgements,
                              [selectedComplaint.id]: e.target.value,
                            })}
                          />
                          <button style={styles.submitBtn} onClick={() => handleResolve(selectedComplaint.id)}>
                            <Send size={16} /> Finalize & Resolve Case
                          </button>
                        </div>
                      ) : (
                        <div style={{...styles.messageBubble, ...styles.resolvedBubble}}>
                          <div style={{...styles.bubbleHeader, color: '#166534'}}>
                            <CheckCircle2 size={14} /> <strong>Official Resolution Log</strong>
                          </div>
                          <p style={{...styles.mainText, color: '#14532D'}}>
                            {selectedComplaint.acknowledgement}
                          </p>
                          <div style={styles.ackMeta}>
                            <Calendar size={12} /> Resolved by {selectedComplaint.resolvedBy} on {selectedComplaint.resolvedAt?.toDate().toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={styles.noSelectContainer}>
                  <div style={styles.illustrationWrap}>
                    <Inbox size={64} color="#E2E8F0" />
                  </div>
                  <h3 style={styles.noSelectTitle}>No Ticket Selected</h3>
                  <p style={styles.noSelectDesc}>
                    Select a ticket from the left sidebar to review details, operator notes, and finalize the resolution.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  appWrapper: {
    display: "flex",
    height: "100vh",
    background: "#F8FAFC",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "80px",
    background: "#0F172A",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "100px 0 30px 0", // Increased top padding to clear the fixed navbar without top margin
    zIndex: 10,
  },
  logo: {
    width: "40px",
    height: "40px",
    background: "#2563EB",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    marginBottom: "40px",
  },
  navGroup: { display: "flex", flexDirection: "column", gap: "24px", width: "100%" },
  navIcon: {
    background: "none",
    border: "none",
    color: "#64748B",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "700",
    position: "relative",
    padding: "10px 0",
    transition: "color 0.2s",
  },
  navActive: { color: "#FFFFFF" },
  badgeCount: {
    position: "absolute",
    top: "0px",
    right: "15px",
    background: "#EF4444",
    color: "#FFFFFF",
    fontSize: "9px",
    padding: "2px 5px",
    borderRadius: "10px",
    fontWeight: "800",
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "90px 40px 30px 40px", // Adjusted for Top Navbar
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  welcome: { flex: 1 },
  title: { margin: 0, fontSize: "28px", fontWeight: "900", color: "#0F172A", letterSpacing: "-0.5px" },
  subtitle: { margin: "6px 0 0 0", fontSize: "15px", color: "#64748B" },

  metricsRow: { display: "flex", gap: "15px" },
  statCard: {
    background: "#FFFFFF",
    padding: "16px 20px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minWidth: "180px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  statInfo: { display: "flex", flexDirection: "column" },
  statNum: { fontSize: "28px", fontWeight: "900", lineHeight: "1" },
  statLabel: { fontSize: "12px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginTop: "6px" },
  statIconBox: {
    width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center"
  },

  contentBody: {
    flex: 1,
    display: "flex",
    gap: "30px",
    overflow: "hidden", // Important: prevents main area from scrolling, forces inner columns to scroll
  },
  
  // LEFT COLUMN (INBOX LIST)
  listColumn: {
    width: "350px",
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
  },
  listHeader: {
    padding: "20px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  listHeaderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "12px",
  },
  countBadge: {
    background: "#E2E8F0",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "800",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFFFFF",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    width: "100%",
    color: "#0F172A",
  },
  listScrollArea: {
    flex: 1,
    overflowY: "auto", // ✅ This is the scrollbar fix
  },
  listItem: {
    padding: "20px",
    borderBottom: "1px solid #F1F5F9",
    cursor: "pointer",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  itemUser: { fontWeight: "800", color: "#0F172A", fontSize: "14px" },
  itemDate: { fontSize: "12px", color: "#94A3B8", fontWeight: "600" },
  itemSubject: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155"
  },
  itemDesc: {
    fontSize: "13px",
    color: "#64748B",
    margin: 0,
    lineHeight: "1.5"
  },

  // RIGHT COLUMN (DETAIL VIEW)
  detailColumn: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column",
    overflow: "hidden", // Keeps canvas bounded
  },
  detailCanvas: {
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
    height: "100%",
  },
  detailHeader: {
    padding: "25px 30px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#F8FAFC",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  },
  userBrief: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: {
    width: "48px",
    height: "48px",
    background: "#E2E8F0",
    color: "#475569",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "900",
    color: "#0F172A",
  },
  idLabel: { fontSize: "12px", color: "#64748B", marginTop: "4px", fontWeight: "500" },
  badge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  scrollContent: {
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflowY: "auto", // ✅ Detail view scrolling
    flex: 1,
  },
  
  // MESSAGES
  messageBubble: {
    padding: "20px",
    background: "#F1F5F9",
    borderRadius: "16px",
    borderBottomLeftRadius: "4px",
    maxWidth: "90%",
  },
  operatorBubble: {
    background: "#F0F9FF",
    border: "1px solid #E0F2FE",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "4px",
    alignSelf: "flex-end",
  },
  resolvedBubble: {
    background: "#ECFDF5",
    border: "1px solid #D1FAE5",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "4px",
    alignSelf: "flex-end",
    maxWidth: "100%",
  },
  bubbleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#475569",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  mainText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#334155",
    margin: 0,
  },
  
  // ATTACHMENT
  imageBox: { marginTop: "16px" },
  attachment: {
    maxWidth: "300px",
    maxHeight: "200px",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid #E2E8F0",
    objectFit: "cover",
  },
  link: {
    fontSize: "13px",
    color: "#2563EB",
    textDecoration: "none",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  // ACTION AREA
  actionArea: {
    marginTop: "auto",
    paddingTop: "24px",
    borderTop: "1px dashed #E2E8F0",
  },
  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  secTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "16px",
    borderRadius: "16px",
    border: "2px solid #E2E8F0",
    outline: "none",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "border 0.2s",
    backgroundColor: "#F8FAFC",
  },
  submitBtn: {
    padding: "16px",
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "background 0.2s",
  },
  ackMeta: {
    fontSize: "12px",
    color: "#166534",
    opacity: 0.8,
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
  },

  // EMPTY STATE
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIconCircle: {
    width: "60px",
    height: "60px",
    backgroundColor: "#F1F5F9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#64748B",
    margin: 0,
  },
  noSelectContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px dashed #CBD5E1",
  },
  illustrationWrap: { marginBottom: "24px", opacity: 0.5 },
  noSelectTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "0 0 8px 0",
  },
  noSelectDesc: {
    fontSize: "15px",
    color: "#64748B",
    textAlign: "center",
    maxWidth: "300px",
    lineHeight: "1.6",
  },
};

export default AcknowledgeComplaints;
