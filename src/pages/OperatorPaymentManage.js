import React, { useState, useEffect, useCallback } from "react";
import {
  FaChartLine,
  FaCheckCircle,
  FaRupeeSign,
  FaFilePdf,
  FaSearch,
  FaRedo,
  FaSpinner,
  FaFileInvoice,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  Timestamp,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import IssueBillModal from "./IssueBillModal";

const __app_id =
  typeof window !== "undefined" && window.__app_id
    ? window.__app_id
    : "default-app-id";
const appId = __app_id;

/* ---------------- Helper Functions ---------------- */

const formatTransactionData = (transactions) => {
  return transactions.map((txn) => {
    const dateObj = txn.transactionDate?.toDate
      ? txn.transactionDate.toDate()
      : txn.transactionDate
      ? new Date(txn.transactionDate)
      : new Date();
    return {
      ...txn,
      date: dateObj.toISOString().split("T")[0],
      transactionDateObj: dateObj,
    };
  });
};

const calculateKpis = (transactions) => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let todayCollection = 0;
  let monthCollection = 0;
  let completedCount = 0;

  transactions.forEach((txn) => {
    if (txn.status === "Paid" || txn.status === "Completed") {
      const amount = parseFloat(txn.amount) || 0;
      if (txn.date === today) todayCollection += amount;
      const txnDate = txn.transactionDateObj;
      if (
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      ) {
        monthCollection += amount;
      }
      completedCount++;
    }
  });

  return {
    todayCollection,
    monthCollection,
    totalTransactions: transactions.length,
    successRate:
      transactions.length > 0
        ? (completedCount / transactions.length) * 100
        : 0,
  };
};

/* ---------------- KPI Card Component ---------------- */
const KpiCard = ({ icon: Icon, title, value, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "20px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      border: "1px solid #f1f5f9",
      borderLeft: `6px solid ${color}`,
    }}
  >
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "16px",
        background: `${color}10`,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={24} />
    </div>
    <div>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          fontWeight: "700",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </p>
      <h3
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "800",
          color: "#1e293b",
        }}
      >
        {value}
      </h3>
    </div>
  </motion.div>
);

/* ---------------- Main Component ---------------- */
const OperatorPaymentManage = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for local refresh animation
  const [kpiData, setKpiData] = useState({
    todayCollection: 0,
    monthCollection: 0,
    totalTransactions: 0,
    successRate: 0,
  });
  const [filter, setFilter] = useState({ status: "All", search: "" });
  const [isIssueBillModalOpen, setIsIssueBillModalOpen] = useState(false);
  const [isIssuingBill, setIsIssuingBill] = useState(false);
  const [villagerOptions, setVillagerOptions] = useState([]);

  // FETCH TRANSACTIONS (REUSABLE)
  const fetchTransactions = useCallback(() => {
    setIsRefreshing(true);
    const billsCollectionPath = `/artifacts/${appId}/public/data/bills`;
    const q = query(collection(db, billsCollectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const formatted = formatTransactionData(raw);
      formatted.sort(
        (a, b) =>
          (b.issueDate?.toDate ? b.issueDate.toDate() : new Date(0)) -
          (a.issueDate?.toDate ? a.issueDate.toDate() : new Date(0))
      );

      // Artificial delay to show the "Reloading" animation clearly
      setTimeout(() => {
        setAllTransactions(formatted);
        setLoading(false);
        setIsRefreshing(false);
      }, 800);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubTxns = fetchTransactions();
    const usersRef = collection(db, "users");
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const villagers = snapshot.docs
        .map((doc) => ({
          userId: doc.id,
          villagerName:
            doc.data().fullName || doc.data().name || "Unnamed Villager",
          role: doc.data().role || "villager",
        }))
        .filter((user) => user.role.toLowerCase() === "villager");
      setVillagerOptions(villagers);
    });
    return () => {
      unsubTxns();
      unsubUsers();
    };
  }, [fetchTransactions]);

  useEffect(() => {
    let current = allTransactions;
    if (filter.status !== "All")
      current = current.filter((t) => t.status === filter.status);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      current = current.filter(
        (t) =>
          t.id?.toLowerCase().includes(s) ||
          t.villagerName?.toLowerCase().includes(s) ||
          t.billId?.toLowerCase().includes(s)
      );
    }
    setFilteredTransactions(current);
    setKpiData(calculateKpis(allTransactions));
  }, [allTransactions, filter]);

  const handleIssueBill = async (billDetails) => {
    setIsIssuingBill(true);
    try {
      const newBillData = {
        userId: billDetails.userId,
        villagerName: billDetails.villagerName,
        billType: billDetails.billType,
        billId: billDetails.billId,
        amount: parseFloat(billDetails.amount),
        dueDate: Timestamp.fromDate(new Date(billDetails.dueDate)),
        issueDate: Timestamp.now(),
        status: "Outstanding",
        description:
          billDetails.description || `${billDetails.billType} bill issued.`,
      };
      await addDoc(
        collection(db, `/artifacts/${appId}/public/data/bills`),
        newBillData
      );
      alert("Bill issued successfully!");
      setIsIssueBillModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error issuing bill.");
    } finally {
      setIsIssuingBill(false);
    }
  };

  return (
    <div style={pageContainer}>
      <header style={headerSection}>
        <div>
          <h1 style={titleStyle}>
            <FaChartLine color="#4338ca" style={{ marginRight: "10px" }} />{" "}
            Gram-Finance Central
          </h1>
          <p style={subtitleStyle}>
            Manage village revenue and real-time billing cycles.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsIssueBillModalOpen(true)}
          style={primaryBtn}
        >
          <FaFileInvoice /> Issue New Bill
        </motion.button>
      </header>

      <div style={kpiGrid}>
        <KpiCard
          icon={FaRupeeSign}
          title="Today's Collection"
          value={`₹${kpiData.todayCollection?.toLocaleString("en-IN")}`}
          color="#4338ca"
        />
        <KpiCard
          icon={FaCheckCircle}
          title="Monthly Revenue"
          value={`₹${kpiData.monthCollection?.toLocaleString("en-IN")}`}
          color="#10b981"
        />
        <KpiCard
          icon={FaUsers}
          title="Active Villagers"
          value={villagerOptions.length}
          color="#f59e0b"
        />
        <KpiCard
          icon={FaClock}
          title="Success Rate"
          value={`${kpiData.successRate?.toFixed(1)}%`}
          color="#ef4444"
        />
      </div>

      {/* --- RE-DESIGNED TABLE SECTION --- */}
      <div style={tableCard}>
        <div style={filterBar}>
          <div style={searchBox}>
            <FaSearch style={searchIcon} />
            <input
              type="text"
              placeholder="Search by name, ID or UID..."
              style={inputField}
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div style={actionControls}>
            <select
              style={selectField}
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Outstanding">Outstanding</option>
            </select>
            <button style={reportBtn}>
              <FaFilePdf /> Export
            </button>

            {/* RELOAD BUTTON (TABLE ONLY) */}
            <button
              style={refreshBtn}
              onClick={() => fetchTransactions()}
              disabled={isRefreshing}
            >
              <FaRedo className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>Reference ID</th>
                <th style={thStyle}>Villager Details</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isRefreshing || loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "100px" }}
                  >
                    <FaSpinner
                      className="animate-spin"
                      size={40}
                      color="#4338ca"
                    />
                    <p
                      style={{
                        marginTop: "15px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      Syncing ledger data...
                    </p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "60px",
                      color: "#94a3b8",
                    }}
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    style={trStyle}
                  >
                    <td style={tdStyle}>
                      <span style={idBadge}>
                        {txn.billId || txn.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>
                        {txn.villagerName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        UID: {txn.userId?.slice(0, 15)}...
                      </div>
                    </td>
                    <td style={tdStyle}>{txn.billType}</td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                      </strong>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusPillBase,
                          background:
                            txn.status === "Paid" || txn.status === "Completed"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            txn.status === "Paid" || txn.status === "Completed"
                              ? "#166534"
                              : "#991b1b",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background:
                              txn.status === "Paid" ||
                              txn.status === "Completed"
                                ? "#16a34a"
                                : "#ef4444",
                          }}
                        />
                        {txn.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IssueBillModal
        isVisible={isIssueBillModalOpen}
        onClose={() => setIsIssueBillModalOpen(false)}
        onIssueBill={handleIssueBill}
        villagerOptions={villagerOptions}
        isLoading={isIssuingBill}
      />
    </div>
  );
};

