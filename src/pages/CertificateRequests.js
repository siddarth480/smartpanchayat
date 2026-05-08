import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserPlus,
  UserMinus
} from "lucide-react";

const CertificateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "certificateApplications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "certificateApplications", id), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus =
      filterStatus === "All"
        ? true
        : req.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      req.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} color="#0F172A" />
        <p style={styles.loaderText}>Syncing Certificate Registry...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* HEADER & LIVE INDICATOR */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.mainTitle}>Certificate Processing</h1>
            <p style={styles.subTitle}>Manage and verify citizen birth and death records.</p>
          </div>
          <div style={styles.liveIndicator}>
            <Activity size={14} color="#10B981" />
            <span style={styles.liveText}>LIVE MONITORING</span>
          </div>
        </div>

        {/* ANALYTICS DASHBOARD */}
        <div style={styles.analyticsBar}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>PENDING VERIFICATION</span>
            <span style={{ ...styles.statValue, color: "#F59E0B" }}>{stats.pending}</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>CERTIFICATES ISSUED</span>
            <span style={{ ...styles.statValue, color: "#10B981" }}>{stats.approved}</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>REJECTED</span>
            <span style={{ ...styles.statValue, color: "#EF4444" }}>{stats.rejected}</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>TOTAL REQUESTS</span>
            <span style={{ ...styles.statValue, color: "#64748B" }}>{stats.total}</span>
          </div>
        </div>

        {/* CONTROLS (SEARCH & FILTER) */}
        <div style={styles.controlsSection}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search by applicant name or type..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                style={{
                  ...styles.filterBtn,
                  ...(filterStatus === status ? styles.activeFilter : {}),
                }}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* DATA TABLE */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div style={{ flex: 1.5 }}>APPLICANT</div>
            <div style={{ flex: 1.5 }}>CERTIFICATE DETAILS</div>
            <div style={{ flex: 1 }}>DATE FILED</div>
            <div style={{ flex: 1 }}>STATUS</div>
            <div style={{ flex: 1, textAlign: "right" }}>ACTIONS</div>
          </div>

          <div style={styles.tableBody}>
            {filteredRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <FileText size={48} color="#CBD5E1" />
                <h3 style={styles.emptyTitle}>No matching records</h3>
                <p style={styles.emptyDesc}>Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} style={styles.tableRow}>
                  
                  {/* Column 1: Applicant Identity */}
                  <div style={styles.cellApplicant}>
                    <div style={{...styles.avatar, backgroundColor: req.type === 'birth' ? '#EFF6FF' : '#F8FAFC', color: req.type === 'birth' ? '#3B82F6' : '#64748B'}}>
                      {req.type === 'birth' ? <UserPlus size={20} /> : <UserMinus size={20} />}
                    </div>
                    <div>
                      <div style={styles.primaryText}>{req.fullName}</div>
                      <div style={styles.secondaryText}>{req.userEmail || "No Email"}</div>
                    </div>
                  </div>

                  {/* Column 2: Certificate Specifics */}
                  <div style={styles.cellDetails}>
                    <div style={styles.certTypeBadge}>
                      {req.type === "birth" ? "Birth Certificate" : "Death Certificate"}
                    </div>
                    {req.type === "birth" ? (
                      <div style={styles.metaData}>
                        <span>DOB: <strong>{req.dob}</strong></span>
                        <span>Parents: {req.fatherName?.split(' ')[0]} & {req.motherName?.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <div style={styles.metaData}>
                        <span>DOD: <strong>{req.dod}</strong></span>
                        <span>Reason: {req.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Date */}
                  <div style={styles.cellDate}>
                    <Calendar size={14} color="#94A3B8" />
                    <span style={styles.dateText}>
                      {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                    </span>
                  </div>

                  {/* Column 4: Status */}
                  <div style={styles.cellStatus}>
                    <span style={{...styles.statusBadge, ...getBadgeColors(req.status)}}>
                      {req.status === "pending" && <Clock size={12} />}
                      {req.status === "approved" && <CheckCircle2 size={12} />}
                      {req.status === "rejected" && <AlertCircle size={12} />}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  {/* Column 5: Actions */}
                  <div style={styles.cellActions}>
                    {req.status === "pending" ? (
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.approveBtn}
                          onClick={() => handleStatusUpdate(req.id, "approved")}
                          disabled={updatingId === req.id}
                          title="Issue Certificate"
                        >
                          {updatingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          style={styles.rejectBtn}
                          onClick={() => {
                            if (window.confirm("Are you sure you want to reject this request?")) {
                              handleStatusUpdate(req.id, "rejected");
                            }
                          }}
                          disabled={updatingId === req.id}
                          title="Reject Request"
                        >
                          {updatingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                        </button>
                      </div>
                    ) : (
                      <span style={styles.completedText}>Processed</span>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// HELPER: Get dynamic badge colors
const getBadgeColors = (s) => {
  if (s === "approved") return { backgroundColor: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" };
  if (s === "rejected") return { backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" };
  return { backgroundColor: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }; // pending
};

const styles = {
  pageWrapper: {
    background: "#F8FAFC",
    minHeight: "100vh",
    paddingTop: "120px",
    paddingBottom: "100px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subTitle: {
    color: "#64748B",
    fontSize: "16px",
    margin: 0,
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "30px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  liveText: {
    fontSize: "11px",
    color: "#10B981",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  analyticsBar: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    backgroundColor: "#FFFFFF",
    padding: "24px 32px",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    marginBottom: "40px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
    flexWrap: "wrap",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "900",
    lineHeight: "1",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    background: "#E2E8F0",
  },
  controlsSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "12px 16px",
    flex: "1",
    maxWidth: "400px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#0F172A",
    width: "100%",
    backgroundColor: "transparent",
  },
  filterGroup: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#FFFFFF",
    padding: "6px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
  },
  filterBtn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#64748B",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.2s",
  },
  activeFilter: {
    backgroundColor: "#F1F5F9",
    color: "#0F172A",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
  },
  tableHeader: {
    display: "flex",
    padding: "20px 32px",
    backgroundColor: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
    fontSize: "12px",
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: "1px",
  },
  tableBody: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "1px solid #F1F5F9",
    transition: "background 0.2s",
  },
  cellApplicant: {
    flex: 1.5,
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: "15px",
    marginBottom: "4px",
  },
  secondaryText: {
    fontSize: "13px",
    color: "#64748B",
    fontWeight: "500",
  },
  cellDetails: {
    flex: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingRight: "20px",
  },
  certTypeBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
    backgroundColor: "#F1F5F9",
    padding: "4px 10px",
    borderRadius: "8px",
    width: "fit-content",
  },
  metaData: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "13px",
    color: "#64748B",
  },
  cellDate: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dateText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  cellStatus: {
    flex: 1,
    display: "flex",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  cellActions: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  actionGroup: {
    display: "flex",
    gap: "8px",
  },
  approveBtn: {
    backgroundColor: "#ECFDF5",
    color: "#10B981",
    border: "1px solid #A7F3D0",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  rejectBtn: {
    backgroundColor: "#FEF2F2",
    color: "#EF4444",
    border: "1px solid #FECACA",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  completedText: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#94A3B8",
  },
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#F8FAFC",
  },
  loaderText: {
    marginTop: "16px",
    color: "#64748B",
    fontSize: "15px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "16px 0 8px 0",
  },
  emptyDesc: {
    fontSize: "15px",
    color: "#64748B",
    margin: 0,
  },
};

export default CertificateRequests;
