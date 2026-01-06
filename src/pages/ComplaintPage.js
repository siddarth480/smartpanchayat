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

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const ComplaintPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState("raise");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    });
    return unsubscribe;
  }, [user.uid]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

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

      setMessage("✅ Complaint submitted successfully.");
      setDescription("");
      setImage(null);
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setMessage("❌ Failed to submit complaint.");
    } finally {
      setUploading(false);
    }
  };

  const pending = complaints.filter((c) => c.status === "pending");
  const resolved = complaints.filter((c) => c.status === "resolved");

  return (
    <div style={styles.page}>
      {/* 🌄 Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>Village Complaint Portal</h1>
          <p style={styles.heroDesc}>
            Your voice matters! Report local issues directly to the Gram
            Panchayat for quick action.
          </p>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/10347/10347162.png"
          alt="village help"
          style={styles.heroImage}
        />
      </section>

      {/* 🌿 Info Section */}
      <section style={styles.info}>
        <h2 style={styles.sectionTitle}>Why Use This Portal?</h2>
        <p style={styles.infoText}>
          Many issues in villages go unnoticed due to lack of communication.
          This system bridges the gap between villagers and local authorities.
          Whether it's a broken light or a sanitation concern — you can raise it
          in minutes and track its progress.
        </p>
      </section>

      {/* ⚙️ Steps Section */}
      <section style={styles.stepsSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            {
              title: "Step 1",
              text: "Describe the issue and add a photo.",
              icon: "📝",
            },
            {
              title: "Step 2",
              text: "Your complaint is sent to the village officials.",
              icon: "📤",
            },
            {
              title: "Step 3",
              text: "Track your complaint’s status anytime.",
              icon: "📊",
            },
            {
              title: "Step 4",
              text: "Get notified once the issue is resolved.",
              icon: "✅",
            },
          ].map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepIcon}>{s.icon}</div>
              <h3 style={styles.stepHeading}>{s.title}</h3>
              <p style={styles.stepText}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🧾 Complaint Tabs */}
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
              ? "📝 Raise Complaint"
              : tab === "pending"
              ? "⏳ Pending"
              : "✅ Resolved"}
          </button>
        ))}
      </div>

      <div style={styles.contentBox}>
        {/* Raise Tab */}
        {activeTab === "raise" && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue clearly (e.g., road damage near market)"
              required
              style={styles.textarea}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={styles.fileInput}
            />
            {image && (
              <div style={styles.previewBox}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  style={styles.preview}
                />
              </div>
            )}
            <button type="submit" disabled={uploading} style={styles.button}>
              {uploading ? "Submitting..." : "Submit Complaint"}
            </button>
            {message && <p style={styles.message}>{message}</p>}
          </form>
        )}

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <div>
            {pending.length === 0 ? (
              <p>No pending complaints.</p>
            ) : (
              pending.map((c) => (
                <div key={c.id} style={styles.card}>
                  <p>
                    <strong>Description:</strong> {c.description}
                  </p>
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt="complaint"
                      style={styles.imageThumb}
                    />
                  )}
                  <p>
                    <strong>Status:</strong> {c.status}
                  </p>
                  {c.operatorSuggestion && (
                    <p style={styles.suggestion}>
                      <strong>Operator Suggestion:</strong>{" "}
                      {c.operatorSuggestion}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Resolved Tab */}
        {activeTab === "resolved" && (
          <div>
            {resolved.length === 0 ? (
              <p>No resolved complaints.</p>
            ) : (
              resolved.map((c) => (
                <div key={c.id} style={styles.card}>
                  <p>
                    <strong>Description:</strong> {c.description}
                  </p>
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt="complaint"
                      style={styles.imageThumb}
                    />
                  )}
                  <p>
                    <strong>Status:</strong> {c.status}
                  </p>
                  {c.operatorSuggestion && (
                    <p style={styles.suggestion}>
                      <strong>Operator Suggestion:</strong>{" "}
                      {c.operatorSuggestion}
                    </p>
                  )}
                  {c.acknowledgement && (
                    <p style={{ marginTop: "8px" }}>
                      <strong>Acknowledgement:</strong> {c.acknowledgement}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 💡 Tips Section */}
      <section style={styles.tips}>
        <h2 style={styles.sectionTitle}>Tips for Effective Complaints</h2>
        <ul style={styles.tipList}>
          <li>✅ Be clear and mention the location.</li>
          <li>📸 Add a photo if possible.</li>
          <li>💬 Use polite, respectful language.</li>
          <li>🔔 Check “Pending” or “Resolved” tabs for updates.</li>
        </ul>
      </section>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "Segoe UI, sans-serif",
    padding: "120px 5% 100px 5%", // 100px bottom for mobile
    backgroundColor: "#f7f9fb",
    minHeight: "100vh",
  },

  hero: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "40px",
  },
  heroText: { maxWidth: "600px", flex: 1 },
  heroTitle: {
    fontSize: "clamp(24px, 5vw, 36px)",
    color: "#1e40af",
    fontWeight: "700",
    marginBottom: "10px",
  },
  heroDesc: { fontSize: "16px", color: "#334155" },
  heroImage: { width: "160px", height: "auto", marginTop: "20px" },
  info: { textAlign: "center", maxWidth: "800px", margin: "0 auto 40px auto" },
  infoText: { color: "#475569", fontSize: "16px" },
  sectionTitle: {
    textAlign: "center",
    color: "#1e3a8a",
    fontWeight: "700",
    marginBottom: "15px",
  },
  stepsSection: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    marginBottom: "40px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  stepCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    transition: "transform 0.3s",
  },
  stepIcon: { fontSize: "36px" },
  stepHeading: { marginTop: "10px", fontWeight: "600" },
  stepText: { fontSize: "14px", color: "#555" },
  tabWrapper: {
    display: "flex",
    justifyContent: "center",
    borderRadius: "10px",
    overflow: "hidden",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#fff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  },
  tab: {
    flex: 1,
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s",
  },
  activeTab: { backgroundColor: "#2563eb", color: "#fff" },
  contentBox: {
    maxWidth: "800px",
    margin: "30px auto",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  textarea: {
    resize: "vertical",
    minHeight: "100px",
    padding: "12px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  fileInput: { fontSize: "15px" },
  previewBox: { width: "100%", maxWidth: "220px" },
  preview: { width: "100%", borderRadius: "8px" },
  button: {
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  message: { color: "#333" },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "16px",
    marginBottom: "16px",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  imageThumb: {
    width: "100%",
    maxWidth: "160px",
    borderRadius: "8px",
    marginTop: "8px",
  },
  tips: {
    backgroundColor: "#e0f2fe",
    borderRadius: "12px",
    padding: "25px",
    marginTop: "40px",
    maxWidth: "800px",
    marginInline: "auto",
  },
  tipList: { listStyle: "none", padding: 0, lineHeight: "1.8em" },
  suggestion: { color: "#0369a1", fontWeight: "500", marginTop: "8px" },
};

export default ComplaintPage;
