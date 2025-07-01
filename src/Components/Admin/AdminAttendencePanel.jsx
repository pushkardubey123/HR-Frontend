import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import AdminLayout from "./AdminLayout";
import {
  FaUserFriends,
  FaFilter,
  FaDownload,
  FaFileCsv,
  FaTrash,
  FaSyncAlt,
  FaSearch,
} from "react-icons/fa";
import TableLoader from "./Loader/Loader";

const AdminAttendancePanel = () => {
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [filteredAttendance, setFilteredAttendance] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setGroupedAttendance(res.data.data);
        setFilteredAttendance(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  useEffect(() => {
    const filtered = {};
    Object.keys(groupedAttendance).forEach((date) => {
      const filteredRecords = groupedAttendance[date].filter((record) => {
        const matchesStatus = filterStatus ? record.status === filterStatus : true;
        const matchesSearch =
          record.employeeId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.employeeId?.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      });

      if (filteredRecords.length > 0) {
        filtered[date] = filteredRecords;
      }
    });
    setFilteredAttendance(filtered);
  }, [filterStatus, searchQuery, groupedAttendance]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the attendance record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/attendance/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          Swal.fire("Deleted", "Attendance deleted successfully", "success");
          fetchAllAttendance();
        }
      } catch (error) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const handleStatusUpdate = async (id) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Attendance",
      html: `
        <select id="status" class="swal2-select">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
        <select id="type" class="swal2-select">
          <option value="Manual">Manual</option>
          <option value="Auto">Auto</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => ({
        status: document.getElementById("status").value,
        statusType: document.getElementById("type").value,
      }),
    });

    if (formValues) {
      try {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/attendance/${id}`,
          formValues,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          Swal.fire("Updated", "Attendance updated successfully", "success");
          fetchAllAttendance();
        }
      } catch (error) {
        Swal.fire("Error", "Update failed", "error");
      }
    }
  };

  const exportToCSV = () => {
    const rows = [];
    Object.keys(filteredAttendance).forEach((date) => {
      filteredAttendance[date].forEach((a) => {
        rows.push({
          Date: date,
          Name: a.employeeId?.name,
          Email: a.employeeId?.email,
          Status: a.status,
          Type: a.statusType,
          InOutLogs: a.inOutLogs.map((log) => `IN: ${log.inTime} | OUT: ${log.outTime || "N/A"}`).join(" | "),
        });
      });
    });
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Attendance Report", 14, 10);
    const rows = [];
    Object.keys(filteredAttendance).forEach((date) => {
      filteredAttendance[date].forEach((a) => {
        rows.push([
          date,
          a.employeeId?.name,
          a.employeeId?.email,
          a.status,
          a.statusType,
          a.inOutLogs.map((log) => `IN: ${log.inTime} OUT: ${log.outTime || "N/A"}`).join("\n"),
        ]);
      });
    });
    autoTable(doc, {
      head: [["Date", "Name", "Email", "Status", "Type", "In/Out Logs"]],
      body: rows,
    });
    doc.save("attendance.pdf");
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="text-center mb-4 d-flex justify-content-center align-items-center gap-2">
          <FaUserFriends />
          <span>Admin Attendance Monitoring</span>
        </h4>

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaFilter />
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <FaSearch />
            <input
              type="text"
              className="form-control"
              style={{ width: "250px" }}
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-success d-flex align-items-center" onClick={exportToPDF}>
              <FaDownload className="me-2" />
              Export PDF
            </button>
            <button className="btn btn-primary d-flex align-items-center" onClick={exportToCSV}>
              <FaFileCsv className="me-2" />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <TableLoader />
        ) : Object.keys(filteredAttendance).length === 0 ? (
          <div className="text-center">No attendance records found.</div>
        ) : (
          Object.keys(filteredAttendance)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date, idx) => (
              <div key={idx} className="mb-5">
                <h5 className="bg-dark text-white p-2 rounded">{date}</h5>
                <div className="table-responsive">
                  <table className="table table-bordered text-center table-hover">
                    <thead className="table-secondary">
                      <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>In/Out Logs</th>
                        <th>Update</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance[date].map((a, i) => (
                        <tr key={a._id}>
                          <td>{i + 1}</td>
                          <td>{a.employeeId?.name}</td>
                          <td>{a.employeeId?.email}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                a.status === "Present"
                                  ? "success"
                                  : a.status === "Late"
                                  ? "warning"
                                  : "danger"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td>{a.statusType}</td>
                          <td className="text-start">
                            {a.inOutLogs.length > 0 ? (
                              a.inOutLogs.map((log, idx) => (
                                <div key={idx}>
                                  <strong>IN:</strong> {log.inTime || "N/A"} &nbsp;
                                  <strong>OUT:</strong> {log.outTime || "N/A"}
                                </div>
                              ))
                            ) : (
                              <span>No logs</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm d-flex align-items-center"
                              onClick={() => handleStatusUpdate(a._id)}
                            >
                              <FaSyncAlt className="me-1" />
                              Update
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm d-flex align-items-center"
                              onClick={() => handleDelete(a._id)}
                            >
                              <FaTrash className="me-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAttendancePanel;
