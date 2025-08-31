import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { Card, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import Loader from "./Loader/Loader";
import {
  FaUsers,
  FaCalendarAlt,
  FaUserClock,
  FaUserCheck,
  FaDoorOpen,
  FaProjectDiagram,
  FaBuilding,
  FaSitemap,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/reports/dashboard");
      setStats(res.data?.data);
    } catch {
      Swal.fire("Error", "Failed to fetch analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      label: "Employees",
      value: stats?.totalEmployees || 0,
      icon: <FaUsers size={22} />,
      color: "#007bff",
      route: "/admin/employee-management",
    },
    {
      label: "Leaves",
      value: stats?.totalLeaves || 0,
      icon: <FaCalendarAlt size={22} />,
      color: "#28a745",
      route: "/admin/leaves",
    },
    {
      label: "Attendance Records",
      value: stats?.totalAttendance || 0,
      icon: <FaUserCheck size={22} />,
      color: "#17a2b8",
      route: "/admin/employee-attendence-lists",
    },
    {
      label: "Today's Attendance",
      value: stats?.todayAttendance || 0,
      icon: <FaUserClock size={22} />,
      color: "#ffc107",
      route: "/admin/employee-attendence-lists",
    },
    {
      label: "Projects",
      value: stats?.totalProjects || 0,
      icon: <FaProjectDiagram size={22} />,
      color: "#6610f2",
      route: "/admin/project-management",
    },
    {
      label: "Exit Requests",
      value: stats?.exitRequests || 0,
      icon: <FaDoorOpen size={22} />,
      color: "#dc3545",
      route: "/admin/employee-exit-lists",
    },
  ];

  return (
    <AdminLayout>
      <div
        className="py-5 d-flex justify-content-center align-items-center"
        style={{
          minHeight: "80vh",
          background: "linear-gradient(120deg, #f5f7fa, #c3cfe2)",
        }}
      >
        <Card
          className="p-4 rounded-5 shadow-lg border-0 w-100"
          style={{
            maxWidth: "1150px",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <h4 className="mb-4 fw-bold text-primary">
            Admin Dashboard Overview
          </h4>

          {loading ? (
            <div className="text-center py-5">
              <Loader />
            </div>
          ) : (
            <Row className="g-4">
              {dashboardCards.map((card, idx) => (
                <Col md={6} lg={4} key={idx}>
                  <Card
                    onClick={() => navigate(card.route)}
                    className="h-100 border-0 shadow-sm rounded-4 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(5px)",
                      borderLeft: `6px solid ${card.color}`,
                      transition: "transform 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <Card.Body className="d-flex flex-column align-items-start justify-content-between p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="fs-2 text-white d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: card.color,
                            borderRadius: "50%",
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          {card.icon}
                        </div>
                        <h6 className="text-secondary fw-semibold mb-0">
                          {card.label}
                        </h6>
                      </div>
                      <h3 className="fw-bold text-dark mb-0">{card.value}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
