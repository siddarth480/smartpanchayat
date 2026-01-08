import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddMember from "./pages/AddMember";
import MemberPost from "./pages/MemberPost";
import Navbar from "./components/Navbar";
import Services from "./pages/Services";
import ComplaintPage from "./pages/ComplaintPage";
import AcknowledgeComplaints from "./pages/AcknowledgeComplaints";
import OperatorComplaints from "./pages/OperatorComplaints";

import MemberEventPanel from "./pages/MemberEventPanel";
import OperatorEventPanel from "./pages/OperatorEventPanel";
import VillageEvents from "./pages/VillageEvents";
import Chat from "./pages/Chat";
import ExpertInbox from "./pages/ExpertInbox";
import ExpertChat from "./pages/ExpertChat";

import Posts from "./pages/Posts";
import NotifyPage from "./pages/NotifyPage";

// Villager Schemes Pages
import SchemesList from "./pages/SchemesList";
import SchemeDetails from "./pages/SchemeDetails";
import ApplyScheme from "./pages/ApplyScheme";

// Operator Schemes Pages
import ManageSchemes from "./pages/ManageSchemes";
import AddEditScheme from "./pages/AddEditScheme";
import OperatorApplications from "./pages/OperatorApplications"; // ✅ Operator page

// Member Schemes Page
import MemberSchemePanel from "./pages/MemberSchemePanel";

// Villager Certificates Page
import Certificates from "./pages/Certificates";
import CertificateRequests from "./pages/CertificateRequests"; // for operator

// Member: Search Family
import SearchFamily from "./pages/SearchFamily";

//payment
import OnlinePayment from "./pages/PaymentPage";
import OperatorPayments from "./pages/OperatorPaymentManage";

//meeting
import MeetingDashboard from "./pages/MeetingDashboard";

// Budget Module
import BudgetView from "./pages/BudgetView";
import BudgetManage from "./pages/BudgetManage";
import BudgetApproval from "./pages/BudgetApproval";

// Garbage Management
import VillagerGarbage from "./pages/VillagerGarbage";
import OperatorGarbage from "./pages/OperatorGarbage";
import MemberGarbage from "./pages/MemberGarbage";

// Polls Module
import VillagerPolls from "./pages/VillagerPolls";
import OperatorPollCreator from "./pages/OperatorPollCreator";
import MemberPollResults from "./pages/MemberPollResults";

