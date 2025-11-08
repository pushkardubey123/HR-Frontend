import React from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SuperAdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        Swal.fire("Logged Out", "You have been logged out successfully.", "success");
        navigate("/");
      }
    });
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3 d-flex justify-content-between align-items-center"
      style={{ height: "56px", position: "sticky", top: 0, zIndex: 1000 }}
    >
      {/* Left: Sidebar Toggle */}
      <div className="d-flex align-items-center gap-3">
        <FaBars
          onClick={toggleSidebar}
          size={22}
          className="text-white"
          style={{ cursor: "pointer" }}
        />
        <h5 className="text-white m-0 fw-bold">Super Admin Panel</h5>
      </div>

      {/* Right: Profile */}
      <div className="dropdown">
        <button
          className="btn btn-dark dropdown-toggle d-flex align-items-center"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FaUserCircle size={22} className="me-2" />
          <span>{user?.username || "Super Admin"}</span>
        </button>
        <ul
          className="dropdown-menu dropdown-menu-end shadow"
          aria-labelledby="dropdownMenuButton"
        >
          <li>
            <button className="dropdown-item" onClick={() => navigate("/superadmin/profile")}>
              Profile
            </button>
          </li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;
