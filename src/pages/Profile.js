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
import { 
  User, Plus, Save, Users, Phone, Mail, 
  UserCheck, MapPin, UploadCloud, FileText,
  Briefcase, Calendar, CreditCard, Droplet
} from "lucide-react";
import "./Profile.css"; // ✅ Import the new CSS

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
            setEditData({
              occupation: data.occupation || "",
              gender: data.gender || "",
              dob: data.dob || "",
              age: data.age || "",
              income: data.income || "",
              caste: data.caste || "",
              area: data.area || "",
              aadhaar: data.aadhaar || "",
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
    if (files && files.length > 0) {
      setDocuments((prev) => ({ ...prev, [name]: files[0] }));
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
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const validate = () => {
    const newErrors = {};
    const occupationVal = editData.occupation?.trim();
    if (!occupationVal) {
      newErrors.occupation = "Occupation is required";
    } else if (!/^[a-zA-Z\s]{3,50}$/.test(occupationVal)) {
      newErrors.occupation = "Must be 3-50 letters/spaces only";
    }
    if (!editData.gender) newErrors.gender = "Gender is required";
    if (!editData.dob) newErrors.dob = "Date of Birth is required";
    
    if (!editData.age || isNaN(editData.age) || Number(editData.age) <= 0 || Number(editData.age) > 120) {
      newErrors.age = "Enter a valid age (1-120)";
    }
    
    if (!editData.income || isNaN(editData.income) || Number(editData.income) < 0) {
      newErrors.income = "Enter a valid income";
    }
    
    if (!editData.caste?.trim()) newErrors.caste = "Caste is required";

    if (!editData.area) {
      newErrors.area = "Area/Ward is required for services like Garbage Management";
    }

    if (!editData.aadhaar || !/^\d{12}$/.test(editData.aadhaar)) {
      newErrors.aadhaar = "Valid 12-digit Aadhaar number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMember = () => {
    const errors = {};
    if (!editMemberData.fullName?.trim()) errors.fullName = "Name is required";
    if (!editMemberData.relation?.trim()) errors.relation = "Relation is required";
    
    if (
      editMemberData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editMemberData.email)
    ) {
      errors.email = "Valid email required";
    }
    
    if (
      editMemberData.phone &&
      !/^\d{10}$/.test(editMemberData.phone)
    ) {
      errors.phone = "Valid 10-digit phone number required";
    }
    
    if (!editMemberData.gender) errors.gender = "Gender is required";
    
    if (
      !editMemberData.age ||
      isNaN(editMemberData.age) ||
      Number(editMemberData.age) <= 0 ||
      Number(editMemberData.age) > 120
    ) {
      errors.age = "Enter a valid age (1-120)";
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
      <div className="loading-screen">
        <div className="spinner-modern"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* ✅ Profile Info Header */}
        <div className="profile-card">
          <div className="profile-cover"></div>
          <div className="profile-card-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-inner">
                <User size={48} strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="profile-header-details">
              <h2 className="profile-name">{userData.fullName}</h2>
              
              <div className="profile-contact-info">
                <div className="contact-item">
                  <Mail size={16} /> {userData.email}
                </div>
                <div className="contact-item">
                  <Phone size={16} /> {userData.phone}
                </div>
              </div>
              
              <div className="role-badge">
                Role: {userData.role}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Villager-only features */}
        {userData.role === "villager" && (
          <>
            {/* Update Profile Details */}
            <div className="profile-card">
              <div className="profile-card-content">
                <h3 className="section-title">
                  <UserCheck size={22} /> Personal & Demographic Details
                </h3>
                
                <div className="form-grid">
                  {/* Render fields logically */}
                  {[
                    "occupation",
                    "gender",
                    "dob", 
                    "age",
                    "income",
                    "caste",
                    "area",
                    "aadhaar",
                  ].map((field) => (
                    <div key={field} className="input-group">
                      <label className="input-label">
                        {field === "area"
                          ? "Village Area / Ward"
                          : field === "aadhaar"
                          ? "Aadhaar Number"
                          : field === "dob"
                          ? "Date of Birth"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>

                      {field === "gender" ? (
                        <select
                          name={field}
                          value={editData[field]}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      ) : field === "area" ? (
                        <select
                          name={field}
                          value={editData[field]}
                          onChange={handleChange}
                          className="input-field"
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
                              : field === "income" || field === "aadhaar" || field === "age"
                              ? "number"
                              : "text"
                          }
                          onInput={(e) => {
                            if (field === "aadhaar" && e.target.value.length > 12) {
                              e.target.value = e.target.value.slice(0, 12);
                            }
                          }}
                          value={editData[field]}
                          onChange={handleChange}
                          className="input-field"
                          placeholder={field === "aadhaar" ? "12-digit Aadhaar" : `Enter ${field}`}
                        />
                      )}
                      {errors[field] && (
                        <span className="input-error-text">
                          * {errors[field]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* File Uploads Section */}
                <h3 className="section-title" style={{ marginTop: '35px' }}>
                  <FileText size={22} /> Verification Documents
                </h3>
                
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Ration Card</label>
                    <label className="file-upload-wrapper">
                      <input
                        type="file"
                        name="rationCard"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="file-upload-input"
                      />
                      <div className="file-upload-content">
                        <UploadCloud size={32} />
                        <span>
                          {documents.rationCard 
                            ? documents.rationCard.name 
                            : "Click or drag file to upload"}
                        </span>
                      </div>
                    </label>
                    {docURLs.rationCard && (
                      <a
                        href={docURLs.rationCard}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-badge"
                      >
                        <FileText size={14} /> View Current Card
                      </a>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">7/12 Extract</label>
                    <label className="file-upload-wrapper">
                      <input
                        type="file"
                        name="sevenTwelfth"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="file-upload-input"
                      />
                      <div className="file-upload-content">
                        <UploadCloud size={32} />
                        <span>
                          {documents.sevenTwelfth 
                            ? documents.sevenTwelfth.name 
                            : "Click or drag file to upload"}
                        </span>
                      </div>
                    </label>
                    {docURLs.sevenTwelfth && (
                      <a
                        href={docURLs.sevenTwelfth}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-badge"
                      >
                        <FileText size={14} /> View Current Extract
                      </a>
                    )}
                  </div>
                </div>

                <div className="button-row">
                  <button
                    onClick={() => navigate("/add-member")}
                    className="btn btn-outline"
                  >
                    <Plus size={18} /> Add Family Member
                  </button>

                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                {successMsg && (
                  <div className="success-message">
                    <UserCheck size={18} /> {successMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Family Members List */}
            {members.length > 0 && (
              <div className="profile-card">
                <div className="profile-card-content">
                  <h3 className="section-title">
                    <Users size={22} /> Family Members
                  </h3>
                  <div className="members-grid">
                    {members.map((m) => (
                      <div key={m.id} className="member-card">
                        <div className="member-header">
                          <div className="member-avatar">
                            {m.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div className="member-info">
                            <h4 className="member-name">{m.fullName}</h4>
                            <span className="member-relation">{m.relation}</span>
                          </div>
                        </div>
                        <div className="member-details">
                          <div className="member-details-row">
                            <Mail size={14} /> {m.email || "N/A"}
                          </div>
                          <div className="member-details-row">
                            <Phone size={14} /> {m.phone || "N/A"}
                          </div>
                          <div className="member-details-row">
                            <User size={14} /> {m.gender || "N/A"} • Age: {m.age || "N/A"}
                          </div>
                        </div>
                        <button
                          className="btn-edit"
                          onClick={() => handleMemberEdit(m)}
                        >
                          ✏️ Edit Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal for Editing Member */}
            {modalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3 className="modal-title">Edit Family Member</h3>
                  <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                    {["fullName", "relation", "email", "phone", "age"].map(
                      (field) => (
                        <div key={field} className="input-group">
                          <label className="input-label">
                            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type={field === 'age' || field === 'phone' ? 'number' : 'text'}
                            name={field}
                            value={editMemberData[field] || ""}
                            onChange={handleMemberChange}
                            className="input-field"
                          />
                          {memberErrors[field] && (
                            <span className="input-error-text">
                              * {memberErrors[field]}
                            </span>
                          )}
                        </div>
                      )
                    )}
                    
                    <div className="input-group">
                      <label className="input-label">Gender</label>
                      <select
                        name="gender"
                        value={editMemberData.gender || ""}
                        onChange={handleMemberChange}
                        className="input-field"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {memberErrors.gender && (
                        <span className="input-error-text">* {memberErrors.gender}</span>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setMemberErrors({});
                        setSelectedMember(null);
                      }}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMemberSave}
                      className="btn btn-primary"
                    >
                      Save Changes
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

export default Profile;
