import React, { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import { FaBell, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";
import { FcViewDetails } from "react-icons/fc";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/notifications");
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error("Fetch notifications error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markUnreadAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((n) => axiosInstance.put(`/api/notifications/${n._id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const clearAll = async () => {
  try {
    const res = await axiosInstance.put(`/api/notifications/clear-bell`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res)
    if (res.data.success) {
      setNotifications([]); 
      Swal.fire("Success", "All notifications cleared from bell", "success");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Failed to clear notifications", "error");
  }
};


  const handleToggle = (nextShow) => {
    setShow(nextShow);
    if (nextShow) markUnreadAsRead();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Dropdown align="end" show={show} onToggle={handleToggle}>
      <Dropdown.Toggle
        variant="light"
        id="notif-bell"
        className="position-relative"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

<Dropdown.Menu style={{ minWidth: "350px", maxHeight: "400px", overflowY: "auto" }}>
  <div className="d-flex justify-content-between align-items-center px-3 pt-2 pb-1">
    <strong>Notifications</strong>
    <div className="d-flex gap-2">
      <FaTrash
        title="Clear all"
        size={18}
        style={{ cursor: "pointer" }}
        onClick={clearAll}
      />
    </div>
  </div>
  <Dropdown.Divider />

  {loading ? (
    <div className="text-center py-4">
      <Spinner animation="border" size="sm" />
    </div>
  ) : notifications.length === 0 ? (
    <div className="text-muted text-center py-3">No notifications</div>
  ) : (
    <>
      {notifications.slice(0, 5).map((notif) => (
        <Dropdown.Item
          key={notif._id}
          className={`d-flex flex-column ${notif.read ? "" : "bg-light"}`}
        >
          <strong>{notif.title}</strong>
          <small>{notif.message}</small>
          <small className="text-muted">{moment(notif.createdAt).fromNow()}</small>
        </Dropdown.Item>
      ))}
      {notifications.length > 5 && (
        <Dropdown.Item
          className="text-center text-primary"
          onClick={() => window.location.href = "/employee/notification"}
        >
          <label className="d-flex text-align-center"><FcViewDetails className="mt-1 me-1"/> View All</label>
        </Dropdown.Item>
      )}
    </>
  )}
</Dropdown.Menu>

    </Dropdown>
  );
};

export default NotificationBell;
