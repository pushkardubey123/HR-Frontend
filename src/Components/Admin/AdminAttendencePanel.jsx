import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import AdminLayout from "./AdminLayout";

const AdminAttendancePanel = () => {
  const [attendances, setAttendances] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const fetchAllAttendance = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) setAttendances(res.data.data);
      console.log(res);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
      preConfirm: () => {
        return {
          status: document.getElementById("status").value,
          statusType: document.getElementById("type").value,
        };
      },
    });

    if (formValues) {
      try {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/attendance/${id}`,
          formValues,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

  const filtered = filterStatus
    ? attendances.filter((a) => a.status === filterStatus)
    : attendances;

  const exportToCSV = () => {
    const csvData = filtered.map((a, index) => ({
      S_No: index + 1,
      Name: a.employeeId.name,
      Email: a.employeeId.email,
      Date: new Date(a.date).toLocaleDateString(),
      Time: a.inTime,
      Status: a.status,
      Type: a.statusType,
    }));
    const csv = Papa.unparse(csvData);
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
    const tableData = filtered.map((a, i) => [
      i + 1,
      a.employeeId.name,
      a.employeeId.email,
      new Date(a.date).toLocaleDateString(),
      a.inTime,
      a.status,
      a.statusType,
    ]);

    autoTable(doc, {
      head: [["S No", "Name", "Email", "Date", "Time", "Status", "Type"]],
      body: tableData,
    });

    doc.save("attendance.pdf");
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="text-center">📊 Admin Attendance Monitoring</h4>

        <div className="d-flex justify-content-between mb-3">
          <div>
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
          <div>
            <button className="btn btn-success me-2" onClick={exportToPDF}>
              Export PDF
            </button>
            <button className="btn btn-primary" onClick={exportToCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Type</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a, i) => (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td>{a.employeeId?.name}</td>
                    <td>{a.employeeId?.email}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.inTime}</td>
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
                    <td>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleStatusUpdate(a._id)}
                      >
                        Update
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No attendance records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAttendancePanel;
