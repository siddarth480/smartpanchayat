import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import { 
  FileText, Info, HelpCircle, CheckCircle, Clock, 
  Download, FileCheck, FileSignature, UploadCloud, ChevronRight,
  ShieldAlert, Activity, User, Users, Calendar, AlertTriangle
} from "lucide-react";
import "./Certificates.css";

const Certificates = () => {
  const [formData, setFormData] = useState({
    type: "birth",
    fullName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dod: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "certificateApplications"),
          where("userId", "==", user.uid)
        );

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedData = data.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(0);
            const timeB = b.createdAt?.toDate?.() || new Date(0);
            return timeB - timeA;
          });

          setRequests(sortedData);
        });

        return () => unsubscribeFirestore();
      } else {
        setRequests([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "certificateApplications"), {
        ...formData,
        status: "pending",
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      alert("✅ Application submitted successfully!");
      setFormData({
        type: "birth",
        fullName: "",
        fatherName: "",
        motherName: "",
        dob: "",
        dod: "",
        reason: "",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (req) => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    doc.addImage("/gov-logo.png", "PNG", 90, 12, 30, 30);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Greater Maharashtra Municipal Corporation", 105, 50, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.text(
      req.type === "birth" ? "BIRTH CERTIFICATE" : "DEATH CERTIFICATE",
      105,
      60,
      { align: "center" }
    );

    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text(
      "(Issued Under Section 12/17 of the Registration of Births & Deaths Act)",
      105,
      68,
      { align: "center" }
    );

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(
      `This is to certify that the following information has been taken from the original record of ${
        req.type === "birth" ? "birth" : "death"
      }:`,
      20,
      85
    );

    let y = 100;
    const lineHeight = 8;
    const addField = (label, value) => {
      doc.setFont("times", "bold");
      doc.text(`${label}`, 20, y);
      doc.setFont("times", "normal");
      doc.text(`: ${value || "N/A"}`, 70, y);
      y += lineHeight;
    };

    if (req.type === "birth") {
      addField("Name of Child", req.fullName);
      addField("Father's Name", req.fatherName);
      addField("Mother's Name", req.motherName);
      addField("Date of Birth", req.dob);
      addField("Place of Birth", req.place || "-");
      addField("Sex", req.gender || "-");
      addField("Registration No", req.registrationNo || "N/A");
      addField(
        "Date of Registration",
        req.registrationDate || new Date().toLocaleDateString()
      );
      addField("Address", req.address || "-");
    }

    if (req.type === "death") {
      addField("Name", req.fullName);
      addField("Sex", req.gender || "-");
      addField("Date of Death", req.dod);
      addField("Place of Death", req.place || "-");
      addField("Father/Husband", req.fatherName);
      addField("Mother", req.motherName);
      addField("Reason of Death", req.reason || "-");
      addField("Registration No", req.registrationNo || "N/A");
      addField(
        "Date of Registration",
        req.registrationDate || new Date().toLocaleDateString()
      );
      addField("Address", req.address || "-");
    }

    y += 20;
    doc.setFont("times", "bold");
    doc.text("Certified By:", 150, y);
    y += 8;
    doc.setFont("times", "normal");
    doc.text("Registrar of Births & Deaths", 150, y);
    y += 8;
    doc.text("Circle Officer", 150, y);

    const sigX = 20;
    const sigY = 240;
    const sigWidth = 80;
    const sigHeight = 35;

    doc.setDrawColor(0);
    doc.rect(sigX, sigY, sigWidth, sigHeight);

    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Signature valid", sigX + 5, sigY + 8);

    const tickSize = 20;
    const tickX = sigX + sigWidth / 2 - tickSize / 2;
    const tickY = sigY + sigHeight / 2 - tickSize / 2;
    doc.addImage("/green-tick.png", "PNG", tickX, tickY, tickSize, tickSize);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("times", "normal");

    doc.text("Digitally signed by Registrar", sigX + 5, sigY + 18);
    doc.text("Municipal Corporation", sigX + 5, sigY + 24);
    doc.text(`Date: ${new Date().toLocaleString()}`, sigX + 5, sigY + 30);

    doc.save(`${req.type}_certificate_${req.fullName}.pdf`);
  };

  return (
    <div className="cert-page-container">
      <div className="cert-content-wrapper">
        {/* Hero Section */}
        <motion.div 
          className="cert-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cert-hero-icon">
            <FileSignature size={64} strokeWidth={1.5} />
          </div>
          <h1 className="cert-hero-title">Digital Certificates Portal</h1>
          <p className="cert-hero-subtitle">
            A fast, secure, and fully digital way to request essential legal documents 
            (Birth & Death Certificates) directly from your Gram Panchayat.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="cert-section-title"><Activity size={24} color="#2563eb" /> Why Apply Online?</h2>
          <div className="cert-benefits-grid">
            <div className="cert-benefit-card">
              <img src="/home_cer.png" alt="Home" className="cert-benefit-icon" />
              <p className="cert-benefit-text">Apply from home without visiting any government office</p>
            </div>
            <div className="cert-benefit-card">
              <img src="/clock.png" alt="Clock" className="cert-benefit-icon" />
              <p className="cert-benefit-text">Save valuable time with faster and automated processing</p>
            </div>
            <div className="cert-benefit-card">
              <img src="/tracking.png" alt="Tracking" className="cert-benefit-icon" />
              <p className="cert-benefit-text">Easy, transparent, and real-time status tracking</p>
            </div>
          </div>
        </motion.div>

        {/* Process Section */}
        <motion.div 
          className="cert-process"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="cert-section-title"><FileCheck size={24} color="#2563eb" /> How It Works</h2>
          <div className="cert-process-steps">
            <div className="cert-step-card">
              <img src="/fill-form.png" alt="Form" className="cert-step-img" />
              <p className="cert-step-text">Fill out the application online</p>
            </div>
            <div className="cert-step-card">
              <img src="/review.png" alt="Review" className="cert-step-img" />
              <p className="cert-step-text">Panchayat operator reviews it</p>
            </div>
            <div className="cert-step-card">
              <img src="/approved.png" alt="Approve" className="cert-step-img" />
              <p className="cert-step-text">Certificate is digitally signed</p>
            </div>
            <div className="cert-step-card">
              <img src="/download.png" alt="Download" className="cert-step-img" />
              <p className="cert-step-text">Download your official PDF</p>
            </div>
          </div>
        </motion.div>

        {/* Split Info & Form */}
        <div className="cert-split-layout">
          <motion.div 
            className="cert-info-box"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="cert-section-title"><Info size={28} /> Importance of Certificates</h2>
            <p className="cert-info-text">
              Birth and Death certificates are fundamental legal documents essential for education admissions, job applications, insurance claims, property transfers, and accessing various government schemes.
            </p>
            <p className="cert-info-text">
              Our digital system ensures that your records are safely maintained and easily accessible. Once your application is reviewed and approved by the Panchayat operator, an authenticated, digitally-signed PDF certificate is generated instantly for you to download.
            </p>
          </motion.div>

          <motion.form 
            className="cert-form" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="cert-section-title"><FileText size={24} color="#2563eb" /> Application Form</h2>
            
            <div className="cert-form-group">
              <label className="cert-label">Certificate Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="cert-input"
              >
                <option value="birth">Birth Certificate</option>
                <option value="death">Death Certificate</option>
              </select>
            </div>

            <div className="cert-form-group">
              <label className="cert-label"><User size={16} style={{display:'inline', verticalAlign:'middle'}}/> Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="cert-input"
                placeholder="Enter full name"
                required
              />
            </div>

            {formData.type === "birth" && (
              <>
                <div className="cert-form-group">
                  <label className="cert-label"><Users size={16} style={{display:'inline', verticalAlign:'middle'}}/> Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="cert-input"
                    placeholder="Enter father's name"
                    required
                  />
                </div>
                <div className="cert-form-group">
                  <label className="cert-label"><Users size={16} style={{display:'inline', verticalAlign:'middle'}}/> Mother's Name</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="cert-input"
                    placeholder="Enter mother's name"
                    required
                  />
                </div>
                <div className="cert-form-group">
                  <label className="cert-label"><Calendar size={16} style={{display:'inline', verticalAlign:'middle'}}/> Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="cert-input"
                    required
                  />
                </div>
              </>
            )}

            {formData.type === "death" && (
              <>
                <div className="cert-form-group">
                  <label className="cert-label"><Calendar size={16} style={{display:'inline', verticalAlign:'middle'}}/> Date of Death</label>
                  <input
                    type="date"
                    name="dod"
                    value={formData.dod}
                    onChange={handleChange}
                    className="cert-input"
                    required
                  />
                </div>
                <div className="cert-form-group">
                  <label className="cert-label"><AlertTriangle size={16} style={{display:'inline', verticalAlign:'middle'}}/> Reason of Death</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="cert-input"
                    placeholder="E.g., Natural, Illness..."
                    required
                  />
                </div>
              </>
            )}

            <button className="cert-submit-btn" type="submit" disabled={loading}>
              {loading ? "Submitting..." : (
                <>Submit Application <ChevronRight size={20} /></>
              )}
            </button>
          </motion.form>
        </div>

        {/* Requests Table */}
        <motion.div 
          className="cert-table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="cert-section-title"><Clock size={24} color="#2563eb" /> My Application Status</h2>
          {requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <FileText size={48} style={{ opacity: 0.5, marginBottom: "16px" }} />
              <p>You have not submitted any certificate requests yet.</p>
            </div>
          ) : (
            <table className="cert-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Type</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600 }}>{req.fullName}</td>
                    <td>{req.type === "birth" ? "Birth Certificate" : "Death Certificate"}</td>
                    <td>{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : "N/A"}</td>
                    <td>
                      {req.status === "pending" && <span className="cert-status-badge cert-status-pending"><Clock size={14}/> Pending</span>}
                      {req.status === "approved" && <span className="cert-status-badge cert-status-approved"><CheckCircle size={14}/> Approved</span>}
                      {req.status === "rejected" && <span className="cert-status-badge cert-status-rejected"><ShieldAlert size={14}/> Rejected</span>}
                    </td>
                    <td>
                      {req.status === "approved" ? (
                        <button className="cert-download-btn" onClick={() => handleDownload(req)}>
                          <Download size={16} /> Download
                        </button>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* FAQ & CTA */}
        <motion.div 
          className="cert-faq-cta-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="cert-faq">
            <h2 className="cert-section-title"><HelpCircle size={24} color="#2563eb" /> FAQ</h2>
            <div className="cert-faq-item">
              <div className="cert-faq-q"><HelpCircle size={18} color="#2563eb" /> How long does approval take?</div>
              <div className="cert-faq-a">Usually within 2–3 working days, depending on operator availability.</div>
            </div>
            <div className="cert-faq-item">
              <div className="cert-faq-q"><HelpCircle size={18} color="#2563eb" /> Can I download it anytime?</div>
              <div className="cert-faq-a">Yes, once approved, your digitally signed PDF will remain here for download at any time.</div>
            </div>
            <div className="cert-faq-item">
              <div className="cert-faq-q"><HelpCircle size={18} color="#2563eb" /> What if it gets rejected?</div>
              <div className="cert-faq-a">You can re-apply and ensure all your details are entered accurately.</div>
            </div>
          </div>

          <div className="cert-cta">
            <UploadCloud size={64} style={{ opacity: 0.9 }} />
            <h2 className="cert-cta-title">Apply in Minutes</h2>
            <p className="cert-cta-text">
              Embrace a hassle-free, fully digital certification process today.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Certificates;
