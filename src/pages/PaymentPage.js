import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Droplet,
  Home,
  CheckCircle,
  Loader2,
  FileText,
  XCircle,
  Calendar,
  IndianRupee,
  ArrowRight,
  History,
} from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { motion } from "framer-motion";

import { auth, db, functions } from "../firebase/firebase";
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";

/* ---------------- App Variables ---------------- */

const __app_id =
  typeof window !== "undefined" && window.__app_id
    ? window.__app_id
    : "default-app-id";
const __initial_auth_token =
  typeof window !== "undefined" && window.__initial_auth_token
    ? window.__initial_auth_token
    : null;

const appId = __app_id;
const initialAuthToken = __initial_auth_token;

/* ---------------- Helpers ---------------- */

const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "N/A";
  return timestamp.toDate().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BillIconMap = {
  "House Tax": Home,
  "Water Bill": Droplet,
  Other: Wallet,
};

/* ---------------- Bill Card Component ---------------- */

// LOGIC CHANGE: isPaying is now checked against the specific bill ID
const BillCard = ({ bill, onPayClick, isThisBillPaying }) => {
  const isOutstanding = bill.status === "Outstanding";
  const Icon = BillIconMap[bill.billType] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "24px",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "24px", right: "24px" }}>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: "99px",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: isOutstanding ? "#fff1f2" : "#f0fdf4",
            color: isOutstanding ? "#e11d48" : "#16a34a",
            border: `1px solid ${isOutstanding ? "#ffe4e6" : "#dcfce7"}`,
          }}
        >
          {bill.status}
        </span>
      </div>

      <div>
        <div
          style={{
            background: isOutstanding ? "#eef2ff" : "#f0fdf4",
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isOutstanding ? "#4338ca" : "#16a34a",
            marginBottom: "20px",
          }}
        >
          <Icon size={28} />
        </div>

        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "20px",
            color: "#1e293b",
            fontWeight: "700",
          }}
        >
          {bill.billType}
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          ID: {bill.billId}
        </p>

        <div
          style={{
            margin: "24px 0",
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
          }}
        >
          <span
            style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}
          >
            ₹
          </span>
          <span
            style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a" }}
          >
            {parseFloat(bill.amount).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {isOutstanding ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={isThisBillPaying} // LOGIC CHANGE: Check specific bill status
          onClick={() => onPayClick(bill)}
          style={{
            width: "100%",
            padding: "14px",
            background: "#4338ca",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background 0.2s",
            opacity: isThisBillPaying ? 0.7 : 1,
          }}
        >
          {isThisBillPaying ? ( // LOGIC CHANGE: Spinner only on this card
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Pay with Razorpay <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#16a34a",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 0",
          }}
        >
          <CheckCircle size={18} /> Paid on {formatTimestamp(bill.paidDate)}
        </div>
      )}
    </motion.div>
  );
};

/* ---------------- Main Page Component ---------------- */

const PaymentPage = () => {
  const [userId, setUserId] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null); // LOGIC CHANGE: Track ID, not boolean
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        const anon = await signInAnonymously(auth);
        setUserId(anon.user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const billsRef = collection(db, `/artifacts/${appId}/public/data/bills`);
    const q = query(billsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBills(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  // ... existing imports ...

  const handlePaymentInitiation = async (bill) => {
    alert("Doing payment...");
    if (!window.Razorpay) {
      setError("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setPayingBillId(bill.id);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Create Order using your custom private backend
      const response = await fetch("https://smartpanchyat-backend.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: bill.amount,
          billId: bill.id,
          appId: appId,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create order");
      const order = await response.json();

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_T4GPlvO8kwjhrf",
        amount: order.amount,
        currency: "INR",
        name: "Gram Panchayat",
        description: `Payment for ${bill.billType}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Update the bill status manually in Firebase here on the frontend
            const billRef = doc(db, `/artifacts/${appId}/public/data/bills`, bill.id);
            await updateDoc(billRef, {
              status: "Paid",
              paidDate: Timestamp.now()
            });

            // Note: The onSnapshot listener in your useEffect will
            // automatically update the UI when Firestore changes.
            setPayingBillId(null);
            setSuccessMsg("Payment verified successfully! Receipt has been updated.");
            setTimeout(() => setSuccessMsg(null), 5000);
          } catch (err) {
            setPayingBillId(null);
            setError("Update failed. Please try again or contact admin.");
          }
        },
        prefill: {
          name: "Citizen",
          contact: "9999999999",
        },
        theme: { color: "#4338ca" },
        modal: {
          ondismiss: function () {
            setPayingBillId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || "Could not initiate payment.");
      setPayingBillId(null);
    }
  };

  const outstanding = bills.filter((b) => b.status === "Outstanding");
  const paid = bills.filter((b) => b.status === "Paid");
  const totalDue = outstanding.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0
  );

  return (
    <div
      style={{
        padding: "120px 24px 40px 24px",
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#4338ca",
              marginBottom: "8px",
            }}
          >
            <Wallet size={32} strokeWidth={2.5} />
            <span
              style={{
                fontWeight: "800",
                letterSpacing: "-0.5px",
                fontSize: "24px",
              }}
            >
              GRAM PAY
            </span>
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 8px 0",
            }}
          >
            Citizen Billing Portal
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: 0 }}>
            User ID:{" "}
            <span style={{ color: "#334155", fontWeight: "600" }}>
              {userId || "..."}
            </span>
          </p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "#fff1f2",
              border: "1px solid #ffe4e6",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "32px",
              color: "#e11d48",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "500",
            }}
          >
            <XCircle size={20} /> {error}
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "#f0fdf4",
              border: "1px solid #dcfce7",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "32px",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "500",
            }}
          >
            <CheckCircle size={20} /> {successMsg}
          </motion.div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              TOTAL OUTSTANDING
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}
            >
              ₹{totalDue.toLocaleString("en-IN")}
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              PENDING BILLS
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "800", color: "#4338ca" }}
            >
              {outstanding.length}
            </div>
          </div>
        </div>

        <section style={{ marginBottom: "64px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <Calendar size={22} color="#4338ca" />
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Current Dues
            </h2>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "60px",
              }}
            >
              <Loader2 className="animate-spin" size={40} color="#4338ca" />
            </div>
          ) : outstanding.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {outstanding.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onPayClick={handlePaymentInitiation}
                  isThisBillPaying={payingBillId === bill.id} // LOGIC CHANGE: Pass comparison
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#ffffff",
                borderRadius: "24px",
                border: "2px dashed #e2e8f0",
              }}
            >
              <div
                style={{
                  background: "#f0fdf4",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  color: "#1e293b",
                  margin: "0 0 8px 0",
                }}
              >
                All clear!
              </h3>
              <p style={{ color: "#64748b", margin: 0 }}>
                You have no outstanding bills at the moment.
              </p>
            </div>
          )}
        </section>

        {paid.length > 0 && (
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <History size={22} color="#64748b" />
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Payment History
              </h2>
            </div>
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <th
                      style={{
                        padding: "16px 24px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Bill Type
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Date Paid
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map((b) => (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "16px 24px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {b.billType}
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          color: "#0f172a",
                          fontWeight: "700",
                        }}
                      >
                        ₹{parseFloat(b.amount).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "16px 24px", color: "#64748b" }}>
                        {formatTimestamp(b.paidDate)}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            color: "#16a34a",
                            fontSize: "13px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircle size={14} /> SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
