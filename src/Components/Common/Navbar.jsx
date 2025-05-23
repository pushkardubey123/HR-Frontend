import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import Login from "./Login";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { role } = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole("");
    navigate("/");
  };

  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(true);
    setRole(user.role);
    setShowModal(false);

    // Redirect based on role
    if (user.role === "Admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "Employee") {
      navigate("/employee/dashboard");
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      Swal.fire({
        title: "Go to Home?",
        text: "Are you sure you want to return to the home page?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        customClass: {
          container: "custom-swal-zindex",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/");
        }
      });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid justify-content-center">
          <a
            className="navbar-brand me-auto"
            href="/"
            onClick={handleLogoClick}
          >
            <img
              style={{
                height: "40px",
                width: "auto",
                display: "block",
                objectFit: "contain",
              }}
              src="https://www.hareetech.com/assets/logo/hareetech.png"
              alt="logo"
            />
          </a>

          {!isLoggedIn ? (
            <button
              className="btn btn-outline-light d-flex align-items-center gap-2"
              onClick={() => setShowModal(true)}
            >
              <FaUserCircle size={18} />
              <span className="pb-1">Login</span>
            </button>
          ) : (
            <div className="d-flex align-items-center">
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {showModal && (
        <Login
          onClose={() => setShowModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Navbar;
