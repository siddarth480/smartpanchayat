// Profile.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, Plus, Save, Users, Phone, Mail, UserCheck } from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState({});
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState({
    rationCard: null,
    sevenTwelfth: null,
  });
  const [docURLs, setDocURLs] = useState({ rationCard: "", sevenTwelfth: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMemberData, setEditMemberData] = useState({});
  const [memberErrors, setMemberErrors] = useState({});

  const navigate = useNavigate();

  // ✅ Fetch user & members
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({ ...data, uid: user.uid });

          // Pre-fill editable fields only for villager
          if (data.role === "villager") {
            // Inside useEffect under if (data.role === "villager")
            setEditData({
              occupation: data.occupation || "",
              gender: data.gender || "",
              dob: data.dob || "",
              age: data.age || "",
              income: data.income || "",
              caste: data.caste || "",
              area: data.area || "",
              aadhaar: data.aadhaar || "", // ✅ Add this line
            });

            setDocURLs({
              rationCard: data.rationCardUrl || "",
              sevenTwelfth: data.sevenTwelfthUrl || "",
            });

            // Fetch family members
            const q = query(
              collection(db, "familyMembers"),
              where("familyId", "==", data.familyId)
            );
            const snapshot = await getDocs(q);
            setMembers(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setDocuments((prev) => ({ ...prev, [name]: files[0] }));
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
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const validate = () => {
    const newErrors = {};
    if (!editData.occupation) newErrors.occupation = "Occupation is required";
    if (!editData.gender) newErrors.gender = "Gender is required";
    if (!editData.dob) newErrors.dob = "Date of Birth is required";
    if (!editData.age || isNaN(editData.age)) newErrors.age = "Enter valid age";
    if (!editData.income || isNaN(editData.income))
      newErrors.income = "Enter valid income";
    if (!editData.caste) newErrors.caste = "Caste is required";

    // ✅ ADD THIS LINE HERE
    if (!editData.area)
      newErrors.area =
        "Area/Ward is required for services like Garbage Management";

    if (!editData.aadhaar || !/^\d{12}$/.test(editData.aadhaar)) {
      newErrors.aadhaar = "Valid 12-digit Aadhaar number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMember = () => {
    const errors = {};
    if (!editMemberData.fullName) errors.fullName = "Name is required";
    if (!editMemberData.relation) errors.relation = "Relation is required";
    if (
      !editMemberData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editMemberData.email)
    ) {
      errors.email = "Valid email required";
    }
    if (!editMemberData.phone || !/^[0-9]{10}$/.test(editMemberData.phone)) {
      errors.phone = "Valid 10-digit phone number required";
    }
    if (!editMemberData.gender) errors.gender = "Gender is required";
    if (
      !editMemberData.age ||
      isNaN(editMemberData.age) ||
      editMemberData.age <= 0
    ) {
      errors.age = "Valid age required";
    }
    setMemberErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!userData || !validate()) return;
    setSaving(true);
    await updateDoc(doc(db, "users", userData.uid), { ...editData });

    const uploadImage = async (file, name) => {
      const url = await uploadToCloudinary(file);
      await updateDoc(doc(db, "users", userData.uid), { [`${name}Url`]: url });
      setDocURLs((prev) => ({ ...prev, [name]: url }));
    };

    if (documents.rationCard) {
      await uploadImage(documents.rationCard, "rationCard");
    }
    if (documents.sevenTwelfth) {
      await uploadImage(documents.sevenTwelfth, "sevenTwelfth");
    }

    setSaving(false);
    setSuccessMsg("Profile updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleMemberEdit = (member) => {
    setSelectedMember(member);
    setEditMemberData(member);
    setModalOpen(true);
  };

  const handleMemberChange = (e) => {
    setEditMemberData({ ...editMemberData, [e.target.name]: e.target.value });
  };

  const handleMemberSave = async () => {
    if (!validateMember()) return;
    const memberRef = doc(db, "familyMembers", selectedMember.id);
    await updateDoc(memberRef, editMemberData);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id ? { ...m, ...editMemberData } : m
      )
    );
    setModalOpen(false);
    setSelectedMember(null);
    setEditMemberData({});
    setMemberErrors({});
  };

  if (!userData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ✅ Profile Info (visible to all roles) */}
        <div style={styles.card}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              <User size={40} />
            </div>
            <div>
              <h2 style={styles.name}>{userData.fullName}</h2>
              <p style={styles.role}>📍 {userData.village}</p>
            </div>
          </div>
          <div style={styles.infoRow}>
            <p>
              <Mail size={16} /> {userData.email}
            </p>
            <p>
              <Phone size={16} /> {userData.phone}
            </p>
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
            <strong>Role:</strong> {userData.role}
          </div>
        </div>

        {/* ✅ Villager-only features */}
        {userData.role === "villager" && (
          <>
            {/* Update Profile */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                <UserCheck size={20} /> Update Your Details
              </h3>
              <div style={styles.formGrid}>
                {[
                  "occupation",
                  "gender",
                  "dob",
                  "age",
                  "income",
                  "caste",
                  "area",
                  "aadhaar", // ✅ Add this here
                ].map((field) => (
                  <div key={field} style={styles.inputGroup}>
                    <label style={styles.label}>
                      {field === "area"
                        ? "Village Area / Ward"
                        : field === "aadhaar"
                        ? "Aadhaar Number" // ✅ Custom label for Aadhaar
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>

                    {field === "gender" ? (
                      <select
                        name={field}
                        value={editData[field]}
                        onChange={handleChange}
                        style={styles.input}
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    ) : field === "area" ? ( // ✅ New Dropdown for Area
                      <select
                        name={field}
                        value={editData[field]}
                        onChange={handleChange}
                        style={styles.input}
                      >
                        <option value="">Select Ward/Area</option>
                        <option>Ward No. 1</option>
                        <option>Ward No. 2</option>
                        <option>Ward No. 3</option>
                        <option>Market Area</option>
                        <option>Temple Square</option>
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={
                          field === "dob"
                            ? "date"
                            : field === "age" ||
                              field === "income" ||
                              field === "aadhaar" // ✅ Use number type/logic
                            ? "number"
                            : "text"
                        }
                        // ✅ Prevent more than 12 digits
                        onInput={(e) => {
                          if (
                            field === "aadhaar" &&
                            e.target.value.length > 12
                          ) {
                            e.target.value = e.target.value.slice(0, 12);
                          }
                        }}
                        value={editData[field]}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder={
                          field === "aadhaar" ? "12-digit Aadhaar" : ""
                        }
                      />
                    )}
                    {errors[field] && (
                      <span style={styles.error}>{errors[field]}</span>
                    )}
                  </div>
                ))}

                {/* File Uploads */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Ration Card</label>
                  <input
                    type="file"
                    name="rationCard"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    style={styles.input}
                  />
                  {docURLs.rationCard && (
                    <a
                      href={docURLs.rationCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkButton}
                    >
                      🔍 Preview
                    </a>
                  )}
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>7/12 Extract</label>
                  <input
                    type="file"
                    name="sevenTwelfth"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    style={styles.input}
                  />
                  {docURLs.sevenTwelfth && (
                    <a
                      href={docURLs.sevenTwelfth}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkButton}
                    >
                      🔍 Preview
                    </a>
                  )}
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button
                  onClick={handleSave}
                  style={styles.saveButton}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => navigate("/add-member")}
                  style={styles.addButton}
                >
                  <Plus size={16} /> Add Family Member
                </button>
              </div>
              {successMsg && <p style={styles.successMsg}>{successMsg}</p>}
            </div>

            {/* Family Members */}
            {members.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>
                  <Users size={20} /> Family Members
                </h3>
                <div style={styles.membersGrid}>
                  {members.map((m) => (
                    <div key={m.id} style={styles.memberCard}>
                      <div style={styles.memberTop}>
                        <div style={styles.memberAvatar}>{m.fullName?.[0]}</div>
                        <div>
                          <strong>{m.fullName}</strong>
                          <div style={styles.memberSub}>{m.relation}</div>
                        </div>
                      </div>
                      <div style={styles.memberDetails}>
                        <div>Email: {m.email}</div>
                        <div>Phone: {m.phone}</div>
                        <div>Gender: {m.gender}</div>
                        <div>Age: {m.age}</div>
                      </div>
                      <button
                        style={styles.editButton}
                        onClick={() => handleMemberEdit(m)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal for Editing Member */}
            {modalOpen && (
              <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                  <h3>Edit Family Member</h3>
                  {["fullName", "relation", "email", "phone", "age"].map(
                    (field) => (
                      <div key={field} style={styles.inputGroup}>
                        <label style={styles.label}>{field}</label>
                        <input
                          type={field === "age" ? "number" : "text"}
                          name={field}
                          value={editMemberData[field] || ""}
                          onChange={handleMemberChange}
                          style={styles.input}
                        />
                        {memberErrors[field] && (
                          <span style={styles.error}>
                            {memberErrors[field]}
                          </span>
                        )}
                      </div>
                    )
                  )}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Gender</label>
                    <select
                      name="gender"
                      value={editMemberData.gender || ""}
                      onChange={handleMemberChange}
                      style={styles.input}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {memberErrors.gender && (
                      <span style={styles.error}>{memberErrors.gender}</span>
                    )}
                  </div>

                  <div style={styles.buttonRow}>
                    <button
                      onClick={handleMemberSave}
                      style={styles.saveButton}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setMemberErrors({});
                        setSelectedMember(null);
                      }}
                      style={styles.addButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Styles (unchanged from your version)
const styles = {
  linkButton: {
    display: "inline-block",
    marginTop: "8px",
    padding: "6px 12px",
    backgroundColor: "#eaeaea",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#333",
    textDecoration: "none",
  },
  page: {
    backgroundColor: "#f2f4f8",
    minHeight: "100vh",
    paddingTop: "100px",
    paddingBottom: "40px",
    paddingInline: "20px",
    fontFamily: "Segoe UI, sans-serif",
  },
  container: { maxWidth: "1000px", margin: "0 auto" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "16px",
  },
  avatar: {
    backgroundColor: "#e0f0ff",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: "20px", fontWeight: "600", margin: 0 },
  role: { color: "#666", marginTop: "4px" },
  infoRow: {
    display: "flex",
    gap: "40px",
    color: "#333",
    fontSize: "14px",
    marginTop: "10px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  inputGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "14px", marginBottom: "4px" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  error: { fontSize: "12px", color: "red", marginTop: "4px" },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "10px",
  },
  saveButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  successMsg: {
    marginTop: "16px",
    color: "#155724",
    backgroundColor: "#d4edda",
    padding: "10px",
  },
  membersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", // ✅ responsive grid
    gap: "15px",
  },
  memberCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#fafafa",
  },
  memberTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  memberAvatar: {
    backgroundColor: "#d1d5db",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  memberSub: {
    fontSize: "12px",
    color: "#555",
  },
  memberDetails: {
    fontSize: "13px",
    marginBottom: "10px",
  },
  editButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "90%", // ✅ will shrink on mobile
    maxWidth: "400px", // ✅ keeps it neat on laptop
  },

  linkButton: {
    display: "inline-block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#2563eb",
    textDecoration: "underline",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
};

// ✅ Required spinner keyframes (must be in global CSS)
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = spinnerStyles;
document.head.appendChild(styleSheet);

export default Profile;
