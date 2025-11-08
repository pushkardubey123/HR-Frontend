import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaUserShield,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaListUl,
} from "react-icons/fa";
import "./AdminProfile.css"; // 👈 add this

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!stored || !stored.token)
          return Swal.fire("Error", "Not logged in", "error");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/profile/${stored.id}`,
          { headers: { Authorization: `Bearer ${stored.token}` } }
        );

        const subRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/subscription/status`,
          { headers: { Authorization: `Bearer ${stored.token}` } }
        );

        setAdmin(res.data.data);
        setSubscription(subRes.data.data);
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to fetch profile",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfile();
  }, []);

  if (loading)
    return (
      <div className="center-text">Loading profile...</div>
    );

  if (!admin)
    return (
      <div className="center-text text-danger">
        Admin data not found.
      </div>
    );

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <h3 className="profile-title">👤Profile</h3>

        <div className="profile-card">
          <div className="profile-row">
            {/* Personal Info */}
            <div className="profile-col">
              <h5 className="section-title">
                <FaUser className="icon" /> Personal Information
              </h5>
              <ul className="info-list">
                <li><FaUser className="icon blue" /> <b>Name:</b> {admin.name}</li>
                <li><FaEnvelope className="icon red" /> <b>Email:</b> {admin.email}</li>
                <li><FaPhone className="icon green" /> <b>Phone:</b> {admin.phone || "N/A"}</li>
                <li><FaUserShield className="icon gold" /> <b>Role:</b> {admin.role}</li>
                <li><FaBuilding className="icon purple" /> <b>Company:</b> {admin.companyName || "N/A"}</li>
              </ul>
            </div>

            {/* Subscription Info */}
            <div className="profile-col">
              <h5 className="section-title">
                <FaCrown className="icon gold" /> Subscription Details
              </h5>
              {subscription ? (
                <ul className="info-list">
                  <li>
                    {subscription.status === "active" ? (
                      <FaCheckCircle className="icon green" />
                    ) : (
                      <FaTimesCircle className="icon red" />
                    )}
                    <b>Status:</b>{" "}
                    <span
                      className={`badge ${
                        subscription.status === "active" ? "active" : "inactive"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </li>
                  <li><FaCrown className="icon gold" /> <b>Type:</b> {subscription.isTrial ? "Trial" : "Paid"}</li>
                  <li><FaCalendarAlt className="icon blue" /> <b>Start:</b> {new Date(subscription.startDate).toLocaleDateString()}</li>
                  <li><FaCalendarAlt className="icon red" /> <b>End:</b> {new Date(subscription.endDate).toLocaleDateString()}</li>
                  <li><FaListUl className="icon purple" /> <b>Modules:</b> {subscription.modules?.join(", ") || "N/A"}</li>
                </ul>
              ) : (
                <p className="text-muted">No active subscription found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
