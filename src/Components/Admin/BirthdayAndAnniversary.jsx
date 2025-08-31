import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FaBirthdayCake, FaBriefcase, FaDownload, FaFilePdf } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./EmployeeDates.css";
import AdminLayout from "./AdminLayout"

const EmployeeReminders = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

    const token = JSON.parse(localStorage.getItem("user"))?.token;
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/employee-dates`,getHeaders()); 
      setEmployees(res.data.data);
    } catch (err) {
      console.error("Error fetching employee dates:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const isToday = (date) => {
    const today = moment();
    return today.isSame(moment(date), "day") && today.isSame(moment(date), "month");
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEmployees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EmployeeDates");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Employee_Dates.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "DOB", "DOJ"];
    const tableRows = [];

    filteredEmployees.forEach((emp) => {
      const row = [emp.name, moment(emp.dob).format("DD-MM-YYYY"), moment(emp.doj).format("DD-MM-YYYY")];
      tableRows.push(row);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Employee DOB/DOJ Report", 14, 15);
    doc.save("Employee_Dates.pdf");
  };

  return (<AdminLayout>
        <div className="container mt-5">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h3 className="mb-3 text-center fw-bold">
            🎉 Employee DOB & DOJ Reminders
          </h3>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="🔍 Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />

            <div className="d-flex gap-2">
              <button className="d-flex text-align-center btn btn-success" onClick={exportToExcel}>
                <FaDownload className="me-1" /> Excel
              </button>
              <button className=" d-flex text-align-center btn btn-danger" onClick={exportToPDF}>
                <FaFilePdf className="me-1" /> PDF
              </button>
            </div>
          </div>

          <div className="table-responsive rounded">
            <table className="table table-hover align-middle table-bordered">
              <thead className="table-light text-center">
                <tr>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>DOJ</th>
                  <th>Today</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{emp.name}</td>
                      <td>
                        {moment(emp.dob).format("DD-MM-YYYY")}{" "}
                        {isToday(emp.dob) && (
                          <span className="badge bg-warning ms-1">
                            <FaBirthdayCake className="me-1" />
                            Birthday
                          </span>
                        )}
                      </td>
                      <td>
                        {moment(emp.doj).format("DD-MM-YYYY")}{" "}
                        {isToday(emp.doj) && (
                          <span className="badge bg-info ms-1 text-dark">
                            <FaBriefcase className="me-1" />
                            Work Anniversary
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {isToday(emp.dob) || isToday(emp.doj) ? "🎉" : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
  );
};

export default EmployeeReminders;
