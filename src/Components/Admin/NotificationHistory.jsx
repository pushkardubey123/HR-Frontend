import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash, FaEye, FaBell } from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import moment from "moment";
import Loader from "./Loader/Loader";

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        Swal.fire("Deleted!", "Notification has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete notification", "error");
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    const cleanPath = image.startsWith("uploads/")
      ? image.replace("uploads/", "")
      : image;
    return `${import.meta.env.VITE_API_URL}/static/${cleanPath}`;
  };

  const handlePreview = (notif) => {
    const imgTag = notif.image
      ? `<img src="${getImageUrl(
          notif.image
        )}" alt="image" style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; margin: auto" />`
      : "";
    Swal.fire({
      title: notif.title,
      html: `
        ${imgTag}
        <p><strong>Message:</strong> ${notif.message}</p>
        <p><strong>Recipient:</strong> ${
          notif.recipient === "all"
            ? "All Staff"
            : typeof notif.recipient === "object"
            ? notif.recipient?.name || "Unnamed"
            : notif.recipient
        }</p>
        <p><strong>Date:</strong> ${moment(notif.createdAt).format(
          "DD MMM YYYY, hh:mm A"
        )}</p>
      `,
      icon: notif.type || "info",
    });
  };

  return (
    <AdminLayout>
      <div className="container">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header bg-dark text-white fs-5 fw-bold py-3 d-flex align-items-center">
            <FaBell className="me-2" /> Notification History
          </div>
          <div className="card-body table-responsive">
            {loading ? (
              <Loader />
            ) : Array.isArray(notifications) && notifications.length > 0 ? (
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif, idx) => (
                    <tr key={notif._id}>
                      <td>{idx + 1}</td>
                      <td>{notif.title}</td>
                      <td style={{ maxWidth: 200 }}>{notif.message}</td>
                      <td>
                        {notif.recipient === "all"
                          ? "All Staff"
                          : typeof notif.recipient === "object"
                          ? notif.recipient?.name || "Unnamed"
                          : notif.recipient}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            notif.type === "success"
                              ? "success"
                              : notif.type === "warning"
                              ? "warning text-dark"
                              : "info"
                          }`}
                        >
                          {notif.type}
                        </span>
                      </td>
                      <td>
                        {moment(notif.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => handleDelete(notif._id)}
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handlePreview(notif)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No notifications found.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationHistory;
