import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Briefcase,
  ChevronRight,
  Loader2,
  FolderOpen
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
    if (!window.confirm("Permanently delete this scheme and all associated data?")) return;
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
        
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.headerTitle}>Scheme Management</h1>
            <p style={styles.headerSub}>Configure and monitor available government programs</p>
          </div>
          <button style={styles.addBtn} onClick={() => navigate("/operator/schemes/add")}>
            <Plus size={20} /> Add New Scheme
          </button>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <FolderOpen size={20} color="#2563EB" />
            <span style={styles.statText}><strong>{schemes.length}</strong> Total Schemes</span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.statItem}>
            <Briefcase size={20} color="#10B981" />
            <span style={styles.statText}>Active Registry</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loaderContainer}>
            <Loader2 className="animate-spin" size={40} color="#94A3B8" />
            <p style={styles.loaderText}>Fetching Registry...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div style={styles.emptyCard}>
            <FileText size={64} color="#E2E8F0" />
            <h3 style={styles.emptyTitle}>No Schemes Found</h3>
            <p style={styles.emptyDesc}>Your registry is currently empty. Start by adding a new program.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {schemes.map((scheme) => (
              <div key={scheme.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{scheme.title}</h3>
                    <span style={styles.categoryBadge}>{scheme.category || "General"}</span>
                  </div>
                  <p style={styles.cardDesc}>
                    {scheme.description?.substring(0, 110)}...
                  </p>
                </div>

                <div style={styles.cardActions}>
                  <div style={styles.iconGroup}>
                    <button style={styles.editBtn} onClick={() => navigate(`/operator/schemes/edit/${scheme.id}`)} title="Edit Scheme">
                      <Pencil size={18} />
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(scheme.id)} title="Delete Scheme">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <button style={styles.viewAppsBtn} onClick={() => navigate(`/operator/schemes/applications?schemeId=${scheme.id}`)}>
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

const styles = {
  pageWrapper: {
    backgroundColor: "#F8FAFC",
    minHeight: "100vh",
    paddingTop: "120px",
    paddingBottom: "80px",
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
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
  },
  headerTitle: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#0F172A",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerSub: {
    color: "#64748B",
    marginTop: "8px",
    fontSize: "16px",
    margin: 0,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 24px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  statsBar: {
    display: "flex",
    backgroundColor: "#FFFFFF",
    padding: "20px 32px",
    borderRadius: "20px",
    marginBottom: "40px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
    gap: "32px",
    alignItems: "center",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statText: {
    fontSize: "15px",
    color: "#475569",
  },
  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#E2E8F0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "28px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  cardContent: {
    padding: "32px 32px 24px",
    flex: 1,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    gap: "16px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
    lineHeight: "1.3",
  },
  categoryBadge: {
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: "#F8FAFC",
    color: "#475569",
    padding: "6px 12px",
    borderRadius: "20px",
    textTransform: "uppercase",
    border: "1px solid #E2E8F0",
  },
  cardDesc: {
    fontSize: "15px",
    color: "#64748B",
    lineHeight: "1.6",
    margin: 0,
  },
  cardActions: {
    padding: "20px 32px",
    borderTop: "1px solid #F8FAFC",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconGroup: {
    display: "flex",
    gap: "10px",
  },
  editBtn: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    color: "#EF4444",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  viewAppsBtn: {
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 0",
  },
  loaderText: {
    marginTop: "16px",
    color: "#64748B",
    fontSize: "15px",
    fontWeight: "600",
  },
  emptyCard: {
    textAlign: "center",
    padding: "100px 20px",
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    border: "1px dashed #CBD5E1",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "24px 0 8px",
  },
  emptyDesc: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
  }
};

export default ManageSchemes;
