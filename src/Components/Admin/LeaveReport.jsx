import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Admin/AdminLayout";
import { FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './LeaveReport.css';
import { FcLeave } from "react-icons/fc";

const LeaveReport = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [month, setMonth] = useState("2025-07");
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("Monthly");
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [month, year, filterType, leaves]);

  const applyFilter = () => {
    let data = [...leaves];
    if (filterType === "Monthly") {
      data = data.filter(leave => new Date(leave.startDate).toISOString().slice(0, 7) === month);
    } else {
      data = data.filter(leave => new Date(leave.startDate).getFullYear() === Number(year));
    }
    setFilteredLeaves(data);
  };

  const approved = filteredLeaves.filter(l => l.status === "Approved").length;
  const rejected = filteredLeaves.filter(l => l.status === "Rejected").length;
  const pending = filteredLeaves.filter(l => l.status === "Pending").length;

  const exportToExcel = () => {
    const data = filteredLeaves.map(l => ({
      "Employee ID": l.employeeId?._id || "-",
      "Employee": l.employeeId?.name || "-",
      "Leave Type": l.leaveType,
      "Start Date": new Date(l.startDate).toLocaleDateString(),
      "End Date": new Date(l.endDate).toLocaleDateString(),
      "Status": l.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
    XLSX.writeFile(wb, `Leave_Report_${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Leave Report", 14, 20);

    const rows = filteredLeaves.map(l => [
      l.employeeId?._id || "-",
      l.employeeId?.name || "-",
      l.leaveType,
      new Date(l.startDate).toLocaleDateString(),
      new Date(l.endDate).toLocaleDateString(),
      l.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Employee ID", "Employee", "Leave Type", "Start Date", "End Date", "Status"]],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 }
    });

    doc.save(`Leave_Report_${Date.now()}.pdf`);
  };

  return (
    <AdminLayout>
      <div className="leave-report-container">
        <h3 className="leave-report-header d-flex text-align-center"><FcLeave className="mt-1 me-1"  />Leave Report</h3>

        <div className="leave-filters mt-3">
          <div>
            <label>Type</label><br />
            <input type="radio" checked={filterType === "Monthly"} onChange={() => setFilterType("Monthly")} /> Monthly
            <input type="radio" className="ms-3" checked={filterType === "Yearly"} onChange={() => setFilterType("Yearly")} /> Yearly
          </div>

          {filterType === "Monthly" ? (
            <div>
              <label>Month</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="form-control" />
            </div>
          ) : (
            <div>
              <label>Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="form-control" />
            </div>
          )}

          <div className="ms-auto d-flex align-items-end gap-2">
            <button className="export-btn d-flex text-align-center bg-dark" onClick={exportToPDF}><FaFilePdf className="mt-1 me-1" />Export PDF</button>
            <button className="export-btn d-flex text-align-center bg-secondary" onClick={exportToExcel}><FaFileExcel className="mt-1 me-1" />Export Excel</button>
          </div>
        </div>

        <div className="row g-3 my-4">
          <div className="col-md-3">
            <div className="summary-card">
              <FaFileAlt size={30} />
              <h5>Report</h5>
              <p className="text-muted">Leave Summary</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card">
              <MdDateRange size={30} />
              <h5>Duration</h5>
              <p className="text-muted">{filterType === "Monthly" ? month : year}</p>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card approved">
              <FaCheckCircle size={25} />
              <h5>Approved</h5>
              <p className="count">{approved}</p>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card rejected">
              <FaTimesCircle size={25} />
              <h5>Rejected</h5>
              <p className="count">{rejected}</p>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card pending">
              <FaClock size={25} />
              <h5>Pending</h5>
              <p className="count">{pending}</p>
            </div>
          </div>
        </div>

        <div className="leave-table table-responsive">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Employee ID</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No entries found</td>
                </tr>
              ) : (
                filteredLeaves.map((leave, index) => (
                  <tr key={index}>
                    <td>{leave.employeeId?._id || "-"}</td>
                    <td>{leave.employeeId?.name || "-"}</td>
                    <td>{leave.leaveType}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>{leave.status}</td>
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

export default LeaveReport;
