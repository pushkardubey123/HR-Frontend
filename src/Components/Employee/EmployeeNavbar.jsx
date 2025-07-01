import React, { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import Swal from "sweetalert2";

const EmployeeNavbar = ({ sidebarOpen, toggleSidebar }) => {
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
      className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top pe-1"
      style={{
        background: "linear-gradient(to right, #232526, #414345)",
        zIndex: 1050,
        height: "56px"
      }}
    >
      <div className="d-md-none me-1" onClick={toggleSidebar} style={{ cursor: "pointer" }}>
        {sidebarOpen ? <RxCross2 size={24} color="white" /> : <RxHamburgerMenu size={24} color="white" />}
      </div>

      <div
        className="navbar-brand d-flex align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/employee/dashboard")}
      >
        <img
          src="https://www.hareetech.com/assets/logo/hareetech.png"
          alt="logo"
          style={{ height: "38px", objectFit: "contain" }}
        />
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <NotificationBell />
        <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" onClick={handleLogout}>
          <FaSignOutAlt size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;
