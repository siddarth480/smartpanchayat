// SearchFamily.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

  const roles = ["villager", "operator", "expert"];

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
    if (activeRole === "villager") return "Villager Directory - Search by Family Code";
    if (activeRole === "operator") return "Operator Directory - Search by Email";
    if (activeRole === "expert") return "Expert Directory - Search by Name";
    return "";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getHeaderText()}</h1>
      </div>

      <div style={styles.tabs}>
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => {
              setActiveRole(role);
              setFamilyCode("");
              setFilteredUsers(users.filter((u) => u.role === role));
              setError("");
            }}
            style={{
              ...styles.tab,
              ...(activeRole === role ? styles.activeTab : {}),
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder={
            activeRole === "villager"
              ? "Enter Family Code..."
              : activeRole === "operator"
              ? "Enter Email..."
              : "Enter Name..."
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
          }}
          style={styles.input}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={styles.button} onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Error Display */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {loading ? (
        <p style={styles.centerText}>Loading...</p>
      ) : filteredUsers.length === 0 ? (
        <p style={styles.centerText}>No users found.</p>
      ) : (
        <div style={styles.grid}>
          {filteredUsers.map((user) => (
            <div key={user.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{user.fullName || user.name}</h3>
                <span style={styles.role}>{user.role.toUpperCase()}</span>
              </div>
              <div style={styles.cardBody}>
                <p><strong>Family Code:</strong> {user.familyCode || "NA"}</p>
                <p><strong>Email:</strong> {user.email || "NA"}</p>
                <p><strong>Phone:</strong> {user.phone || "NA"}</p>
                <p><strong>Gender:</strong> {user.gender || "NA"}</p>
                <p><strong>Age:</strong> {user.age || "NA"}</p>
                {user.role === "villager" && user.familyId && (
                  <button style={styles.familyBtn} onClick={() => viewFamilyMembers(user)}>
                    View Family Members
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedFamily && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{selectedFamily.fullName}'s Family Members</h3>
              <button style={styles.closeIcon} onClick={() => { setModalOpen(false); setFamilyMembers([]); setSelectedFamily(null); }}>×</button>
            </div>
            <div style={styles.modalBody}>
              {familyMembers.length === 0 ? (
                <p>No family members found.</p>
              ) : (
                familyMembers.map((m) => (
                  <div key={m.id} style={styles.memberCard}>
                    <p><strong>{m.fullName}</strong> ({m.relation})</p>
                    <p>Email: {m.email || "NA"}</p>
                    <p>Phone: {m.phone || "NA"}</p>
                    <p>Gender: {m.gender || "NA"}</p>
                    <p>Age: {m.age || "NA"}</p>
                  </div>
                ))
              )}
            </div>
            <button style={styles.closeBtn} onClick={() => { setModalOpen(false); setFamilyMembers([]); setSelectedFamily(null); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#f4f7fa", padding: "80px 20px 40px 20px", fontFamily: "'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "25px" },
  title: { fontSize: "28px", color: "#1f3c88", fontWeight: 700 },
  tabs: { display: "flex", justifyContent: "center", gap: "12px", marginBottom: "25px", flexWrap: "wrap" },
  tab: { padding: "10px 20px", borderRadius: "50px", border: "1px solid #1f3c88", background: "#fff", color: "#1f3c88", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease", minWidth: "100px", textAlign: "center" },
  activeTab: { background: "#1f3c88", color: "#fff", boxShadow: "0 6px 15px rgba(0,0,0,0.15)" },
  searchBar: { display: "flex", justifyContent: "center", marginBottom: "10px", gap: "12px", flexWrap: "wrap" },
  errorMessage: { color: "#dc3545", textAlign: "center", marginBottom: "20px", fontWeight: "bold" }, // Added style
  input: { width: "280px", maxWidth: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #ccc", fontSize: "15px", outline: "none" },
  button: { padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: "#1f3c88", color: "#fff", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease" },
  familyBtn: { marginTop: "12px", padding: "10px 16px", border: "none", borderRadius: "12px", backgroundColor: "#28a745", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s ease" },
  centerText: { textAlign: "center", marginTop: "50px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "16px", boxShadow: "0 6px 20px rgba(0,0,0,0.1)", padding: "20px", transition: "all 0.3s ease" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  role: { background: "#1f3c88", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 },
  cardBody: { lineHeight: "1.6", color: "#333" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 9999 },
  modal: { backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "80vh", overflowY: "auto", padding: "24px", position: "relative", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
  modalBody: { maxHeight: "60vh", overflowY: "auto" },
  memberCard: { border: "1px solid #ddd", borderRadius: "12px", padding: "14px", marginBottom: "14px", backgroundColor: "#fafafa" },
  closeBtn: { marginTop: "16px", padding: "12px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", width: "100%", fontWeight: 600 },
  closeIcon: { fontSize: "24px", background: "none", border: "none", cursor: "pointer", color: "#555", fontWeight: "bold" },
};

export default SearchFamily;