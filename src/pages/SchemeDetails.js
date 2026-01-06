import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const SchemeDetails = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "schemes", schemeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Scheme not found!");
          navigate("/schemes");
          return;
        }

        setScheme(docSnap.data());
      } catch (err) {
        console.error(err);
        alert("Failed to load scheme");
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId, navigate]);

  if (loading) return <p style={styles.loading}>Loading scheme details...</p>;
  if (!scheme) return null;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>{scheme.title}</h1>
        <p style={styles.description}>
          {scheme.description || "No description available."}
        </p>

        {scheme.benefits && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Benefits</h3>
            <p style={styles.sectionContent}>{scheme.benefits}</p>
          </div>
        )}

        {scheme.eligibility && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Eligibility</h3>
            <p style={styles.sectionContent}>{scheme.eligibility}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    paddingTop: "120px", // space for navbar
    paddingBottom: "40px",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: "20px",
    textAlign: "center",
  },
  description: {
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  section: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1e3a8a",
    marginBottom: "8px",
  },
  sectionContent: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.5",
  },
  loading: {
    textAlign: "center",
    marginTop: "80px",
    fontSize: "18px",
    color: "#1f3b57",
  },
};

export default SchemeDetails;
