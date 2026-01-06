import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    relation: "",
  });
  const [userData, setUserData] = useState(null);
  const [existingMembers, setExistingMembers] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData(data);

      // Count how many members already added
      const q = query(
        collection(db, "familyMembers"),
        where("familyId", "==", data.familyId)
      );
      const snapshot = await getDocs(q);
      setExistingMembers(snapshot.size);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const { fullName, email, phone, gender, age, relation } = formData;

    if (!fullName.trim()) return "Full name is required.";
    if (
      email.trim().toLowerCase() !== "na" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      return "Enter valid email or 'NA'.";
    if (phone.trim().toLowerCase() !== "na" && !/^\d{10}$/.test(phone))
      return "Enter 10-digit phone number or 'NA'.";
    if (!gender) return "Gender is required.";
    if (!age || parseInt(age) <= 0) return "Enter a valid age.";
    if (!relation.trim()) return "Relation is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }

    try {
      await addDoc(collection(db, "familyMembers"), {
        ...formData,
        familyId: userData.familyId,
        createdAt: serverTimestamp(),
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        age: "",
        relation: "",
      });
      setSuccess(true);
      fetchUserData(); // refresh count
    } catch (err) {
      console.error(err);
      setError("Failed to save member.");
    }
  };

  if (!userData) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  const remaining = userData.numberOfFamilyMembers - existingMembers;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Add Family Member</h2>

        {remaining > 0 ? (
          <>
            <p style={styles.subinfo}>
              Members remaining to add: <strong>{remaining}</strong>
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="email"
                placeholder="Email or type 'NA'"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="phone"
                placeholder="Phone or type 'NA'"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                name="age"
                placeholder="Age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="relation"
                placeholder="Relation (e.g. Mother, Son)"
                value={formData.relation}
                onChange={handleChange}
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Save Member
              </button>
              {success && (
                <p style={styles.success}>Member saved successfully.</p>
              )}
              {error && <p style={styles.error}>{error}</p>}
            </form>
          </>
        ) : (
          <>
            <p style={styles.success}>
              🎉 You have added all {userData.numberOfFamilyMembers} family
              members.
            </p>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>
              ← Back to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f9ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: "22px",
    marginBottom: "10px",
    textAlign: "center",
  },
  subinfo: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  backBtn: {
    marginTop: "16px",
    padding: "10px",
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  success: {
    color: "green",
    textAlign: "center",
    marginTop: "10px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "center",
  },
};

export default AddMember;
