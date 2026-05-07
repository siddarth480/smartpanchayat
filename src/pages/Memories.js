import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UploadCloud, Images, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import "./Memories.css";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const Memories = ({ user }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals and Views State
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Upload State
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMemories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Group memories by title (Event)
  const groupedEvents = useMemo(() => {
    const groups = {};
    memories.forEach(mem => {
      const key = mem.title ? mem.title.trim() : "Untitled Event";
      if (!groups[key]) {
        groups[key] = {
          title: key,
          date: mem.date, // Takes the date of the most recently uploaded photo in the event
          photos: [],
        };
      }
      groups[key].photos.push(mem);
    });
    
    // Sort events by date descending
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [memories]);

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const filesArray = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        filesArray.push(selectedFiles[i]);
      }
      setFiles(filesArray);
    }
  };

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
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select at least one image.");
    
    setUploading(true);
    try {
      // Loop over each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const downloadURL = await uploadToCloudinary(file);

        // Add to firestore
        await addDoc(collection(db, "memories"), {
          imageUrl: downloadURL,
          title: title || "Village Memory",
          date: date || new Date().toISOString().split("T")[0],
          uploadedBy: user.email,
          createdAt: serverTimestamp()
        });
      }

      // Reset
      setFiles([]);
      setTitle("");
      setDate("");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="memories-page">
      <div className="memories-hero">
        <h1 className="memories-title">Village Memories</h1>
        <p className="memories-subtitle">
          A collection of our community's best moments, events, and milestones. Relive the history of our village through these albums.
        </p>
      </div>

      <div className="memories-container">
        {loading ? (
          <div style={{textAlign: "center", padding: "40px"}}>Loading albums...</div>
        ) : groupedEvents.length === 0 ? (
          <div style={{textAlign: "center", padding: "60px", color: "#64748b"}}>
            <Images size={64} style={{opacity: 0.5, marginBottom: "16px"}} />
            <p style={{fontSize: "1.2rem"}}>No event albums have been created yet.</p>
          </div>
        ) : (
          groupedEvents.map((event, idx) => (
            <motion.div 
              key={event.title + idx}
              className="event-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="event-card-info">
                <h2 className="event-card-title">{event.title}</h2>
                <p className="event-card-date">
                  <Calendar size={18} /> {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="event-card-meta">
                  <span className="event-photo-count">
                    <Images size={16} /> {event.photos.length} Photos
                  </span>
                </div>
                <div className="event-view-btn">
                  Open Album <ArrowRight size={20} />
                </div>
              </div>
              
              <div className={`event-card-collage collage-${Math.min(event.photos.length, 3)}-imgs`}>
                <div className="collage-gradient-overlay"></div>
                <div className="collage-wrapper">
                  {event.photos.slice(0, 3).map((photo, i) => (
                    <img 
                      key={photo.id} 
                      src={photo.imageUrl} 
                      className={`collage-img collage-img-${i}`} 
                      alt={`Preview ${i}`} 
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Fullscreen Event Gallery Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            className="event-gallery-modal"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            <div className="event-gallery-header">
              <div>
                <h2>{selectedEvent.title}</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                  {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.photos.length} Photos
                </p>
              </div>
              <button className="gallery-close-btn" onClick={() => setSelectedEvent(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="event-gallery-content">
              <div className="masonry-grid">
                {selectedEvent.photos.map((mem, idx) => (
                  <motion.div 
                    key={mem.id} 
                    className="masonry-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setLightboxData(mem)}
                  >
                    <img src={mem.imageUrl} alt={mem.title} className="masonry-image" loading="lazy" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload FAB (Operators only) */}
      {user && user.role === "operator" && (
        <button className="upload-fab" onClick={() => setModalOpen(true)}>
          <Plus size={30} />
        </button>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            className="upload-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="upload-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>Create Event Album</h2>
                <button className="modal-close" onClick={() => setModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <form className="upload-form" onSubmit={handleUpload}>
                <label className="file-input-wrapper">
                  <UploadCloud size={40} color="#2563eb" style={{marginBottom: "10px"}} />
                  <div><strong>Click to select images</strong> or drag and drop</div>
                  <div style={{fontSize:"0.85rem", color:"#64748b", marginTop:"8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"}}>
                    {files.length > 0 ? (
                      <>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>{files.length} file(s) selected</span>
                        <button 
                          type="button" 
                          className="image-clear-btn"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setFiles([]); 
                            const fileInput = document.getElementById('memory-file-input');
                            if (fileInput) fileInput.value = '';
                          }} 
                          title="Clear selection"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : "Select multiple photos for this event"}
                  </div>
                  <input 
                    id="memory-file-input"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                    style={{display: "none"}} 
                  />
                </label>

                <input 
                  type="text" 
                  placeholder="Event Title (e.g. Navratri 2025)" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="upload-input"
                  required
                />
                
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="upload-input"
                  required
                />

                <button type="submit" className="upload-btn" disabled={uploading || files.length === 0}>
                  {uploading ? "Uploading..." : `Upload ${files.length} Photo(s) to Album`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxData && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxData(null)}
          >
            <motion.div 
              className="lightbox-content"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLightboxData(null)}>
                <X size={32} />
              </button>
              <img src={lightboxData.imageUrl} alt={lightboxData.title} className="lightbox-image" />
              <div className="lightbox-info">
                <h3>{lightboxData.title}</h3>
                <p><Calendar size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}}/> {new Date(lightboxData.date).toLocaleDateString()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memories;
