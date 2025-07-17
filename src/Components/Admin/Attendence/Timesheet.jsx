import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../AdminLayout";
import { FaSearch, FaFileCsv, FaDownload } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Timesheet = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timesheets, setTimesheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching employees:", err);
    }
  };

 const fetchTimesheets = async () => {
  try {
    let query = `?`;
    if (startDate) query += `startDate=${startDate}&`;
    if (endDate) query += `endDate=${endDate}&`;
    if (selectedEmployee !== "all") query += `employee=${selectedEmployee}`;

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/timesheet/all${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setTimesheets(res.data.data);
    }
  } catch (err) {
    console.log("Error fetching timesheets:", err);
  }
};


  useEffect(() => {
    fetchEmployees();
    fetchTimesheets();
  }, []);

  useEffect(() => {
    fetchTimesheets();
  }, [startDate, endDate, selectedEmployee]);

  const filtered = timesheets.filter((item) =>
    item?.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item?.employee?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const rows = filtered.map((item) => ({
      Date: new Date(item.date).toLocaleDateString(),
      Name: item.employee?.name,
      Email: item.employee?.email,
      Hours: item.hours,
      Remark: item.remark || "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "timesheet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Timesheet Report", 14, 10);
    const rows = filtered.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.employee?.name,
      item.employee?.email,
      item.hours,
      item.remark || "",
    ]);
    autoTable(doc, {
      head: [["Date", "Name", "Email", "Hours", "Remark"]],
      body: rows,
    });
    doc.save("timesheet.pdf");
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="text-center mb-4 fw-bold">Admin Timesheet Panel</h4>

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "250px" }}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          <div className="d-flex align-items-center gap-2">
            <FaSearch />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary d-flex text-align-center" onClick={exportCSV}>
              <FaFileCsv className="me-2" />
              Export CSV
            </button>
            <button className="btn btn-success d-flex text-align-center" onClick={exportPDF}>
              <FaDownload className="me-2" />
              Export PDF
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
                <th>Hours</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((t, index) => (
                  <tr key={t._id}>
                    <td>{index + 1}</td>
                    <td>{t.employee?.name}</td>
                    <td>{t.employee?.email}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.hours}</td>
                    <td>{t.remark || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Timesheet;