/* ---------------- MODERN STYLES ---------------- */
const pageContainer = {
  padding: "140px 40px 60px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
};
const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};
const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  color: "#0f172a",
  margin: 0,
  display: "flex",
  alignItems: "center",
  letterSpacing: "-0.5px",
};
const subtitleStyle = { color: "#64748b", margin: "5px 0 0", fontSize: "15px" };

const primaryBtn = {
  background: "#4338ca",
  color: "#fff",
  border: "none",
  padding: "14px 28px",
  borderRadius: "14px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  marginBottom: "48px",
};

const tableCard = {
  background: "#fff",
  borderRadius: "32px",
  padding: "40px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  border: "1px solid #f1f5f9",
};
const filterBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "40px",
  gap: "20px",
  flexWrap: "wrap",
};
const searchBox = { position: "relative", flex: 1, minWidth: "300px" };
const searchIcon = {
  position: "absolute",
  left: "18px",
  top: "18px",
  color: "#94a3b8",
};

const inputField = {
  width: "85%",
  padding: "16px 16px 16px 52px",
  borderRadius: "16px",
  border: "1.5px solid #f1f5f9",
  background: "#f8fafc",
  outline: "none",
  fontSize: "14px",
  transition: "0.2s",
};

const actionControls = { display: "flex", gap: "12px", alignItems: "center" };
const selectField = {
  padding: "14px 20px",
  borderRadius: "14px",
  border: "1.5px solid #f1f5f9",
  background: "#fff",
  outline: "none",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const reportBtn = {
  background: "#f1f5f9",
  border: "none",
  padding: "14px 24px",
  borderRadius: "14px",
  fontWeight: "700",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const refreshBtn = {
  background: "#eef2ff",
  border: "none",
  borderRadius: "14px",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#4338ca",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 12px",
};
const thStyle = {
  textAlign: "left",
  padding: "0 20px",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1px",
};
const trStyle = { background: "#fff", transition: "0.2s" };
const tdStyle = {
  padding: "20px",
  fontSize: "14px",
  color: "#475569",
  borderTop: "1px solid #f8fafc",
  borderBottom: "1px solid #f8fafc",
};

const idBadge = {
  background: "#f1f5f9",
  padding: "6px 10px",
  borderRadius: "8px",
  color: "#4338ca",
  fontWeight: "800",
  fontSize: "12px",
  fontFamily: "monospace",
};

const statusPillBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 16px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
};

const theadStyle = { height: "40px" };

export default OperatorPaymentManage;
