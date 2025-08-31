import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import EmployeeLayout from "./EmployeeLayout";
import { AiFillNotification } from "react-icons/ai";

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const employeeId = user?.id;
  const token = user?.token;
  console.log(employeeId);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/notifications/employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNotifications(res.data || []);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch notifications",
        });
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && token) {
      fetchNotifications();
    }
  }, [employeeId, token]);

  return (
    <EmployeeLayout>
      <div className="container mt-4">
        <div className="card shadow border-0">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex text-align-center">
              <AiFillNotification className="mt-1 me-1" /> Your Notifications
            </h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="alert alert-info text-center">
                No notifications found.
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <li key={notification._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="fw-bold mb-1">{notification.title}</h6>
                        <p className="mb-1">{notification.message}</p>
                        <small className="text-muted">
                          {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <div className="ms-3">
                        <span className="badge bg-secondary">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeNotifications;
