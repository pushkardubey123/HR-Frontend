import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";

const AdminLeavePanel = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leaves`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/leaves/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire("Updated", `Leave ${status}`, "success");
      fetchLeaves();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const deleteLeave = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/leaves/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Deleted", "Leave removed", "success");
      fetchLeaves();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Could not delete", "error");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchSearch = leave.employeeId?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = statusFilter ? leave.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="mb-3">Leave Requests</h4>

        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            className="form-control w-50 me-2"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select w-25"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.employeeId?.name}</td>
                  <td>{leave.employeeId?.email}</td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate?.slice(0, 10)}</td>
                  <td>{leave.endDate?.slice(0, 10)}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span
                      className={`badge bg-${getStatusColor(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={() => updateStatus(leave._id, "Approved")}
                      disabled={leave.status !== "Pending"}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-1"
                      onClick={() => updateStatus(leave._id, "Rejected")}
                      disabled={leave.status !== "Pending"}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteLeave(leave._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "warning";
  }
};

export default AdminLeavePanel;
