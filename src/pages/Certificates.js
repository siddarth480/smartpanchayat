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
import govLogo from "../assets/gov-logo.png"; // <-- Add your logo in /assets
import greenTick from "../assets/green-tick.png";
import {
  AiOutlineFileAdd,
  AiOutlineInfoCircle,
  AiOutlineCheckCircle,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { MdOutlinePictureAsPdf } from "react-icons/md";

// ✅ Import images
import HomeCerImage from "../assets/home_cer.png";
import ClockImage from "../assets/clock.png";
import TrackingImage from "../assets/tracking.png";
import FillFormImage from "../assets/fill-form.png";
import ReviewImage from "../assets/review.png";
import ApprovedImage from "../assets/approved.png";
import DownloadImage from "../assets/download.png";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Fetch user’s requests safely
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Query without orderBy for now (avoids composite index issue)
        const q = query(
          collection(db, "certificateApplications"),
          where("userId", "==", user.uid)
        );

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort manually by createdAt descending (handle missing timestamp)
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

  // ✅ Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
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

    // === Border ===
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277); // (x, y, width, height)

    // === Government Logo (fixed ratio, larger) ===
    // Adjusted size: 30x30 instead of 20x20
    doc.addImage(govLogo, "PNG", 90, 12, 30, 30); // center top, not squished

    // === Header ===
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

    // === Intro Line ===
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(
      `This is to certify that the following information has been taken from the original record of ${
        req.type === "birth" ? "birth" : "death"
      }:`,
      20,
      85
    );

    // === Helper for fields ===
    let y = 100;
    const lineHeight = 8;
    const addField = (label, value) => {
      doc.setFont("times", "bold");
      doc.text(`${label}`, 20, y);
      doc.setFont("times", "normal");
      doc.text(`: ${value || "N/A"}`, 70, y);
      y += lineHeight;
    };

    // === Birth Certificate Fields ===
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

    // === Death Certificate Fields ===
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

    // === Footer / Signature ===
    y += 20;
    doc.setFont("times", "bold");
    doc.text("Certified By:", 150, y);
    y += 8;
    doc.setFont("times", "normal");
    doc.text("Registrar of Births & Deaths", 150, y);
    y += 8;
    doc.text("Circle Officer", 150, y);

    // === Signature Valid Box ===
    const sigX = 20;
    const sigY = 240;
    const sigWidth = 80;
    const sigHeight = 35;

    doc.setDrawColor(0);
    doc.rect(sigX, sigY, sigWidth, sigHeight); // Signature box

    // "Signature valid" label
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Signature valid", sigX + 5, sigY + 8);

    // ✅ Add Green Tick Image (centered)
    const tickSize = 20; // image size
    const tickX = sigX + sigWidth / 2 - tickSize / 2;
    const tickY = sigY + sigHeight / 2 - tickSize / 2;
    doc.addImage(greenTick, "PNG", tickX, tickY, tickSize, tickSize);

    // Reset text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("times", "normal");

    // Additional signature info
    doc.text("Digitally signed by Registrar", sigX + 5, sigY + 18);
    doc.text("Municipal Corporation", sigX + 5, sigY + 24);
    doc.text(`Date: ${new Date().toLocaleString()}`, sigX + 5, sigY + 30);

    // === Save ===
    doc.save(`${req.type}_certificate_${req.fullName}.pdf`);
  };

  return (
    <div
      style={{
        ...styles.wrapper,
        padding: isMobile ? "15px" : "20px",
        margin: isMobile ? "60px auto" : "90px auto",
      }}
    >
      {/* ✅ Hero Section */}
      <div style={styles.hero}>
        <AiOutlineFileAdd size={isMobile ? 40 : 60} color="#1e3a8a" />
        <h1
          style={{
            ...styles.heroTitle,
            fontSize: isMobile ? "24px" : "32px",
          }}
        >
          Apply for Birth & Death Certificates
        </h1>
        <p
          style={{
            ...styles.heroSubtitle,
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          A fast, digital, and reliable way for villagers to request essential
          legal documents from their Gram Panchayat.
        </p>
      </div>

      {/* ✅ Benefits Section */}
      <div style={styles.benefits}>
        <h2 style={styles.sectionTitle}>Benefits of Online Application</h2>
        <div
          style={{
            ...styles.benefitsGrid,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          {[
            {
              img: HomeCerImage,
              text: "Apply from your home without visiting offices",
            },
            { img: ClockImage, text: "Save time with faster processing" },
            {
              img: TrackingImage,
              text: "Easy and transparent status tracking",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                ...styles.benefitCard,
                maxWidth: isMobile ? "90%" : "auto",
              }}
            >
              <img src={item.img} alt="" style={styles.benefitImage} />
              <p style={{ fontSize: isMobile ? "14px" : "16px" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ How it Works Section */}
      <div style={styles.process}>
        <h2 style={styles.sectionTitle}>How it Works?</h2>
        <div
          style={{
            ...styles.processSteps,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          {[
            {
              img: FillFormImage,
              text: "Fill the application form and submit online",
            },
            {
              img: ReviewImage,
              text: "Panchayat operator reviews your application",
            },
            {
              img: ApprovedImage,
              text: "On approval, certificate is digitally signed",
            },
            {
              img: DownloadImage,
              text: "Villager downloads the PDF instantly",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              style={{
                ...styles.processStep,
                maxWidth: isMobile ? "90%" : "220px",
              }}
            >
              <img src={step.img} alt="" style={styles.processImage} />
              <p style={{ fontSize: isMobile ? "14px" : "16px" }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Info + Form Grid */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        {/* Info Section */}
        <div style={styles.infoBox}>
          <h2 style={styles.sectionTitle}>
            <AiOutlineInfoCircle size={22} style={{ marginRight: "8px" }} />
            Why is this important?
          </h2>
          <p>
            Birth and Death certificates are essential legal documents required
            for education, jobs, insurance, property claims, pensions, and
            government schemes.
          </p>
          <p>
            With this digital system, villagers can apply online, track status,
            and once approved by the Panchayat operator, an{" "}
            <strong>auto-generated PDF certificate</strong> will be available
            for download.
          </p>

          <div style={styles.toolsBox}>
            <p style={styles.toolsTitle}>Tools Used:</p>
            <ul style={styles.toolsList}>
              <li>
                <AiOutlineCheckCircle color="green" /> Firebase Firestore
              </li>
              <li>
                <MdOutlinePictureAsPdf color="red" /> jsPDF for certificates
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2 style={styles.sectionTitle}>Certificate Application Form</h2>

          <label style={styles.label}>Certificate Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="birth">Birth Certificate</option>
            <option value="death">Death Certificate</option>
          </select>

          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {formData.type === "birth" && (
            <>
              <label style={styles.label}>Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <label style={styles.label}>Mother's Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </>
          )}

          {formData.type === "death" && (
            <>
              <label style={styles.label}>Date of Death</label>
              <input
                type="date"
                name="dod"
                value={formData.dod}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <label style={styles.label}>Reason of Death</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </>
          )}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Apply Now"}
          </button>
        </form>
      </div>

      {/* ✅ Requests Table */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={styles.sectionTitle}>My Certificate Requests</h2>
        {requests.length === 0 ? (
          <p>You have not submitted any certificate requests yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "600px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={styles.tableHeader}>Full Name</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Submitted On</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={styles.tableCell}>{req.fullName}</td>
                    <td style={styles.tableCell}>
                      {req.type === "birth"
                        ? "Birth Certificate"
                        : "Death Certificate"}
                    </td>
                    <td style={styles.tableCell}>
                      {req.createdAt?.toDate
                        ? req.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td style={styles.tableCell}>
                      {req.status === "pending" && (
                        <span style={{ color: "#fbbf24" }}>Pending</span>
                      )}
                      {req.status === "approved" && (
                        <span style={{ color: "#22c55e" }}>Approved</span>
                      )}
                      {req.status === "rejected" && (
                        <span style={{ color: "#ef4444" }}>Rejected</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {req.status === "approved" && (
                        <button
                          style={styles.downloadButton}
                          onClick={() => handleDownload(req)}
                        >
                          Download PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ FAQ Section */}
      <div style={styles.faq}>
        <h2 style={styles.sectionTitle}>
          <AiOutlineQuestionCircle size={22} style={{ marginRight: "8px" }} />
          Frequently Asked Questions
        </h2>
        <p>
          <strong>Q:</strong> How long does it take to get approval? <br />
          <strong>A:</strong> Usually within 2–3 working days.
        </p>
        <p>
          <strong>Q:</strong> Can I download the certificate anytime? <br />
          <strong>A:</strong> Yes, once approved, you can download anytime.
        </p>
      </div>

      {/* ✅ CTA Section */}
      <div style={styles.cta}>
        <h2 style={{ fontSize: isMobile ? "20px" : "24px" }}>
          Ready to apply?
        </h2>
        <p style={{ fontSize: isMobile ? "14px" : "16px" }}>
          Take the first step towards a hassle-free, digital certification
          process.
        </p>
         
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "1200px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: { textAlign: "center", marginBottom: "40px" },
  heroTitle: { fontWeight: "700", margin: "15px 0 10px", color: "#1e3a8a" },
  heroSubtitle: { color: "#444", maxWidth: "700px", margin: "0 auto" },

  benefits: { marginTop: "50px", textAlign: "center" },
  benefitsGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  benefitCard: {
    flex: "1",
    minWidth: "200px",
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  benefitImage: { width: "60px", marginBottom: "10px" },

  process: {
    marginTop: "50px",
    background: "#f3f4f6",
    padding: "30px",
    borderRadius: "12px",
  },
  processSteps: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "20px",
  },
  processStep: { flex: "1", textAlign: "center" },
  processImage: { width: "60px", marginBottom: "10px" },

  grid: {
    display: "grid",
    gap: "30px",
    marginTop: "50px",
  },
  infoBox: {
    background: "#f9fafb",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    color: "#333",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#1e3a8a",
  },
  toolsBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  toolsTitle: { fontWeight: "600", marginBottom: "10px" },
  toolsList: { listStyle: "none", padding: 0, margin: 0, lineHeight: "1.8" },
  form: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: { fontWeight: "600", fontSize: "14px", color: "#111" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  faq: {
    marginTop: "50px",
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  cta: {
    marginTop: "60px",
    textAlign: "center",
    padding: "30px",
    background: "#1e3a8a",
    color: "#fff",
    borderRadius: "12px",
  },
  tableHeader: {
    padding: "10px",
    textAlign: "left",
    fontWeight: "600",
  },
  tableCell: { padding: "10px" },
  downloadButton: {
    padding: "8px 12px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Certificates;
