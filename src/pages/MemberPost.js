import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const MemberPost = ({ user, onLogout }) => {
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!user || user.role !== "member") {
    return (
      <div style={styles.restricted}>
        ❌ Access denied. Only Panchayat Members can post.
      </div>
    );
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && mediaFiles.length === 0)
      return alert("Add a caption or media.");

    setSubmitting(true);
    try {
      const uploaded = [];
      for (const file of mediaFiles)
        uploaded.push(await uploadToCloudinary(file));

      await addDoc(collection(db, "memberPosts"), {
        caption,
        media: uploaded,
        createdAt: serverTimestamp(),
        email: user.email,
        userId: user.uid,
      });

      setCaption("");
      setMediaFiles([]);
      setSuccessMessage("✅ Post submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit post.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Left Side - Info */}
          <div style={styles.leftSide}>
            <h2 style={styles.infoHeading}>📌 Guidelines for Posting</h2>
            <ul style={styles.infoList}>
              <li>Ensure your post is relevant to the Panchayat.</li>
              <li>Use clear images or short videos.</li>
              <li>Provide a concise caption for clarity.</li>
              <li>Review content before submitting.</li>
            </ul>
            <p style={styles.infoNote}>
              Only members are allowed to create posts. All posts are reviewed
              automatically for quality and content.
            </p>
          </div>

          {/* Right Side - Form */}
          <div style={styles.rightSide}>
            <h2 style={styles.heading}>Create a New Post</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.uploadLabel}>
                📁 Tap or Click to Select Images / Videos
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaSelect}
                  style={{ display: "none" }}
                />
              </label>

              {mediaFiles.length > 0 && (
                <div style={styles.previewGrid}>
                  {mediaFiles.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={idx} style={styles.mediaBox}>
                        {file.type.startsWith("image") ? (
                          <img src={url} alt="preview" style={styles.preview} />
                        ) : (
                          <video src={url} style={styles.preview} controls />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          style={styles.removeButton}
                        >
                          ✖
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <textarea
                placeholder="Write your caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                style={styles.textarea}
              />

              <button
                type="submit"
                disabled={submitting}
                style={styles.submitBtn}
              >
                {submitting ? "Posting..." : "Submit Post"}
              </button>
              {successMessage && <p style={styles.success}>{successMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 60px)",
    marginTop: "60px",
    background: "#f0f4f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 20px",
  },
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    maxWidth: "1100px",
    gap: "40px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    padding: "40px",
    flexWrap: "wrap",
  },
  leftSide: {
    flex: "1",
    minWidth: "300px",
    background: "#eef2ff",
    borderRadius: "16px",
    padding: "25px",
  },
  rightSide: {
    flex: "1.2",
    minWidth: "350px",
    display: "flex",
    flexDirection: "column", 
  },
  infoHeading: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1e3a8a",
  },
  infoList: {
    listStyleType: "disc",
    paddingLeft: "20px",
    marginBottom: "20px",
    color: "#374151",
    lineHeight: "1.6",
  },
  infoNote: {
    fontStyle: "italic",
    color: "#6b7280",
  },
  heading: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#1e3a8a",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  uploadLabel: {
    background: "#eef2ff",
    border: "2px dashed #3b82f6",
    borderRadius: "16px",
    padding: "80px",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: "600",
    color: "#1e3a8a",
    fontSize: "16px",
    transition: "0.3s",
  },
  previewGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
  },
  mediaBox: {
    position: "relative",
    width: "180px",
    height: "180px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removeButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "#fff",
    border: "none",
    borderRadius: "50%",
    padding: "5px 9px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    fontSize: "14px",
  },
  textarea: {
    padding: "15px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    outline: "none",
    resize: "vertical",
    minHeight: "100px",
  },
  submitBtn: {
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.3s",
  },
  success: {
    color: "green",
    textAlign: "center",
    fontWeight: "600",
  },
  restricted: {
    padding: "120px 40px",
    fontSize: "18px",
    textAlign: "center",
    color: "#d32f2f",
  },
};

// ✅ Add Responsive Styles Dynamically
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @media (max-width: 900px) {
      .container {
        flex-direction: column !important;
        padding: 20px !important;
      }
      .leftSide, .rightSide {
        width: 100% !important;
      }
      .uploadLabel {
        padding: 60px !important;
      }
      .mediaBox {
        width: 150px !important;
        height: 150px !important;
      }
    }
    @media (max-width: 600px) {
      .uploadLabel {
        padding: 40px !important;
        font-size: 14px !important;
      }
      .submitBtn {
        font-size: 16px !important;
        padding: 12px !important;
      }
      .mediaBox {
        width: 120px !important;
        height: 120px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default MemberPost;
