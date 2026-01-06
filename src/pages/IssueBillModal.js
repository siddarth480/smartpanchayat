import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaRupeeSign,
  FaFileInvoice,
  FaCheckCircle,
  FaSpinner,
  FaUserCircle,
  FaTag,
  FaCalendarAlt,
  FaAlignLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const IssueBillModal = ({
  isVisible,
  onClose,
  onIssueBill,
  villagerOptions,
  isLoading,
}) => {
  const [billData, setBillData] = useState({
    userId: "",
    villagerName: "",
    billType: "House Tax",
    billId: "",
    amount: "",
    dueDate: "",
    description: "",
  });

  // Filter only Villagers for the dropdown
  const filteredVillagers = villagerOptions.filter(
    (v) => v.role?.toLowerCase() === "villager"
  );

  useEffect(() => {
    if (isVisible) {
      setBillData({
        userId: "",
        villagerName: "",
        billType: "House Tax",
        billId: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: "",
        dueDate: "",
        description: "",
      });
    }
  }, [isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({ ...prev, [name]: value }));

    if (name === "userId") {
      const selectedVillager = villagerOptions.find((v) => v.userId === value);
      setBillData((prev) => ({
        ...prev,
        villagerName: selectedVillager ? selectedVillager.villagerName : "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !billData.userId ||
      !billData.billType ||
      !billData.billId ||
      !billData.amount ||
      !billData.dueDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    onIssueBill({
      ...billData,
      amount: parseFloat(billData.amount),
    });
  };

  // --- Styles Adjusted for 500px ---
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContentStyle = {
    background: "white",
    padding: "32px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "500px", // Fixed at 500px as requested
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    position: "relative",
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  };

  const inputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const iconStyle = {
    position: "absolute",
    left: "16px",
    color: "#94a3b8",
    fontSize: "16px",
  };

  const inputBaseStyle = {
    width: "100%",
    padding: "13px 16px 13px 44px",
    border: "2px solid #f1f5f9",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
    fontWeight: "500",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div style={overlayStyle} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            style={modalContentStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <FaTimes size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background: "#eef2ff",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <FaFileInvoice color="#4338ca" size={22} />
                </div>
                Issue Invoice
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Generate a official payment request for a villager.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "20px" }}
            >
              {/* VILLAGER SELECT */}
              <div>
                <label style={labelStyle}>Select Villager</label>
                <div style={inputContainerStyle}>
                  <FaUserCircle style={iconStyle} />
                  <select
                    name="userId"
                    value={billData.userId}
                    onChange={handleChange}
                    required
                    style={{
                      ...inputBaseStyle,
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Choose a villager...</option>
                    {filteredVillagers.map((v) => (
                      <option key={v.userId} value={v.userId}>
                        {v.villagerName} ({v.userId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROW 2: TYPE & AMOUNT */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Bill Category</label>
                  <div style={inputContainerStyle}>
                    <FaTag style={iconStyle} />
                    <select
                      name="billType"
                      value={billData.billType}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, appearance: "none" }}
                    >
                      <option value="House Tax">House Tax</option>
                      <option value="Water Bill">Water Bill</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Amount (₹)</label>
                  <div style={inputContainerStyle}>
                    <FaRupeeSign style={iconStyle} />
                    <input
                      type="number"
                      name="amount"
                      value={billData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      style={inputBaseStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ROW 3: ID & DATE */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Bill ID</label>
                  <div style={inputContainerStyle}>
                    <FaTag style={iconStyle} />
                    <input
                      type="text"
                      name="billId"
                      value={billData.billId}
                      onChange={handleChange}
                      required
                      style={inputBaseStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <div style={inputContainerStyle}>
                    <FaCalendarAlt style={iconStyle} />
                    <input
                      type="date"
                      name="dueDate"
                      value={billData.dueDate}
                      onChange={handleChange}
                      required
                      style={inputBaseStyle}
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label style={labelStyle}>Notes / Description</label>
                <div style={inputContainerStyle}>
                  <FaAlignLeft style={{ ...iconStyle, top: "16px" }} />
                  <textarea
                    name="description"
                    value={billData.description}
                    onChange={handleChange}
                    placeholder="Enter bill cycle or instructions..."
                    style={{
                      ...inputBaseStyle,
                      paddingLeft: "44px",
                      minHeight: "80px",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                type="submit"
                whileHover={{
                  y: -2,
                  boxShadow: "0 10px 20px -5px rgba(67, 56, 202, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                style={{
                  marginTop: "8px",
                  padding: "14px",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" size={18} />
                ) : (
                  <>
                    <FaCheckCircle size={18} /> Finalize & Issue Bill
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IssueBillModal;
