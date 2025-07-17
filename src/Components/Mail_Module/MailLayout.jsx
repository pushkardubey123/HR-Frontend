// src/components/Mail/MailLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BsInbox, BsPencilSquare, BsSend } from "react-icons/bs";
import { FaArrowLeft, FaTrashAlt } from "react-icons/fa";
import MailNavbar from "./MailNavbar"

const MailLayout = () => {
  const navigate = useNavigate();

  return (
    <>
    <MailNavbar/>
        <div className="container-fluid" style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <div className="row shadow-lg rounded-4 overflow-hidden" style={{ background: "#fff" }}>
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-3 border-end bg-light">
          <button
            className="btn btn-outline-dark w-100 mb-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>

          <NavLink
            to="/mail/compose"
            className="btn btn-primary w-100 mb-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
          >
            <BsPencilSquare /> Compose
          </NavLink>

          <div className="list-group shadow-sm ">
            <NavLink
              to="/mail/inbox"
              className={({ isActive }) =>
                `list-group-item list-group-item-action fw-semibold d-flex align-items-center justify-content-center${
                  isActive ? "active bg-primary text-white d-flex align-items-center justify-content-center" : ""
                }`
              }
            >
              <BsInbox className="me-2" />
              Inbox
            </NavLink>
            <NavLink
              to="/mail/sent"
              className={({ isActive }) =>
                `list-group-item list-group-item-action fw-semibold d-flex align-items-center justify-content-center ${
                  isActive ? "active bg-success text-white <FaTrashAlt />" : ""
                }`
              }
            >
              <BsSend className="me-2" />
              Sent
            </NavLink>
            <NavLink
  to="/mail/trash"
  className="list-group-item list-group-item-action d-flex align-items-center justify-content-center"
>
  <FaTrashAlt className="me-2" /> Trash
</NavLink>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          <Outlet />
        </div>
      </div>
    </div>
    </>
  );
};

export default MailLayout;
