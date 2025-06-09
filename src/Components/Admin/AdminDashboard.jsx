import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { MdOpacity } from "react-icons/md";

const AdminDashboard = () => {
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
            axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, {
              headers,
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, {
              headers,
            }),
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
    { label: "Total Employees", value: stats.totalEmployees, color: "dark" },
    {
      label: "Total Departments",
      value: stats.totalDepartments,
      color: "dark",
    },
    {
      label: "Total Designations",
      value: stats.totalDesignations,
      color: "dark",
    },
    { label: "Total Leaves", value: stats.totalLeaves, color: "dark" },
    { label: "Total Attendance", value: stats.totalAttendance, color: "dark" },
  ];

  return (
    <AdminLayout>
      <div style={backgroundStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div className="container mt-4">
            <h3 className="text-center mb-4"></h3>
            <div className="row">
              {cards.map((card, i) => (
                <div className="col-md-4 mb-3" key={i}>
                  <div className={`card text-white bg-${card.color} shadow`}>
                    <div className="card-body text-center">
                      <h5 className="card-title">{card.label}</h5>
                      <h2>{card.value}</h2>
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
