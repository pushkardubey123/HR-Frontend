import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "../EmployeeLayout";
import { FaSearch, FaFileCsv, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const EmployeeTimesheet = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const employeeId = user?.id;

  const [timesheets, setTimesheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTimesheets = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/timesheet/employee/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res)
      if (res.data.success) {
        setTimesheets(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const filtered = timesheets.filter((item) =>
    new Date(item.date)
      .toLocaleDateString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const rows = filtered.map((item) => ({
      Date: new Date(item.date).toLocaleDateString(),
      Hours: item.hours,
      Remark: item.remark || "",
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "employee_timesheet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("My Timesheet Report", 14, 10);
    const rows = filtered.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.hours,
      item.remark || "",
    ]);
    autoTable(doc, {
      head: [["Date", "Hours", "Remark"]],
      body: rows,
    });
    doc.save("employee_timesheet.pdf");
  };

  return (
    <EmployeeLayout>
      <div className="container mt-4">
        <h4 className="text-center fw-bold mb-3">My Timesheet</h4>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <FaSearch />
            <input
              type="text"
              className="form-control"
              placeholder="Search by date (dd/mm/yyyy)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary d-flex text-align-center" onClick={exportCSV}>
              <FaFileCsv className="me-2" /> Export CSV
            </button>
            <button className="btn btn-success d-flex text-align-center" onClick={exportPDF}>
              <FaDownload className="me-2" /> Export PDF
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4">No timesheet entries found.</td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.hours}</td>
                    <td>{item.remark || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeTimesheet;
