// Updated AdminNavbar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import NotificationBell from "./NotificationBell";
import Swal from "sweetalert2";
import { MdOutlineEmail } from "react-icons/md";
import axios from "axios";

const AdminNavbar = ({ sidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [trialWarning, setTrialWarning] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("user"));
  setUser(stored);
  if (!stored || !stored.token) return;

  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/subscription/status`,
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );
      console.log(res)
      const sub = res.data.data;
      if (!sub) return;

      // Calculate remaining days
      const today = new Date();
      const end = new Date(sub.endDate);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      const isExpired = diff <= 0 || sub.status === "expired";

      // Store it locally
      stored.subscription = sub;
      localStorage.setItem("user", JSON.stringify(stored));

      if (isExpired) {
        Swal.fire({
          title: "Subscription Expired",
          text: "Your trial or paid subscription has expired. Please renew to continue using the system.",
          icon: "error",
          confirmButtonText: "Renew Now",
        }).then(() => navigate("/admin/subscription"));
        return;
      }

      // Show trial / expiry warning
      if (sub.isTrial && diff <= 3) {
        setTrialWarning({ daysLeft: diff, endDate: sub.endDate });
      } else if (!sub.isTrial && diff <= 5) {
        Swal.fire({
          title: "Subscription Ending Soon",
          text: `Your subscription will expire in ${diff} day(s).`,
          icon: "warning",
          confirmButtonText: "Renew Now",
        }).then(() => navigate("/admin/subscription"));
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    }
  };

  fetchStatus();
}, []);
;

  useEffect(() => {
    if (trialWarning) {
      Swal.fire({
        title: 'Trial Ending Soon',
        html: `Your free trial ends in <b>${trialWarning.daysLeft}</b> day(s) on <b>${new Date(trialWarning.endDate).toLocaleDateString()}</b>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Renew Now',
        cancelButtonText: 'Later'
      }).then(res => {
        if (res.isConfirmed) {
          navigate('/admin/dashboard'); // or navigate to subscription page
        }
      });
    }
  }, [trialWarning]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("user");
        navigate("/");
      }
    });
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top px-1"
      style={{
        background: "linear-gradient(to right, #232526, #414345)",
        zIndex: 1050,
      }}
    >
      <div
        className="d-md-none"
        onClick={toggleSidebar}
        style={{ cursor: "pointer" }}
      >
        {sidebarOpen ? (
          <RxCross2 size={24} color="white" />
        ) : (
          <RxHamburgerMenu size={24} color="white" />
        )}
      </div>

      <div
        className="navbar-brand d-flex align-items-center"
        onClick={() => navigate("/admin/dashboard")}
        style={{ cursor: "pointer" }}
      >
        <img
          src="https://www.hareetech.com/assets/logo/hareetech.png"
          alt="logo"
          style={{ height: "38px", objectFit: "contain" }}
        />
        {/* small pill if trial ending soon */}
        {trialWarning && (
          <span style={{ marginLeft: 10, background: '#ffc107', color: '#000', padding: '4px 8px', borderRadius: 20, fontSize: 12 }}>
            Trial ends in {trialWarning.daysLeft} day(s)
          </span>
        )}
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <button
          className="btn btn-sm bg-white"
          onClick={() => navigate("/mail/inbox")}
        >
          <MdOutlineEmail size={33} className="pb-2" />
        </button>
        <NotificationBell />
        <button
          className="btn btn-sm btn-danger d-flex align-items-center gap-2 me-1"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;