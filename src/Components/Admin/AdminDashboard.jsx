import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBuilding,
  FaSitemap,
  FaClipboardList,
  FaCalendarCheck,
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const backgroundStyle = {
    backgroundImage: 'url("/images/office-bg.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "85vh",
    padding: "30px",
    color: "#fff",
    position: "relative",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
  };

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalDesignations: 0,
    totalLeaves: 0,
    totalAttendance: 0,
  });

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAllStats = async () => {
      try {
        const [usersRes, deptRes, desigRes, leavesRes, attendRes] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/user/`, { headers }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/departments`),
            axios.get(`${import.meta.env.VITE_API_URL}/api/designations`),
            axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, { headers }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { headers }),
          ]);

        const totalEmployees = usersRes.data.data.filter(
          (u) => u.role === "employee"
        ).length;

        setStats({
          totalEmployees,
          totalDepartments: deptRes.data.data.length,
          totalDesignations: desigRes.data.data.length,
          totalLeaves: leavesRes.data.data.length,
          totalAttendance: attendRes.data.data.length,
        });
      } catch (error) {
        console.error("Dashboard Load Error:", error.message);
      }
    };

    fetchAllStats();
  }, []);

  const cards = [
    {
      label: "Employees",
      value: stats.totalEmployees,
      icon: <FaUsers size={24} />,
      route: "/admin/employee-management",
    },
    {
      label: "Departments",
      value: stats.totalDepartments,
      icon: <FaBuilding size={24} />,
      route: "/admin/department",
    },
    {
      label: "Designations",
      value: stats.totalDesignations,
      icon: <FaSitemap size={24} />,
      route: "/admin/designations",
    },
    {
      label: "Leaves",
      value: stats.totalLeaves,
      icon: <FaClipboardList size={24} />,
      route: "/admin/leaves",
    },
    {
      label: "Attendance",
      value: stats.totalAttendance,
      icon: <FaCalendarCheck size={24} />,
      route: "/admin/employee-attendence-lists",
    },
  ];

  return (
    <AdminLayout>
      <div style={backgroundStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div className="container mt-4">
            <div className="row">
              {cards.map((card, i) => (
                <div
                  className="col-md-4 mb-3"
                  key={i}
                  onClick={() => navigate(card.route)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="card text-white bg-dark shadow-lg"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body text-center py-4">
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                        <span>{card.icon}</span>
                        <h5 className="card-title mb-0">{card.label}</h5>
                      </div>
                      <h2 className="fw-bold">{card.value}</h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
