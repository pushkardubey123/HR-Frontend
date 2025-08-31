import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import NotificationBell from "./NotificationBell";
import Swal from "sweetalert2";
import { MdOutlineEmail } from "react-icons/md";

const AdminNavbar = ({ sidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

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
