import React, { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import { FaBell, FaSyncAlt, FaTrash } from "react-icons/fa";
import axios from "axios";

const AdminNotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false); 

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchAdminAlerts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/notifications/admin-alerts");
      const filtered = res.data?.data?.filter((a) => a.count > 0) || [];
      setAlerts(filtered);
      setAcknowledged(false);
    } catch (err) {
      console.error("Admin alert fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = acknowledged ? 0 : alerts.length;

  const handleToggle = (nextShow) => {
    setShow(nextShow);
    if (nextShow) setAcknowledged(true);
  };

  const clearAlerts = () => {
    setAlerts([]);
    setAcknowledged(true);
  };

  useEffect(() => {
    fetchAdminAlerts();
    const interval = setInterval(fetchAdminAlerts, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <Dropdown align="end" show={show} onToggle={handleToggle}>
      <Dropdown.Toggle variant="light" className="position-relative">
        <FaBell size={20} />
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: "350px", maxHeight: "400px", overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-center px-3 pt-2 pb-1">
          <strong>Admin Alerts</strong>
          <div className="d-flex gap-2">
            <FaSyncAlt
              title="Refresh"
              size={16}
              style={{ cursor: "pointer" }}
              onClick={fetchAdminAlerts}
            />
            <FaTrash
              title="Clear"
              size={16}
              style={{ cursor: "pointer" }}
              onClick={clearAlerts}
            />
          </div>
        </div>
        <Dropdown.Divider />

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-muted text-center py-3">No pending alerts</div>
        ) : (
          alerts.map((alert, idx) => (
            <Dropdown.Item key={idx} className="bg-warning-subtle d-flex flex-column">
              <strong>{alert.title}</strong>
              <small className="text-muted">{alert.count} pending</small>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminNotificationBell;
