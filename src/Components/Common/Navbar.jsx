import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const HomeNavbar = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="navbar px-4 py-2 shadow-sm sticky-top"
        style={{
          background: "linear-gradient(to right, #232526, #414345)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a
            className="navbar-brand d-flex align-items-center gap-2"
            href="/"
            style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}
          >
            <img
              src="https://www.hareetech.com/assets/logo/hareetech.png"
              alt="logo"
              style={{ height: "38px", objectFit: "contain" }}
            />
          </a>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-light px-3 py-1 rounded-pill"
              onClick={() => navigate("/jobs")}
            >
              Career
            </button>

            <button
              className="btn btn-outline-light d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
              onClick={() => setShowModal(true)}
            >
              <FaUserCircle size={18} />
              <span className="fw-semibold">Login</span>
            </button>
          </div>
        </div>
      </nav>

      {showModal && (
        <Login
          onClose={() => setShowModal(false)}
          onLoginSuccess={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default HomeNavbar;
