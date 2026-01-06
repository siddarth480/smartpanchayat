import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
// 🔹 Modern Icons
import {
  ArrowLeft,
  Save,
  FileText,
  Gift,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const AddEditScheme = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schemeId) return;

    const fetchScheme = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "schemes", schemeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Scheme not found!");
          navigate("/operator/schemes");
          return;
        }

        const data = docSnap.data();
        setTitle(data.title || "");
        setDescription(data.description || "");
        setBenefits(data.benefits || "");
        setEligibility(data.eligibility || "");
      } catch (err) {
        console.error(err);
        alert("Failed to load scheme");
        navigate("/operator/schemes");
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        benefits,
        eligibility,
        updatedAt: new Date(),
      };

      if (schemeId) {
        await setDoc(doc(db, "schemes", schemeId), payload, { merge: true });
        alert("Scheme updated successfully!");
      } else {
        await addDoc(collection(db, "schemes"), {
          ...payload,
          createdAt: new Date(),
        });
        alert("Scheme added successfully!");
      }
      navigate("/operator/schemes");
    } catch (err) {
      console.error(err);
      alert("Failed to save scheme");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Navigation Header */}
        <div style={styles.navBar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={18} /> Back to List
          </button>
          <div style={styles.statusLabel}>
            {schemeId ? "MODIFICATION MODE" : "CREATION MODE"}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconBox}>
              <FileText color="#2563EB" size={24} />
            </div>
            <h1 style={styles.header}>
              {schemeId ? "Edit Scheme Details" : "Launch New Scheme"}
            </h1>
            <p style={styles.subHeader}>
              Ensure all criteria are clearly defined for citizens.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Core Info Section */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FileText size={14} /> Scheme Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder="e.g. Kanya Sumangala Yojana"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <AlertCircle size={14} /> Brief Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, height: "120px" }}
                placeholder="Explain the purpose of this scheme..."
                required
              />
            </div>

            {/* Split View for Benefits and Eligibility */}
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Gift size={14} /> Key Benefits
                </label>
                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  style={{ ...styles.input, height: "100px" }}
                  placeholder="What do citizens receive?"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <CheckCircle size={14} /> Eligibility Criteria
                </label>
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  style={{ ...styles.input, height: "100px" }}
                  placeholder="Who can apply?"
                />
              </div>
            </div>

            <div style={styles.footer}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={styles.cancelBtn}
              >
                Discard
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <Loader2 className="spin" size={20} />
                ) : (
                  <>
                    <Save size={18} />{" "}
                    {schemeId ? "Update Scheme" : "Create Scheme"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ---------------- Styles ----------------
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    paddingTop: "120px",
    paddingBottom: "60px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 20px",
  },
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748B",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  statusLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: "1px",
    background: "#E2E8F0",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03)",
    border: "1px solid #F1F5F9",
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  iconBox: {
    width: "56px",
    height: "56px",
    background: "#EFF6FF",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  header: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
  },
  subHeader: {
    color: "#64748B",
    fontSize: "15px",
    marginTop: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "700",
    fontSize: "13px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease-in-out",
    backgroundColor: "#FBFDFF",
    ":focus": {
      borderColor: "#2563EB",
      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)",
      backgroundColor: "#fff",
    },
  },
  footer: {
    marginTop: "10px",
    display: "flex",
    gap: "15px",
    paddingTop: "20px",
    borderTop: "1px solid #F1F5F9",
  },
  submitBtn: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#0F172A",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cancelBtn: {
    flex: 1,
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    backgroundColor: "#fff",
    color: "#64748B",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default AddEditScheme;
