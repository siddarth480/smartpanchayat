import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  FaTruck,
  FaHistory,
  FaTrashAlt,
  FaLeaf,
  FaClock,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./VillagerGarbage.css";

const VillagerGarbage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState("pickup");

  // 1. Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    };
    fetchProfile();
  }, []);

  // 2. Monitoring Status: Fixed History Query
  useEffect(() => {
    if (!auth.currentUser) return;

    // IMPORTANT: If history is blank, check browser console (F12) for an Index Link.
    // To fix it immediately without an index, you can remove the orderBy line.
    const q = query(
      collection(db, "garbageRequests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched History Docs:", docs); // Check if data is arriving in console
        setHistory(docs);

        const pending = docs.find(
          (item) => item.status === "pending" || item.status === "in-progress"
        );
        setActiveRequest(pending);
      },
      (error) => {
        console.error("Firestore Query Error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAction = async (type, isComplaint = false) => {
    if (!userProfile?.area) {
      alert("Please update your Area in your Profile first!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "garbageRequests"), {
        userId: auth.currentUser.uid,
        userName: userProfile.fullName || auth.currentUser.displayName,
        userArea: userProfile.area,
        type: type,
        status: "pending",
        timestamp: serverTimestamp(),
        category: isComplaint ? "Complaint" : "Pickup",
      });

      alert(
        isComplaint
          ? "Community report submitted."
          : `Pickup request sent for ${type}`
      );
    } catch (err) {
      alert("Error submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vg-page-wrapper">
      <div className="vg-container">
        <header className="vg-header">
          <h1 className="vg-header-title">Waste Management</h1>
          <p className="vg-header-subtitle">
            <FaMapMarkerAlt /> Serving{" "}
            <strong>{userProfile?.area || "Loading Location..."}</strong>
          </p>
        </header>

        <div className="vg-desktop-layout">
          {/* Left Column: Actions */}
          <div className="vg-action-column">
            <div className="vg-tab-bar">
              <button
                className={`vg-tab ${view === "pickup" ? "active" : "inactive"}`}
                onClick={() => setView("pickup")}
              >
                Request Pickup
              </button>
              <button
                className={`vg-tab ${view === "report" ? "active" : "inactive"}`}
                onClick={() => setView("report")}
              >
                Report Issue
              </button>
            </div>

            {view === "pickup" ? (
              <>
                <section className="vg-status-section">
                  <div
                    className={`vg-status-card ${
                      activeRequest ? "active-req" : "no-req"
                    }`}
                  >
                    <div className="vg-status-text-content">
                      <span className="vg-badge">Live Update</span>
                      <h2 className="vg-status-title">
                        {activeRequest ? "Request Active" : "No Pending Tasks"}
                      </h2>
                      <p className="vg-status-desc">
                        {activeRequest
                          ? `Your ${activeRequest.type} is being processed.`
                          : "Ready for disposal? Request below."}
                      </p>
                    </div>
                    <FaTruck size={40} color="white" opacity={0.8} />
                  </div>
                </section>

                <div className="vg-action-grid">
                  <button
                    className="vg-action-btn wet"
                    onClick={() => handleAction("Wet Waste")}
                    disabled={loading}
                  >
                    <FaLeaf color="#10B981" size={24} />{" "}
                    <span className="vg-btn-label">Wet Waste</span>
                  </button>
                  <button
                    className="vg-action-btn dry"
                    onClick={() => handleAction("Dry Waste")}
                    disabled={loading}
                  >
                    <FaTrashAlt color="#3B82F6" size={24} />{" "}
                    <span className="vg-btn-label">Dry Waste</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="vg-report-box">
                <h3 className="vg-section-heading">Community Eyes</h3>
                <p className="vg-report-hint">
                  Help the Panchayat identify dirty spots or full bins.
                </p>
                <button
                  className="vg-complaint-btn"
                  onClick={() => handleAction("Overflowing Dustbin", true)}
                  disabled={loading}
                >
                  <FaExclamationTriangle /> Overflowing Dustbin
                </button>
                <button
                  className="vg-complaint-btn"
                  onClick={() => handleAction("Public Littering", true)}
                  disabled={loading}
                >
                  <FaExclamationTriangle /> Report Blackspot
                </button>
              </div>
            )}
          </div>

          {/* Right Column: History Log */}
          <div className="vg-history-column">
            <h3 className="vg-section-heading">
              <FaHistory /> Request & Report History
            </h3>
            <div className="vg-history-list">
              {history.length === 0 ? (
                <div className="vg-empty-state">
                  <p>No activity found yet.</p>
                  <small>
                    If you just submitted, please wait a moment for the index to
                    build.
                  </small>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="vg-history-card">
                    <div className="vg-history-meta">
                      <p className="vg-history-type">
                        {item.category === "Complaint" && (
                          <FaExclamationTriangle color="#E11D48" size={12} />
                        )}{" "}
                        {item.type}
                      </p>
                      <p className="vg-history-area">{item.userArea}</p>
                      <p className="vg-history-time">
                        <FaClock size={10} style={{ marginRight: "4px" }} />
                        {item.timestamp
                          ? item.timestamp.toDate().toLocaleDateString("en-IN")
                          : "Syncing..."}
                      </p>
                    </div>
                    <div
                      className={`vg-status-tag ${
                        item.status === "collected" ? "collected" : "pending"
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagerGarbage;
