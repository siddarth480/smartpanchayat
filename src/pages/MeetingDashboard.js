import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  FaMicrophone,
  FaStop,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaBrain,
  FaRegCalendarAlt,
  FaVideo,
  FaCloudUploadAlt,
  FaMagic,
  FaDownload,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { useParams } from "react-router-dom";

// Cloudinary Config
const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const MeetingDashboard = ({ user }) => {
  const { meetingId } = useParams();
  const [meetingData, setMeetingData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const role = user?.role || "villager";

  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const docRef = doc(db, "meetings", meetingId);
    if (role === "operator") {
      getDoc(docRef).then((snap) => {
        if (!snap.exists()) {
          console.log("Document does not exist. Creating...");
          setDoc(docRef, {
            title: `Panchayat Meeting: ${meetingId}`,
            transcript: "",
            liveSummary: "",
            videoUrl: "",
            status: "active",
            createdAt: new Date().toISOString(),
          }).then(() => console.log("Meeting created successfully"))
            .catch(err => {
              console.error("Error creating meeting:", err);
              setErrorMsg("Failed to create meeting data.");
            });
        } else {
          console.log("Document already exists.");
        }
      }).catch(err => {
        console.error("Error fetching meeting:", err);
        setErrorMsg("Failed to connect to database.");
      });
    }
    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setMeetingData(doc.data());
      } else {
        if (role !== "operator") {
          setErrorMsg("Meeting hasn't been started by the operator yet.");
        }
      }
    }, (error) => {
      console.error("Snapshot error:", error);
      setErrorMsg("Error listening to meeting updates.");
    });
    return () => unsub();
  }, [meetingId, role]);

  // --- 🎥 VIDEO DELETE LOGIC ---
  const handleDeleteVideo = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video? This will also reset the summary."
    );
    if (!confirmDelete) return;

    try {
      const docRef = doc(db, "meetings", meetingId);
      await updateDoc(docRef, {
        videoUrl: "",
        liveSummary: "",
        status: "active",
      });
      alert("Video deleted successfully.");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete video.");
    }
  };

  // --- 🎥 VIDEO UPLOAD LOGIC ---
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      const docRef = doc(db, "meetings", meetingId);
      await updateDoc(docRef, { videoUrl: data.secure_url });
      alert("Meeting Video Uploaded Successfully!");
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload video.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- 🤖 AI ANALYSIS LOGIC ---
  const handleAIAnalysis = async () => {
    if (!meetingData.videoUrl) return alert("Please upload a video first.");
    setIsAnalyzing(true);
    
    try {
      const functions = getFunctions();
      const analyzeMeetingVideo = httpsCallable(functions, "analyzeMeetingVideo");
      
      const result = await analyzeMeetingVideo({ videoUrl: meetingData.videoUrl });
      
      if (result.data && result.data.success) {
        const docRef = doc(db, "meetings", meetingId);
        await updateDoc(docRef, {
          liveSummary: result.data.summary,
          status: "completed",
        });
        alert("AI Analysis Complete!");
      } else {
        alert("AI Processing failed to return a summary.");
      }
    } catch (err) {
      console.error("Backend AI Error:", err);
      alert("AI Processing failed on the server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 🎙️ LIVE RECORDING LOGIC ---
  const handleToggleRecording = async () => {
    const functions = getFunctions();
    const processSpeech = httpsCallable(functions, "processSpeech");
    
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(event.data);
            reader.onloadend = async () => {
              const base64data = reader.result.split(",")[1];
              try {
                const result = await processSpeech({ audioBase64: base64data });
                if (result.data && result.data.text) {
                  // Re-fetch current doc to avoid race conditions with local state
                  const docRef = doc(db, "meetings", meetingId);
                  const currentDoc = await getDoc(docRef);
                  const currentTranscript = currentDoc.exists() ? currentDoc.data().transcript || "" : "";
                  
                  await updateDoc(docRef, {
                    transcript: currentTranscript + " " + result.data.text,
                  });
                }
              } catch (err) {
                console.error("Transcription Error:", err);
              }
            };
          }
        };
        // Capture audio in 10-second chunks
        mediaRecorderRef.current.start(10000);
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access is required.");
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      setIsRecording(false);
    }
  };

  if (errorMsg)
    return <div style={{...loaderStyle, color: "red"}}>{errorMsg}</div>;

  if (!meetingData)
    return <div style={loaderStyle}>Synchronizing AI Data...</div>;

  return (
    <div style={containerStyle}>
      <style>
        {`
          @media (max-width: 768px) {
            .header-content { flex-direction: column !important; align-items: flex-start !important; gap: 20px; padding: 20px !important; }
            .action-group { width: 100%; flex-wrap: wrap; justify-content: flex-start !important; }
            .meeting-grid { grid-template-columns: 1fr !important; }
            .info-strip { flex-wrap: wrap; gap: 15px !important; }
            .card-padding { padding: 20px !important; }
          }
        `}
      </style>

      <div style={contentWrapper}>
        <header className="header-content" style={headerStyle}>
          <div style={{ borderLeft: "6px solid #2563eb", paddingLeft: "20px" }}>
            <h1 style={titleStyle}>{meetingData.title}</h1>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={roleBadge}>{role.toUpperCase()}</span>
              <span style={statusText}>
                <span style={isRecording ? livePulseActive : livePulse} />
                {isRecording ? "Listening Live..." : "Archive Mode"}
              </span>
            </div>
          </div>

          <div
            className="action-group"
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            {role === "operator" && (
              <>
                {!meetingData.videoUrl ? (
                  <>
                    <button
                      onClick={handleToggleRecording}
                      style={isRecording ? stopBtn : startBtn}
                    >
                      {isRecording ? <FaStop /> : <FaMicrophone />}{" "}
                      {isRecording ? "Stop" : "Live Stream"}
                    </button>
                    <label style={uploadBtn}>
                      <FaCloudUploadAlt />{" "}
                      {isUploading ? "Uploading..." : "Upload Video"}
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={handleVideoUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAIAnalysis}
                      style={aiBtn}
                      disabled={isAnalyzing}
                    >
                      <FaMagic />{" "}
                      {isAnalyzing ? "AI Analyzing..." : "AI Summarize Video"}
                    </button>
                    <button onClick={handleDeleteVideo} style={deleteBtn}>
                      <FaTrashAlt /> Delete
                    </button>
                  </>
                )}
              </>
            )}

            {/* Show Recording Download only if Video exists AND user is Operator */}
            {meetingData.videoUrl && role === "operator" && (
              <a
                href={meetingData.videoUrl}
                target="_blank"
                rel="noreferrer"
                style={downloadBtn}
              >
                <FaDownload /> Recording
              </a>
            )}
          </div>
        </header>

        <div className="info-strip" style={infoStrip}>
          <div style={infoItem}>
            <FaRegCalendarAlt color="#2563eb" /> <span>{meetingId}</span>
          </div>
          <div style={infoItem}>
            <FaClock color="#2563eb" />{" "}
            <span>
              Created: {new Date(meetingData.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style={infoItem}>
            <FaInfoCircle color="#2563eb" />{" "}
            <span>Status: {meetingData.status}</span>
          </div>
        </div>

        <div className="meeting-grid" style={gridStyle}>
          {/* Section 1: Transcript (Villagers see this, Operators see Video+Transcript) */}
          <section className="card-padding" style={cardStyle}>
            <h3 style={cardHeading}>
              <FaFileAlt />{" "}
              {role === "operator"
                ? "Meeting Recording & Transcript"
                : "Meeting Transcript"}
            </h3>

            {/* VIDEO HIDDEN FOR VILLAGERS */}
            {role === "operator" && meetingData.videoUrl && (
              <div style={videoBox}>
                <video
                  src={meetingData.videoUrl}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>
            )}

            <div
              style={{
                marginTop:
                  role === "operator" && meetingData.videoUrl ? "20px" : "0px",
              }}
            >
              <p style={transcriptBody}>
                {meetingData.transcript || "Discussion has not started yet..."}
              </p>
            </div>
          </section>

          {/* Section 2: AI Summary */}
          <section
            className="card-padding"
            style={{ ...cardStyle, borderTop: "5px solid #2563eb" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={cardHeading}>
                <FaBrain /> AI Intelligent Summary
              </h3>
              <div style={updateIndicator}>Gemini Pro Vision</div>
            </div>
            <div style={summaryBody}>
              {meetingData.liveSummary ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: meetingData.liveSummary.replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                <div style={emptyState}>
                  <FaMagic
                    size={50}
                    style={{ color: "#e2e8f0", marginBottom: "20px" }}
                  />
                  <p>AI Summary will be generated after video processing.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Keep original look, add responsive logic) ---
const containerStyle = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "40px 20px",
};
const contentWrapper = { maxWidth: "1250px", margin: "80px auto" };
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  background: "#ffffff",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
};
const titleStyle = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#0f172a",
  margin: "0 0 8px 0",
};
const roleBadge = {
  background: "#eff6ff",
  color: "#2563eb",
  padding: "5px 12px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "800",
  border: "1px solid #dbeafe",
};
const statusText = {
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const livePulse = {
  width: "10px",
  height: "10px",
  background: "#cbd5e1",
  borderRadius: "50%",
};
const livePulseActive = {
  ...livePulse,
  background: "#ef4444",
  boxShadow: "0 0 10px #ef4444",
};
const startBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const stopBtn = { ...startBtn, background: "#ef4444" };
const uploadBtn = { ...startBtn, background: "#64748b" };
const aiBtn = { ...startBtn, background: "#8b5cf6" };
const deleteBtn = {
  ...startBtn,
  background: "transparent",
  color: "#ef4444",
  border: "1px solid #ef4444",
};
const downloadBtn = {
  ...startBtn,
  background: "#f8fafc",
  color: "#1e293b",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
};
const infoStrip = {
  display: "flex",
  gap: "30px",
  marginBottom: "30px",
  padding: "0 10px",
};
const infoItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  color: "#475569",
  fontWeight: "600",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
  gap: "25px",
};
const cardStyle = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "35px",
  border: "1px solid #e2e8f0",
  minHeight: "500px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
};
const videoBox = {
  background: "#f1f5f9",
  padding: "15px",
  borderRadius: "16px",
};
const cardHeading = {
  fontSize: "17px",
  fontWeight: "800",
  color: "#334155",
  margin: "0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
};
const transcriptBody = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#475569",
  whiteSpace: "pre-wrap",
};
const summaryBody = {
  fontSize: "16px",
  lineHeight: "1.9",
  color: "#1e293b",
  background: "#fdfdfd",
  borderRadius: "12px",
};
const updateIndicator = {
  background: "#f0fdf4",
  color: "#166534",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "800",
};
const emptyState = {
  textAlign: "center",
  padding: "120px 0",
  color: "#94a3b8",
};
const loaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  color: "#64748b",
  fontSize: "18px",
  fontWeight: "600",
};

export default MeetingDashboard;
