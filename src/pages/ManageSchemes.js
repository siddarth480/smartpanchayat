import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
// 🔹 Modern Icon Library
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Settings,
  Layout,
  Briefcase,
  ChevronRight,
  Loader2,
} from "lucide-react";

const ManageSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "schemes"));
        setSchemes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const handleDelete = async (schemeId) => {
    if (
      !window.confirm("Permanently delete this scheme and all associated data?")
    )
      return;
    try {
      await deleteDoc(doc(db, "schemes", schemeId));
      setSchemes((prev) => prev.filter((s) => s.id !== schemeId));
    } catch (err) {
      alert("Failed to delete scheme");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.headerTitle}>Scheme Management</h1>
            <p style={styles.headerSub}>
              Configure and monitor available government programs
            </p>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => navigate("/operator/schemes/add")}
          >
            <Plus size={20} /> Add New Scheme
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <Layout size={18} color="#6366F1" />
            <span>
              <strong>{schemes.length}</strong> Total Schemes
            </span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.statItem}>
            <Briefcase size={18} color="#10B981" />
            <span>Active Programs</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loaderContainer}>
            <Loader2 style={styles.spinner} size={40} />
            <p>Fetching Registry...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div style={styles.emptyCard}>
            <FileText size={60} color="#CBD5E1" />
            <h3>No Schemes Found</h3>
            <p>
              Your registry is currently empty. Start by adding a new program.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {schemes.map((scheme) => (
              <div key={scheme.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{scheme.title}</h3>
                    <span style={styles.categoryBadge}>
                      {scheme.category || "General"}
                    </span>
                  </div>
                  <p style={styles.cardDesc}>
                    {scheme.description?.substring(0, 100)}...
                  </p>
                </div>

                <div style={styles.cardActions}>
                  <button
                    style={styles.actionIconBtn}
                    onClick={() =>
                      navigate(`/operator/schemes/edit/${scheme.id}`)
                    }
                    title="Edit Scheme"
                  >
                    <Pencil size={18} color="#4F46E5" />
                  </button>

                  <button
                    style={{
                      ...styles.actionIconBtn,
                      backgroundColor: "#FEF2F2",
                    }}
                    onClick={() => handleDelete(scheme.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </button>

                  <button
                    style={styles.viewAppsBtn}
                    onClick={() =>
                      navigate(
                        `/operator/schemes/applications?schemeId=${scheme.id}`
                      )
                    }
                  >
                    Applications <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- Styles ----------------
const styles = {
  pageWrapper: {
    backgroundColor: "#F8FAFC", // Cleaner slate background
    minHeight: "100vh",
    paddingTop: "120px",
    paddingBottom: "60px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 30px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  headerSub: {
    color: "#64748B",
    marginTop: "4px",
    fontSize: "15px",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#0F172A", // Dark professional navy
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  statsBar: {
    display: "flex",
    backgroundColor: "#fff",
    padding: "16px 24px",
    borderRadius: "16px",
    marginBottom: "40px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    gap: "24px",
    alignItems: "center",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#475569",
  },
  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#E2E8F0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    overflow: "hidden",
    position: "relative",
  },
  cardContent: {
    padding: "24px",
    flex: 1,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1E293B",
    margin: 0,
    lineHeight: "1.3",
  },
  categoryBadge: {
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: "#F1F5F9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#64748B",
    lineHeight: "1.6",
  },
  cardActions: {
    padding: "16px 24px",
    borderTop: "1px solid #F1F5F9",
    backgroundColor: "#FDFDFD",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  actionIconBtn: {
    backgroundColor: "#EEF2FF",
    border: "none",
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "0.2s",
  },
  viewAppsBtn: {
    marginLeft: "auto",
    backgroundColor: "transparent",
    color: "#4F46E5",
    border: "none",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "80px",
    color: "#94A3B8",
  },
  spinner: {
    animation: "spin 1s linear infinite",
    marginBottom: "12px",
  },
  emptyCard: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    border: "2px dashed #E2E8F0",
    marginTop: "20px",
  },
};

// CSS for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default ManageSchemes;
