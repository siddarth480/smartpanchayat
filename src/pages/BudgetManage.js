import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc, // ✅ Added for deleting
  doc, // ✅ Added for referencing documents
} from "firebase/firestore";
import {
  PlusCircle,
  UploadCloud,
  FileText,
  IndianRupee,
  Tag,
  Loader2,
  Trash2, // ✅ Added Delete Icon
} from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = "sid111";
const CLOUDINARY_CLOUD_NAME = "dteguxelm";

const BudgetManage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const incomeCategories = [
    "Government Grant",
    "Village Tax (House/Water)",
    "Land Revenue Share",
    "Public Donation",
    "Auction/Lease Income",
    "Miscellaneous Income",
  ];

  const expenseCategories = [
    "Road Repair & Construction",
    "Water Supply Maintenance",
    "Electricity/Street Lights",
    "Sanitation & Waste Cleanup",
    "Employee Salary",
    "Education/School Support",
    "Health & Vaccination Camps",
    "Administrative Expenses",
  ];

  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "villageBudget"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setFetching(false);
    });
    return () => unsub();
  }, []);

  const handleTypeChange = (newType) => {
    setFormData({ ...formData, type: newType, category: "" });
  };

  // ✅ New Delete Function
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "villageBudget", id));
      alert("Record deleted successfully!");
    } catch (err) {
      console.error("Error deleting document: ", err);
      alert("Failed to delete record.");
    }
  };

  const handleUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount)
      return alert("Fill required fields");

    setLoading(true);
    try {
      let receiptUrl = "";
      if (file) {
        receiptUrl = await handleUpload(file);
      }

      await addDoc(collection(db, "villageBudget"), {
        ...formData,
        amount: Number(formData.amount),
        receiptUrl,
        status: "pending",
        date: serverTimestamp(),
      });

      setFormData({
        type: "expense",
        category: "",
        amount: "",
        description: "",
      });
      setFile(null);
      alert("Entry submitted for Member approval!");
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Budget Management</h1>
          <p style={styles.subtitle}>
            Record new income/expenses and manage village accounts
          </p>
        </header>

        <div style={styles.layoutGrid}>
          <div style={styles.formCard}>
            <h3 style={styles.sectionTitle}>
              <PlusCircle size={18} /> Add Financial Entry
            </h3>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.typeToggle}>
                <button
                  type="button"
                  onClick={() => handleTypeChange("income")}
                  style={{
                    ...styles.toggleBtn,
                    ...(formData.type === "income" ? styles.activeIncome : {}),
                  }}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("expense")}
                  style={{
                    ...styles.toggleBtn,
                    ...(formData.type === "expense"
                      ? styles.activeExpense
                      : {}),
                  }}
                >
                  Expense
                </button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Tag size={14} /> Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select {formData.type} Category</option>
                  {(formData.type === "income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <IndianRupee size={14} /> Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter Amount"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FileText size={14} /> Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add details about this entry..."
                  style={{ ...styles.input, height: "80px", resize: "none" }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <UploadCloud size={14} /> Upload Receipt (Bill)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit Entry"
                )}
              </button>
            </form>
          </div>

          <div style={styles.listCard}>
            <h3 style={styles.sectionTitle}>Registry History</h3>
            {fetching ? (
              <p>Loading registry...</p>
            ) : (
              <div style={styles.scrollArea}>
                {items.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center" }}>
                    No entries found.
                  </p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} style={styles.itemRow}>
                      <div style={styles.itemMeta}>
                        <span
                          style={{
                            ...styles.statusDot,
                            background:
                              item.status === "approved"
                                ? "#10b981"
                                : "#f59e0b",
                          }}
                        ></span>
                        <div>
                          <div style={styles.itemTitle}>{item.category}</div>
                          <div style={styles.itemDate}>
                            {item.date?.seconds
                              ? new Date(
                                  item.date.seconds * 1000
                                ).toLocaleDateString()
                              : "Pending..."}
                          </div>
                        </div>
                      </div>

                      {/* ✅ Amount and Delete Actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              ...styles.itemAmount,
                              color:
                                item.type === "income" ? "#10b981" : "#ef4444",
                            }}
                          >
                            {item.type === "income" ? "+" : "-"} ₹{item.amount}
                          </div>
                          <div style={styles.itemStatus}>{item.status}</div>
                        </div>

                        {/* ✅ Delete Button */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={styles.deleteBtn}
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // ... existing styles ...
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    paddingTop: "120px",
    paddingBottom: "60px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  header: { marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "15px", color: "#64748b", marginTop: "5px" },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "30px",
    alignItems: "start",
  },
  formCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  listCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  typeToggle: {
    display: "flex",
    background: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  toggleBtn: {
    flex: 1,
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
    background: "transparent",
    color: "#64748b",
  },
  activeIncome: { background: "#10b981", color: "#fff" },
  activeExpense: { background: "#ef4444", color: "#fff" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textTransform: "uppercase",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
  },
  fileInput: { fontSize: "12px", color: "#64748b" },
  submitBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: { maxHeight: "500px", overflowY: "auto" },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  itemMeta: { display: "flex", alignItems: "center", gap: "12px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%" },
  itemTitle: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  itemDate: { fontSize: "12px", color: "#94a3b8" },
  itemAmount: { fontSize: "15px", fontWeight: "800" },
  itemStatus: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  // ✅ New Delete Button Style
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s",
    ":hover": {
      color: "#ef4444",
      background: "#fef2f2",
    },
  },
};

export default BudgetManage;
