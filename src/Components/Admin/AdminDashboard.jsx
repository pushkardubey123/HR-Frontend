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
import DotLoader from "./Loader/Loader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

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
        Swal.fire("Error", "Dashboard Load Error: ", error.message);
      }
    };

    fetchAllStats();
  }, []);

  const cards = [
    {
      label: "Employees",
      value: stats?.totalEmployees,
      icon: <FaUsers size={22} />,
      route: "/admin/employee-management",
    },
    {
      label: "Departments",
      value: stats?.totalDepartments,
      icon: <FaBuilding size={22} />,
      route: "/admin/department",
    },
    {
      label: "Designations",
      value: stats?.totalDesignations,
      icon: <FaSitemap size={22} />,
      route: "/admin/designations",
    },
    {
      label: "Leaves",
      value: stats?.totalLeaves,
      icon: <FaClipboardList size={22} />,
      route: "/admin/leaves",
    },
    {
      label: "Attendance",
      value: stats?.totalAttendance,
      icon: <FaCalendarCheck size={22} />,
      route: "/admin/employee-attendence-lists",
    },
  ];

  const backgroundStyle = {
    backgroundImage: 'url("/images/office-bg.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "85vh",
    padding: "20px 10px",
    color: "#fff",
    position: "relative",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
  };

  return (
    <AdminLayout>
      <div style={backgroundStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div className="container mt-3">
            <h3 className="text-center mb-4">Admin Dashboard</h3>
            <div className="row justify-content-center">
              {cards.map((card, i) => (
                <div
                  className="col-xl-4 col-md-6 col-sm-10 mb-4"
                  key={i}
                  onClick={() => navigate(card.route)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="card h-100 bg-dark text-white shadow-lg border-0"
                    style={{
                      borderRadius: "12px",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div className="card-body text-center py-4">
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                        <span>{card.icon}</span>
                        <h5 className="mb-0">{card.label}</h5>
                      </div>
                      <h2 className="fw-bold">
                        {stats ? card.value : <DotLoader />}
                      </h2>
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
