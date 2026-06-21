// SearchFamily.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, User, ShieldCheck, Mail, Phone, Hash, UserCircle, UsersRound, X, AlertCircle, FileText 
} from "lucide-react";
import "./SearchFamily.css";

const SearchFamily = () => {
  const [familyCode, setFamilyCode] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState("villager");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  const roles = [
    { id: "villager", label: "Villager", icon: UsersRound },
    { id: "operator", label: "Operator", icon: ShieldCheck },
    { id: "expert", label: "Expert", icon: UserCircle }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.role !== "member");
        setUsers(allUsers);
        setFilteredUsers(allUsers.filter((u) => u.role === activeRole));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [activeRole]);

  const handleSearch = () => {
    if (!familyCode.trim()) {
      setFilteredUsers(users.filter((u) => u.role === activeRole));
      setError("");
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.role === activeRole &&
        (activeRole === "villager"
          ? user.familyCode?.toLowerCase() === familyCode.trim().toLowerCase()
          : activeRole === "operator"
          ? user.email?.toLowerCase().includes(familyCode.trim().toLowerCase())
          : user.fullName?.toLowerCase().includes(familyCode.trim().toLowerCase()))
    );
    if (filtered.length === 0) setError("No users found with this search.");
    else setError("");
    setFilteredUsers(filtered);
  };

  const viewFamilyMembers = async (user) => {
    if (!user.familyId) return;
    setLoading(true);
    try {
      const membersQuery = query(
        collection(db, "familyMembers"),
        where("familyId", "==", user.familyId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersList = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFamilyMembers(membersList);
      setSelectedFamily(user);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch family members.");
    } finally {
      setLoading(false);
    }
  };

  const getHeaderText = () => {
    if (activeRole === "villager") return "Villager Directory";
    if (activeRole === "operator") return "Operator Directory";
    if (activeRole === "expert") return "Expert Directory";
    return "Directory";
  };
  
  const getSubHeaderText = () => {
    if (activeRole === "villager") return "Search villagers by their unique Family Code";
    if (activeRole === "operator") return "Find platform operators by Email Address";
    if (activeRole === "expert") return "Connect with experts by searching their Name";
    return "";
  };

  return (
    <div className="sf-page-container">
      <div className="sf-content-wrapper">
        <div className="sf-header">
          <motion.h1 
            className="sf-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Users className="sf-title-icon" size={40} />
            {getHeaderText()}
          </motion.h1>
          <motion.p 
            className="sf-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {getSubHeaderText()}
          </motion.p>
        </div>

        <div className="sf-controls-section">
          <motion.div 
            className="sf-tabs-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  setFamilyCode("");
                  setFilteredUsers(users.filter((u) => u.role === role.id));
                  setError("");
                }}
                className={`sf-tab ${activeRole === role.id ? "active" : ""}`}
              >
                {activeRole === role.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="sf-tab-bg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <role.icon size={18} />
                {role.label}
              </button>
            ))}
          </motion.div>

          <motion.div 
            className="sf-search-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Search className="sf-search-icon" />
            <input
              type="text"
              placeholder={
                activeRole === "villager"
                  ? "Enter Family Code (e.g. FAM001)..."
                  : activeRole === "operator"
                  ? "Enter Email Address..."
                  : "Enter Expert Name..."
              }
              value={familyCode}
              onChange={(e) => {
                const value = e.target.value;
                setFamilyCode(value);
                let filtered = users.filter((user) => user.role === activeRole);
                if (value.trim()) {
                  filtered = filtered.filter((user) => {
                    if (activeRole === "villager") {
                      return user.familyCode?.toLowerCase().includes(value.trim().toLowerCase());
                    } else if (activeRole === "operator") {
                      return user.email?.toLowerCase().includes(value.trim().toLowerCase());
                    } else if (activeRole === "expert") {
                      return user.fullName?.toLowerCase().includes(value.trim().toLowerCase());
                    }
                    return false;
                  });
                }
                setFilteredUsers(filtered);
                if (filtered.length === 0 && value.trim()) {
                   setError("No users found matching your search.");
                } else {
                   setError("");
                }
              }}
              className="sf-search-input"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="sf-search-btn" onClick={handleSearch}>
              Search
            </button>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            className="sf-error-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="sf-loader-container">
            <div className="sf-spinner"></div>
            <p>Loading directory data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div 
            className="sf-empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <User className="sf-empty-icon" />
            <p>No users found in this category.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="sf-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {filteredUsers.map((user, idx) => (
              <motion.div 
                key={user.id} 
                className="sf-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="sf-card-header">
                  <h3 className="sf-card-title">{user.fullName || user.name}</h3>
                  <span className={`sf-role-badge sf-role-${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <div className="sf-card-body">
                  <div className="sf-info-row">
                    <Hash className="sf-info-icon" />
                    <span><strong>Family Code:</strong> {user.familyCode || "NA"}</span>
                  </div>
                  <div className="sf-info-row">
                    <Mail className="sf-info-icon" />
                    <span><strong>Email:</strong> {user.email || "NA"}</span>
                  </div>
                  <div className="sf-info-row">
                    <Phone className="sf-info-icon" />
                    <span><strong>Phone:</strong> {user.phone || "NA"}</span>
                  </div>
                  <div className="sf-info-row">
                    <User className="sf-info-icon" />
                    <span><strong>Gender:</strong> {user.gender || "NA"}</span>
                  </div>
                  <div className="sf-info-row">
                    <UsersRound className="sf-info-icon" />
                    <span><strong>Age:</strong> {user.age || "NA"}</span>
                  </div>
                  
                  {user.role === "villager" && (user.rationCardUrl || user.sevenTwelfthUrl) && (
                    <div className="sf-info-docs">
                      <div className="sf-docs-title">
                        <FileText className="sf-info-icon" />
                        <strong>Uploaded Documents:</strong>
                      </div>
                      <div className="sf-docs-links">
                        {user.rationCardUrl && (
                          <a href={user.rationCardUrl} target="_blank" rel="noopener noreferrer" className="sf-doc-link">
                             Ration Card
                          </a>
                        )}
                        {user.sevenTwelfthUrl && (
                          <a href={user.sevenTwelfthUrl} target="_blank" rel="noopener noreferrer" className="sf-doc-link">
                             7/12 Extract
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "villager" && user.familyId && (
                    <button className="sf-family-btn" onClick={() => viewFamilyMembers(user)}>
                      <Users size={18} /> View Family Members
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {modalOpen && selectedFamily && (
            <motion.div 
              className="sf-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setModalOpen(false); setFamilyMembers([]); setSelectedFamily(null); }}
            >
              <motion.div 
                className="sf-modal-content"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sf-modal-header">
                  <h3 className="sf-modal-title">
                    <Users className="sf-title-icon" size={24} />
                    {selectedFamily.fullName}'s Family
                  </h3>
                  <button 
                    className="sf-modal-close" 
                    onClick={() => { setModalOpen(false); setFamilyMembers([]); setSelectedFamily(null); }}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="sf-modal-body">
                  {familyMembers.length === 0 ? (
                    <div className="sf-empty-state" style={{ padding: '40px 20px' }}>
                      <Users className="sf-empty-icon" />
                      <p>No family members found.</p>
                    </div>
                  ) : (
                    familyMembers.map((m, idx) => (
                      <motion.div 
                        key={m.id} 
                        className="sf-member-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="sf-member-header">
                          <span className="sf-member-name">
                            <UserCircle size={20} className="sf-info-icon" />
                            {m.fullName}
                          </span>
                          <span className="sf-relation-badge">{m.relation}</span>
                        </div>
                        <div className="sf-member-details">
                          <div className="sf-info-row">
                            <Mail className="sf-info-icon" size={16} />
                            <span>{m.email || "NA"}</span>
                          </div>
                          <div className="sf-info-row">
                            <Phone className="sf-info-icon" size={16} />
                            <span>{m.phone || "NA"}</span>
                          </div>
                          <div className="sf-info-row">
                            <User className="sf-info-icon" size={16} />
                            <span>{m.gender || "NA"}</span>
                          </div>
                          <div className="sf-info-row">
                            <UsersRound className="sf-info-icon" size={16} />
                            <span>{m.age || "NA"} yrs</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                <div className="sf-modal-footer">
                  <button 
                    className="sf-btn-close-modal" 
                    onClick={() => { setModalOpen(false); setFamilyMembers([]); setSelectedFamily(null); }}
                  >
                    Close Directory
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchFamily;