import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Admin/Loader/Loader";
import Swal from "sweetalert2";
import { FaTrashRestore, FaTrashAlt } from "react-icons/fa";

const Trash = () => {
  const [trashMails, setTrashMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mail/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashMails(res.data.data);
    } catch (err) {
      console.error("Trash load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mail/restore/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Restored", "Mail has been restored successfully", "success");
      fetchTrash();
    } catch (err) {
      console.error("Restore error", err);
      Swal.fire("Error", "Failed to restore mail", "error");
    }
  };

  const handleDeleteForever = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Permanently?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/mail/permanent-delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted", "Mail permanently deleted", "success");
        fetchTrash();
      } catch (err) {
        console.error("Permanent delete error", err);
        Swal.fire("Error", "Failed to delete permanently", "error");
      }
    }
  };

  return (
    <div>
      <h5 className="text-danger">🗑️ Trash</h5>
      {loading ? (
        <Loader />
      ) : trashMails.length === 0 ? (
        <p className="text-muted mt-4">No trashed mails found.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>From</th>
                <th>To</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashMails.map((mail, i) => (
                <tr key={mail._id}>
                  <td>{i + 1}</td>
                  <td>{mail.sender?.email || "N/A"}</td>
                  <td>{mail.recipients.join(", ")}</td>
                  <td>{mail.subject}</td>
                  <td>{new Date(mail.createdAt).toLocaleString()}</td>
                  <td className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleRestore(mail._id)}
                    >
                      <FaTrashRestore /> Restore
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteForever(mail._id)}
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Trash;
