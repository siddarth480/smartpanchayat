import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  FiSend,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiInfo,
  FiTrendingUp,
  FiMapPin,
} from "react-icons/fi";
import { MdOutlineErrorOutline } from "react-icons/md";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const ComplaintPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState("raise");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(
        data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      );
    });
    return unsubscribe;
  }, [user.uid]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      let imageUrl = "";
      if (image) imageUrl = await uploadToCloudinary(image);

      await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        userName: user.fullName,
        description,
        imageUrl,
        createdAt: Timestamp.now(),
        status: "pending",
        resolvedBy: null,
        resolvedAt: null,
        acknowledgement: "",
        toUserRole: "sarpanch",
        operatorSuggestion: "",
      });

      setMessage({
        type: "success",
        text: "Complaint submitted successfully.",
      });
      setDescription("");
      setImage(null);
      setTimeout(() => setActiveTab("pending"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit complaint." });
    } finally {
      setUploading(false);
    }
  };

  const pending = complaints.filter((c) => c.status === "pending");
  const resolved = complaints.filter((c) => c.status === "resolved");

  return (
    <div style={styles.page}>
      {/* 🚀 Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Government Citizen Portal</div>
          <h1 style={styles.heroTitle}>
            Your Voice, <br />
            <span style={styles.accentText}>Our Action.</span>
          </h1>
          <p style={styles.heroDesc}>
            Empowering villagers to report local infrastructure, sanitation, or
            utility issues directly to the Gram Panchayat.
          </p>
        </div>
        <div style={styles.heroGraphic}>
          <div style={styles.statsCard}>
            <FiTrendingUp style={{ color: "#10b981" }} />
            <span>Active Tracking Enabled</span>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/10347/10347162.png"
            alt="Portal"
            style={styles.heroImage}
          />
        </div>
      </section>

      {/* 📊 Progress Section */}
      <div style={styles.stepsGrid}>
        {[
          { icon: <FiFileText />, title: "File", desc: "Report the issue" },
          { icon: <FiClock />, title: "Review", desc: "Official verification" },
          { icon: <FiMapPin />, title: "Action", desc: "On-ground resolution" },
          {
            icon: <FiCheckCircle />,
            title: "Closed",
            desc: "Final verification",
          },
        ].map((step, idx) => (
          <div key={idx} style={styles.stepItem}>
            <div style={styles.stepIconWrapper}>{step.icon}</div>
            <div>
              <h4 style={styles.stepTitle}>{step.title}</h4>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🧾 Interaction Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabWrapper}>
          {["raise", "pending", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {}),
              }}
            >
              {tab === "raise"
                ? "Raise Issue"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== "raise" && (
                <span style={styles.countBadge}>
                  {tab === "pending" ? pending.length : resolved.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.contentSection}>
        {activeTab === "raise" && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the issue (e.g. Broken water pipe near Primary School...)"
                required
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Attach Proof (Image)</label>
              <div style={styles.uploadBox}>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={styles.fileInput}
                />
                <label htmlFor="file-upload" style={styles.fileLabel}>
                  <FiImage size={20} /> {image ? image.name : "Select Image"}
                </label>
              </div>
            </div>

            {image && (
              <div style={styles.previewBox}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  style={styles.preview}
                />
              </div>
            )}

            {message && (
              <div
                style={
                  message.type === "success"
                    ? styles.successMsg
                    : styles.errorMsg
                }
              >
                {message.type === "success" ? (
                  <FiCheckCircle />
                ) : (
                  <MdOutlineErrorOutline />
                )}
                {message.text}
              </div>
            )}

            <button type="submit" disabled={uploading} style={styles.submitBtn}>
              {uploading ? "Processing..." : "Submit Report"}
              {!uploading && <FiSend />}
            </button>
          </form>
        )}

        {/* Complaint List (Pending/Resolved) */}
        {activeTab !== "raise" && (
          <div style={styles.listGrid}>
            {(activeTab === "pending" ? pending : resolved).length === 0 ? (
              <div style={styles.emptyState}>
                <FiInfo size={40} />
                <p>No {activeTab} complaints found.</p>
              </div>
            ) : (
              (activeTab === "pending" ? pending : resolved).map((c) => (
                <div key={c.id} style={styles.complaintCard}>
                  <div style={styles.cardHeader}>
                    <span
                      style={
                        c.status === "pending"
                          ? styles.statusPending
                          : styles.statusResolved
                      }
                    >
                      {c.status}
                    </span>
                    <span style={styles.dateText}>
                      {c.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p style={styles.cardDesc}>{c.description}</p>
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt="Proof"
                      style={styles.cardImage}
                    />
                  )}

                  {c.operatorSuggestion && (
                    <div style={styles.suggestionBox}>
                      <strong>
                        <FiInfo /> Operator Note:
                      </strong>
                      <p>{c.operatorSuggestion}</p>
                    </div>
                  )}
                  {c.acknowledgement && (
                    <div style={styles.ackBox}>
                      <strong>
                        <FiCheckCircle /> Acknowledgement:
                      </strong>
                      <p>{c.acknowledgement}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    padding: "100px 5% 60px 5%",
    backgroundColor: "#fcfdfe",
    minHeight: "100vh",
    color: "#1e293b",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "20px",
  },
  heroContent: { flex: 2, minWidth: "300px" },
  badge: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "16px",
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    lineHeight: "1.2",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "20px",
  },
  accentText: {
    color: "#2563eb",
    position: "relative",
  },
  heroDesc: {
    fontSize: "18px",
    color: "#64748b",
    lineHeight: "1.6",
    maxWidth: "500px",
  },
  heroGraphic: {
    flex: 1,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    minWidth: "250px",
  },
  heroImage: { width: "200px", height: "auto", zIndex: 1 },
  statsCard: {
    position: "absolute",
    bottom: "10px",
    right: "0",
    backgroundColor: "#fff",
    padding: "12px 20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: 2,
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
  },
  stepIconWrapper: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontSize: "20px",
  },
  stepTitle: { fontSize: "15px", fontWeight: "700", margin: 0 },
  stepDesc: { fontSize: "13px", color: "#64748b", margin: 0 },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  tabWrapper: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    padding: "6px",
    borderRadius: "14px",
    gap: "5px",
  },
  tab: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#fff",
    color: "#2563eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  countBadge: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: "100px",
    fontSize: "11px",
  },
  contentSection: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  form: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#475569" },
  textarea: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    minHeight: "120px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
  },
  uploadBox: {
    border: "2px dashed #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
  },
  fileInput: { display: "none" },
  fileLabel: {
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#2563eb",
    fontWeight: "600",
  },
  previewBox: { marginTop: "10px", borderRadius: "12px", overflow: "hidden" },
  preview: { width: "100px", height: "100px", objectFit: "cover" },
  submitBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    transition: "transform 0.2s",
  },
  successMsg: {
    backgroundColor: "#f0fdf4",
    color: "#166534",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorMsg: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  listGrid: { display: "flex", flexDirection: "column", gap: "20px" },
  complaintCard: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },
  statusPending: {
    color: "#d97706",
    backgroundColor: "#fffbeb",
    padding: "4px 12px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusResolved: {
    color: "#059669",
    backgroundColor: "#ecfdf5",
    padding: "4px 12px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dateText: { fontSize: "13px", color: "#94a3b8" },
  cardDesc: { fontSize: "16px", lineHeight: "1.5", marginBottom: "15px" },
  cardImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "12px",
  },
  suggestionBox: {
    backgroundColor: "#f0f9ff",
    padding: "15px",
    borderRadius: "12px",
    marginTop: "15px",
    color: "#0c4a6e",
    fontSize: "14px",
  },
  ackBox: {
    backgroundColor: "#f0fdf4",
    padding: "15px",
    borderRadius: "12px",
    marginTop: "15px",
    color: "#14532d",
    fontSize: "14px",
  },
  emptyState: { textAlign: "center", padding: "60px", color: "#94a3b8" },
};

export default ComplaintPage;
