import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { AiOutlineSearch } from "react-icons/ai";

import {
  AiOutlineLogout,
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineBell,
} from "react-icons/ai";
import {
  MdMiscellaneousServices,
  MdOutlineUploadFile,
  MdEventNote,
  MdPostAdd,
  MdOutlinePhotoLibrary,
} from "react-icons/md"; 

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Dummy notifications

  useEffect(() => {
    // Listen to all notifications in real-time
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifData);
    });

    return () => unsubscribe();
  }, []);

  const handleNotifClick = async () => {
    setNotifOpen((prev) => !prev);

    const updatedNotifications = notifications.map((n) => {
      if (!n.readBy?.includes(user.uid)) {
        return { ...n, readBy: [...(n.readBy || []), user.uid] };
      }
      return n;
    });

    setNotifications(updatedNotifications); // update local state

    await Promise.all(
      updatedNotifications
        .filter((n) => n.readBy.includes(user.uid)) // only new reads
        .map((n) =>
          updateDoc(doc(db, "notifications", n.id), {
            readBy: n.readBy,
          })
        )
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "JD";

  const navItems = () => {
    if (!user?.role) return [];
    const base = [
      { to: "/dashboard", label: "Home", icon: <AiOutlineHome size={22} /> },
      {
        to: "/services",
        label: "Services",
        icon: <MdMiscellaneousServices size={22} />,
      },
      { to: "/posts", label: "Posts", icon: <MdPostAdd size={22} /> },
      { to: "/memories", label: "Captures", icon: <MdOutlinePhotoLibrary size={22} /> },
    ];
    const roleTabs = {
      
      operator: [
        {
          to: "/notify",
          label: "Notify", // ✅ renamed from "Manage"
          icon: <AiOutlineBell size={22} />, // ✅ better suited for notifications
        },
         
      ],
      member: [
        {
          to: "/search-family",
          label: "Search Family",
          icon: <AiOutlineSearch size={22} />,
        },
        { to: "/post", label: "Create Post", icon: <MdPostAdd size={22} /> },
      ],
       
    };
    return [...base, ...(roleTabs[user.role] || [])];
  };

  const isDashboard = location.pathname === "/dashboard";

  const navbarStyle = {
    ...styles.wrapper,
    backgroundColor:
      isDashboard && !scrolled ? "transparent" : "rgba(255,255,255,0.95)",
    color: isDashboard && !scrolled ? "#fff" : "#000",
    backdropFilter: isDashboard && !scrolled ? "none" : "blur(12px)",
    boxShadow: scrolled || !isDashboard ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
    borderBottom:
      scrolled || !isDashboard ? "1px solid rgba(0,0,0,0.08)" : "none",
    transition: "all 0.3s ease",
  };

  const textColor = isDashboard && !scrolled ? "#fff" : "#000";

  return (
    <>
      {/* ✅ Mobile Top Header */}
      {isMobile && (
        <div style={styles.mobileTopBar}>
          {location.pathname !== "/dashboard" && (
            <button style={styles.backButton} onClick={() => navigate(-1)}>
              ⬅
            </button>
          )}
          <div style={styles.pageTitle}>
            {(() => {
              switch (location.pathname) {
                case "/dashboard":
                  return "Dashboard";
                case "/services":
                  return "Services";
                case "/posts":
                  return "Posts";
                case "/feedback":
                  return "Feedback";
                case "/notices":
                  return "Notices";
                case "/meetings":
                  return "Meetings";
                case "/profile":
                  return "Profile";
                case "/settings":
                  return "Settings";
                default:
                  return "SmartPanchayat";
              }
            })()}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* 🔔 Notification Bell */}
            <div style={styles.notifWrapper} ref={notifRef}>
              <div
                style={styles.notifIcon}
                onClick={handleNotifClick} // ✅ use handleNotifClick instead of setNotifOpen
              >
                <AiOutlineBell size={24} />
                {notifications.filter((n) => !n.readBy?.includes(user.uid))
                  .length > 0 && (
                  <span style={styles.notifBadge}>
                    {
                      notifications.filter((n) => !n.readBy?.includes(user.uid))
                        .length
                    }
                  </span>
                )}
              </div>

              {/* Dropdown */}
              {notifOpen && (
                <div style={styles.notifDropdown}>
                  {notifications.length === 0 ? (
                    <div style={{ ...styles.notifItem, color: "black" }}>
                      No new notifications 🎉
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{ ...styles.notifItem, color: "black" }}
                      >
                        <div style={{ color: "black" }}>
                          {n.title ? <strong>{n.title}: </strong> : ""}
                          {n.message}
                        </div>
                        <small style={{ color: "#777" }}>
                          {n.timestamp?.toDate().toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ⚙️ Settings */}
            <button
              onClick={() => navigate("/settings")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#111",
              }}
            >
              <AiOutlineSetting size={22} />
            </button>

            {/* 🚪 Logout */}
            <button
              onClick={() => {
                auth.signOut();
                navigate("/login");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#111",
              }}
            >
              <AiOutlineLogout size={22} />
            </button>
          </div>
        </div>
      )}

      {/* ✅ Desktop Navbar */}
      {!isMobile && (
        <div style={navbarStyle}>
          <nav style={styles.navbar}>
            {/* Logo */}
            <div style={styles.logoContainer} onClick={() => navigate("/")}>
              <img src={"/logo.png"} alt="Logo" style={styles.logoImage} />
            </div>

            {/* Center links */}
            <div style={styles.navCenter}>
              {navItems().map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    color: textColor,
                    margin: "0 25px",
                    opacity: isActive ? 1 : 0.85,
                    paddingBottom: "6px", // 🟩 Adds space between text & underline
                  })}
                  onMouseEnter={(e) => {
                    const underline = e.currentTarget.querySelector("span");
                    underline.style.width = "100%"; // expands from center outward
                  }}
                  onMouseLeave={(e) => {
                    const underline = e.currentTarget.querySelector("span");
                    underline.style.width = "0%"; // collapses to center
                  }}
                >
                  {item.label}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-3px", // 🟩 Moves line slightly below text
                      left: "50%",
                      width: "0%",
                      height: "3px",
                      backgroundColor: "#4287f5",
                      transform: "translateX(-50%)",
                      transition: "width 0.4s ease",
                      borderRadius: "2px",
                    }}
                  ></span>
                </NavLink>
              ))}
            </div>

            {/* Right: Notifications + Profile */}
            <div style={styles.navRight}>
              {/* 🔔 Notification */}
              {/* 🔔 Notification */}
              <div style={styles.notifWrapper} ref={notifRef}>
                <div style={styles.notifIcon} onClick={handleNotifClick}>
                  <AiOutlineBell size={24} />
                  {notifications.filter((n) => !n.readBy?.includes(user.uid))
                    .length > 0 && (
                    <span style={styles.notifBadge}>
                      {
                        notifications.filter(
                          (n) => !n.readBy?.includes(user.uid)
                        ).length
                      }
                    </span>
                  )}
                </div>
                {notifOpen && (
                  <div style={styles.notifDropdown}>
                    {notifications.length === 0 ? (
                      <div style={{ ...styles.notifItem, color: "black" }}>
                        No notifications 🎉
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{ ...styles.notifItem, color: "black" }}
                        >
                          <div style={{ color: "black" }}>
                            {n.title ? <strong>{n.title}: </strong> : ""}
                            {n.message}
                          </div>
                          <small style={{ color: "#777" }}>
                            {n.timestamp?.toDate().toLocaleString()}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              {user ? (
                <div style={styles.profileWrapper} ref={dropdownRef}>
                  <div
                    style={{
                      ...styles.profileIcon,
                      color: "#4f46e5",
                      backgroundColor: "#fff",
                    }}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    {initials}
                  </div>
                  {dropdownOpen && (
                    <div style={styles.dropdown}>
                      <div style={styles.dropdownHeader}>
                        <div style={styles.name}>{user.fullName}</div>
                        <div style={styles.email}>{user.email}</div>
                      </div>
                      <div
                        style={styles.dropdownItem}
                        onClick={() => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        }}
                      >
                        <AiOutlineUser size={18} /> Profile
                      </div>
                      <div
                        style={styles.dropdownItem}
                        onClick={() => {
                          navigate("/settings");
                          setDropdownOpen(false);
                        }}
                      >
                        <AiOutlineSetting size={18} /> Settings
                      </div>
                      <div
                        style={{ ...styles.dropdownItem, ...styles.logoutItem }}
                        onClick={onLogout}
                      >
                        ⏎ Log out
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ color: textColor }}>Loading...</span>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* ✅ Mobile Bottom Navbar */}
      {isMobile && user && (
        <div style={styles.bottomNav}>
          {[
            ...navItems(),
            {
              to: "/profile",
              label: "Profile",
              icon: <AiOutlineUser size={24} />,
            },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.iconLink,
                color: isActive ? "#4f46e5" : "#555",
                backgroundColor: isActive ? "#f0f0ff" : "transparent",
              })}
            >
              <div style={styles.icon}>{item.icon}</div>
              <div style={styles.label}>{item.label}</div>
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

const styles = {
  mobileTopBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "55px",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    zIndex: 1001,
  },
  backButton: {
    border: "none",
    background: "transparent",
    fontSize: "20px",
    marginRight: "12px",
    cursor: "pointer",
  },
  pageTitle: { fontSize: "16px", fontWeight: "600", color: "#111" },
  wrapper: { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 50px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  logoContainer: { cursor: "pointer", display: "flex", alignItems: "center" },
  logoImage: {
    height: "90px",
    width: "90px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  navCenter: { display: "flex", gap: "25px", alignItems: "center" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: {
    position: "relative",
    fontSize: "16px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.2s ease",
    paddingBottom: "4px",
  },
  underline: {
    position: "absolute",
    width: "0%",
    height: "2px",
    bottom: 0,
    left: 0,
    backgroundColor: "#4f46e5",
    transition: "width 0.3s ease",
  },
  notifWrapper: { position: "relative" },
  notifIcon: { cursor: "pointer", position: "relative" },
  notifBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "red",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    borderRadius: "50%",
    padding: "2px 6px",
  },
  notifDropdown: {
    position: "absolute",
    top: "40px",
    right: "0",
    width: "260px",
    maxHeight: "300px",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    zIndex: 2000,
  },
  notifItem: {
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    cursor: "pointer",
  },
  profileWrapper: { position: "relative" },
  profileIcon: {
    backgroundColor: "#fff",
    color: "#4f46e5",
    fontWeight: "700",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "2px solid #e0e0ff",
    transition: "all 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    width: "220px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    overflow: "hidden",
    zIndex: 2000,
  },
  dropdownHeader: { padding: "12px", borderBottom: "1px solid #eee" },
  name: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111",
    marginBottom: "4px",
  },
  email: { fontSize: "13px", color: "#555" },
  dropdownItem: {
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#111",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoutItem: {
    backgroundColor: "#ffecec",
    color: "#b91c1c",
    fontWeight: "600",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #ddd",
    boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
    borderRadius: "12px 12px 0 0",
    zIndex: 1000,
  },
  iconLink: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "11px",
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  icon: { fontSize: "24px", marginBottom: "4px" },
  label: { fontSize: "12px", fontWeight: "500" },
};

export default Navbar;
