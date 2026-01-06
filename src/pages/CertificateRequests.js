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
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 style={styles.spin} size={34} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={styles.emptyState}>
        <h2>No Certificate Requests Found</h2>
        <p>Villagers haven’t applied for any certificates yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Certificate Requests</h1>

      {/* Filters + Search */}
      <div style={styles.controls}>
        <div style={styles.filters}>
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

        <input
          type="text"
          placeholder="Search by name or type..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Requests List */}
      <div style={styles.grid}>
        {filteredRequests.length === 0 ? (
          <p style={styles.noMatch}>No requests match your search/filter.</p>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} style={styles.card}>
              <div style={styles.cardMain}>
                <div style={styles.details}>
                  <h2 style={styles.cardTitle}>
                    {req.type === "birth"
                      ? "Birth Certificate"
                      : "Death Certificate"}
                  </h2>
                  <p>
                    <strong>Applicant:</strong> {req.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {req.userEmail || "N/A"}
                  </p>

                  {req.type === "birth" && (
                    <>
                      <p>
                        <strong>Father:</strong> {req.fatherName}
                      </p>
                      <p>
                        <strong>Mother:</strong> {req.motherName}
                      </p>
                      <p>
                        <strong>DOB:</strong> {req.dob}
                      </p>
                    </>
                  )}

                  {req.type === "death" && (
                    <>
                      <p>
                        <strong>DOD:</strong> {req.dod}
                      </p>
                      <p>
                        <strong>Reason:</strong> {req.reason}
                      </p>
                    </>
                  )}

                  <p style={styles.date}>
                    Submitted on{" "}
                    {req.createdAt?.toDate
                      ? req.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div style={styles.actions}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(req.status === "pending"
                        ? styles.pending
                        : req.status === "approved"
                        ? styles.approved
                        : styles.rejected),
                    }}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>

                  {req.status === "pending" && (
                    <div style={styles.buttons}>
                      <button
                        style={{
                          ...styles.actionBtn,
                          ...styles.approveBtn,
                        }}
                        onClick={() => handleStatusUpdate(req.id, "approved")}
                        disabled={updatingId === req.id}
                      >
                        {updatingId === req.id ? (
                          <Loader2 style={styles.iconSpin} size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Approve
                      </button>
                      <button
                        style={{
                          ...styles.actionBtn,
                          ...styles.rejectBtn,
                        }}
                        onClick={() => handleStatusUpdate(req.id, "rejected")}
                        disabled={updatingId === req.id}
                      >
                        {updatingId === req.id ? (
                          <Loader2 style={styles.iconSpin} size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 🎨 Updated Inline Styles */
const styles = {
  page: {
    maxWidth: "950px",
    margin: "10px auto",
    padding: "20px",
    paddingTop: "100px", // 👈 Added spacing for Navbar
    fontFamily: "'Segoe UI', sans-serif",
    color: "#1f2937",
  },
  header: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#1e3a8a",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "25px",
  },
  filters: { display: "flex", gap: "10px", flexWrap: "wrap" },
  filterBtn: {
    padding: "6px 16px",
    border: "none",
    borderRadius: "20px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.3s",
    fontWeight: "500",
  },
  activeFilter: { backgroundColor: "#2563eb", color: "#fff" },
  searchInput: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #d1d5db",
    outline: "none",
    transition: "0.3s",
  },
  grid: { display: "grid", gap: "18px" },
  card: {
    background: "#fff",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardMain: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: "18px",
  },
  cardTitle: { fontSize: "18px", marginBottom: "8px", color: "#111827" },
  details: { flex: 1, minWidth: "250px" },
  date: { fontSize: "12px", color: "#9ca3af", marginTop: "8px" },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    minWidth: "120px",
  },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  pending: { backgroundColor: "#f59e0b" },
  approved: { backgroundColor: "#22c55e" },
  rejected: { backgroundColor: "#ef4444" },
  buttons: { display: "flex", gap: "8px" },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    color: "#fff",
    transition: "all 0.3s",
  },
  approveBtn: { backgroundColor: "#16a34a" },
  rejectBtn: { backgroundColor: "#dc2626" },
  loaderContainer: {
    height: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spin: { animation: "spin 1s linear infinite" },
  iconSpin: { animation: "spin 1s linear infinite" },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: "80px",
  },
  noMatch: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "10px",
  },
};

/* Add keyframes manually */
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
@keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

export default CertificateRequests;
