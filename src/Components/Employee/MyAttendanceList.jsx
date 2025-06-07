import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import { FcBusinessContact, FcExport } from "react-icons/fc";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const MyAttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [originalAttendance, setOriginalAttendance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      const employeeId = user?.id;

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/attendance/employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res);
        if (res.data.success) {
          const reversed = res.data.data.reverse();
          setAttendances(reversed);
          setOriginalAttendance(reversed);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error.message);
      }
    };

    fetchAttendance();
  }, []);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      return Swal.fire("Error", "Please select both dates", "warning");
    }

    const filtered = originalAttendance.filter((att) => {
      const attDate = new Date(att.date).toISOString().split("T")[0];
      return attDate >= fromDate && attDate <= toDate;
    });

    setAttendances(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance List", 14, 10);
    const tableData = attendances.map((attend, index) => [
      index + 1,
      attend.type || "GPS",
      new Date(attend.date).toLocaleDateString(),
      attend.inTime,
      attend.status,
    ]);
    autoTable(doc, {
      head: [["S No.", "Type", "Date", "Time", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [123, 123, 123],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        cellPadding: 3,
        font: "helvetica",
        fontSize: 11,
      },
    });
    doc.save("attendance.pdf");
  };

  const exportToCSV = () => {
    const csvData = attendances.map((attend, index) => ({
      S_No: index + 1,
      Type: attend.type || "GPS",
      Date: new Date(attend.date).toLocaleDateString(),
      Time: attend.inTime,
      Status: attend.status,
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

  return (
    <EmployeeLayout>
      <div className="container mt-5">
        <div className="row justify-content-between align-items-center mb-3 g-2">
          <div className="col-12 col-md-6">
            <h4 className="mb-0">🧾 My Attendance History</h4>
          </div>
          <div className="col-12 col-md-6 text-md-end text-start">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <button
                className="btn btn-secondary d-flex align-items-center"
                onClick={exportToPDF}
              >
                <FcExport className="me-1" /> Export PDF
              </button>
              <button
                className="btn btn-secondary d-flex align-items-center"
                onClick={exportToCSV}
              >
                <FcExport className="me-1" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <div className="row mb-4 g-2">
          <div className="col-12 col-md-5">
            <label>From Date:</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-5">
            <label>To Date:</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-2 d-grid align-items-end">
            <button className="btn btn-secondary" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>S No.</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length > 0 ? (
                attendances.map((att, index) => (
                  <tr key={att._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(att.date).toLocaleDateString()}</td>
                    <td>{att.inTime}</td>
                    <td>{att.type || "GPS"}</td>
                    <td>
                      <span
                        className={`badge ${
                          att.status === "Present"
                            ? "bg-success"
                            : att.status === "Late"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default MyAttendanceList;