import { auth, db } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    let title = "Village Portal";

    // ===== AUTH & LANDING =====
    if (path === "/") title = "Home";
    else if (path === "/login") title = "Login";
    else if (path === "/register") title = "Register";
    // ===== DASHBOARD & PROFILE =====
    else if (path === "/dashboard") title = "Dashboard";
    else if (path === "/profile") title = "Profile";
    else if (path === "/add-member") title = "Add Member";
    else if (path === "/settings") title = "Settings";
    else if (path === "/notify") title = "Notifications";
    // ===== POSTS & SERVICES =====
    else if (path === "/posts") title = "Posts";
    else if (path === "/services") title = "Services";
    // ===== COMPLAINTS =====
    else if (path === "/complaints") title = "Complaints";
    else if (path === "/services/acknowledge") title = "Acknowledge Complaints";
    else if (path === "/services/operator-complaints")
      title = "Operator Complaints";
    // ===== EVENTS =====
    else if (path === "/services/events") title = "Village Events";
    // ===== CHAT =====
    else if (path.startsWith("/chat/")) title = "Chat";
    else if (path === "/expert-inbox") title = "Expert Inbox";
    else if (path.startsWith("/expert-chat/")) title = "Expert Chat";
    // ===== SCHEMES (VILLAGER) =====
    else if (path === "/schemes") title = "Schemes";
    else if (/^\/schemes\/[^/]+$/.test(path)) title = "Scheme Details";
    else if (path.endsWith("/apply")) title = "Apply for Scheme";
    // ===== SCHEMES (OPERATOR) =====
    else if (path === "/operator/schemes") title = "Manage Schemes";
    else if (path === "/operator/schemes/add") title = "Add Scheme";
    else if (path.startsWith("/operator/schemes/edit")) title = "Edit Scheme";
    else if (path === "/operator/schemes/applications")
      title = "Scheme Applications";
    // ===== MEMBER SCHEMES =====
    else if (path === "/member/schemes") title = "Member Scheme Approval";
    // ===== CERTIFICATES =====
    else if (path === "/certificates") title = "Certificates";
    else if (path === "/certificate-requests") title = "Certificate Requests";
    // ===== PAYMENTS =====
    else if (path === "/payment") title = "Online Payment";
    else if (path === "/operator/payments") title = "Payment Records";
    // ===== MEETINGS =====
    else if (path.startsWith("/meetings/live-view"))
      title = "Live Meeting Dashboard";
    else if (path.startsWith("/meetings/start-analysis"))
      title = "Meeting Analysis";
    // ===== GARBAGE MANAGEMENT =====
    else if (path === "/garbage-management") title = "Garbage Management";
    // ===== BUDGET MODULE =====
    else if (path === "/budget") title = "Village Budget";
    else if (path === "/budget/manage") title = "Manage Budget";
    else if (path === "/budget/approval") title = "Budget Approval";
    // ===== POLLS =====
    else if (path === "/services/polls") title = "Democratic Polls";
    else if (path === "/operator/create-poll") title = "Manage Polls";
    else if (path === "/member/poll-results") title = "Poll Analytics";

    document.title = `${title} | Smart Panchayat`;
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role,
              fullName: userData.fullName || userData.name || "",
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loadingUser) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>
    );
  }

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Home />}
        />

        {/* Auth */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard & Profile */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/add-member"
          element={user ? <AddMember user={user} /> : <Navigate to="/" />}
        />

        <Route path="/settings" element={<Settings />} />
        <Route path="/notify" element={<NotifyPage />} />

        {/* Member Post */}
        <Route
          path="/post"
          element={
            user && user.role === "member" ? (
              <MemberPost user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Member: Search Family */}
        <Route
          path="/search-family"
          element={
            user && user.role === "member" ? (
              <SearchFamily user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Posts */}
        <Route
          path="/posts"
          element={user ? <Posts user={user} /> : <Navigate to="/login" />}
        />

        {/* Services */}
        <Route
          path="/services"
          element={user ? <Services user={user} /> : <Navigate to="/login" />}
        />

        {/* Complaints */}
        <Route
          path="/complaints"
          element={
            user && user.role === "villager" ? (
              <ComplaintPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/services/acknowledge"
          element={
            user && (user.role === "sarpanch" || user.role === "member") ? (
              <AcknowledgeComplaints user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/services/operator-complaints"
          element={
            user && user.role === "operator" ? (
              <OperatorComplaints user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/services/events"
          element={
            user && user.role === "operator" ? (
              <OperatorEventPanel user={user} />
            ) : user && user.role === "member" ? (
              <MemberEventPanel user={user} />
            ) : user && user.role === "villager" ? (
              <VillageEvents user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Chat */}
        <Route
          path="/chat/:expertEmail"
          element={
            user && user.role === "villager" ? (
              <Chat user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/expert-inbox"
          element={
            user && user.role === "expert" ? (
              <ExpertInbox user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/expert-chat/:villagerEmail"
          element={
            user && user.role === "expert" ? (
              <ExpertChat user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Villager Schemes */}
        <Route
          path="/schemes"
          element={
            user && user.role === "villager" ? (
              <SchemesList user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/schemes/:schemeId"
          element={
            user && user.role === "villager" ? (
              <SchemeDetails user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/schemes/:schemeId/apply"
          element={
            user && user.role === "villager" ? (
              <ApplyScheme user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Villager Certificates */}
        <Route
          path="/certificates"
          element={
            user && user.role === "villager" ? (
              <Certificates user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Operator: Certificate Requests */}
        <Route
          path="/certificate-requests"
          element={
            user && user.role === "operator" ? (
              <CertificateRequests user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Operator Schemes */}
        <Route
          path="/operator/schemes"
          element={
            user && user.role === "operator" ? (
              <ManageSchemes user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/operator/schemes/add"
          element={
            user && user.role === "operator" ? (
              <AddEditScheme user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/operator/schemes/edit/:schemeId"
          element={
            user && user.role === "operator" ? (
              <AddEditScheme user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/operator/schemes/applications"
          element={
            user && user.role === "operator" ? (
              <OperatorApplications user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ✅ Member Schemes (Final Approval) */}
        <Route
          path="/member/schemes"
          element={
            user && user.role === "member" ? (
              <MemberSchemePanel user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 💳 Online Payment (Villager) */}
        <Route
          path="/payment"
          element={
            user && user.role === "villager" ? (
              <OnlinePayment user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 🧾 Payment Records (Operator) */}
        <Route
          path="/operator/payments"
          element={
            user && user.role === "operator" ? (
              <OperatorPayments user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* AI Meeting Analysis & Dashboard */}
        <Route
          path="/meetings/live-view/:meetingId"
          element={
            user && (user.role === "villager" || user.role === "member") ? (
              <MeetingDashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/meetings/start-analysis/:meetingId"
          element={
            user && user.role === "operator" ? (
              <MeetingDashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 🗑️ Unified Garbage Management Route */}
        <Route
          path="/garbage-management"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "villager" ? (
              <VillagerGarbage user={user} />
            ) : user.role === "operator" ? (
              <OperatorGarbage user={user} />
            ) : user.role === "member" ? (
              <MemberGarbage user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 💰 BUDGET MODULE ROLE-BASED ROUTES */}

        {/* 1. Villager Route */}
        <Route
          path="/budget"
          element={
            user?.role === "villager" ? (
              <BudgetView user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 2. Operator Route */}
        <Route
          path="/budget/manage"
          element={
            user?.role === "operator" ? (
              <BudgetManage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 3. Member Route */}
        <Route
          path="/budget/approval"
          element={
            user?.role === "member" ? (
              <BudgetApproval user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 🗳️ Democratic Polls Module */}

        {/* Villager: Voting Page */}
        <Route
          path="/services/polls"
          element={
            user && user.role === "villager" ? (
              <VillagerPolls user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Operator: Create & Manage Polls */}
        <Route
          path="/operator/create-poll"
          element={
            user && user.role === "operator" ? (
              <OperatorPollCreator user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Member: View Analytics/Results */}
        <Route
          path="/member/poll-results"
          element={
            user && user.role === "member" ? (
              <MemberPollResults user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
