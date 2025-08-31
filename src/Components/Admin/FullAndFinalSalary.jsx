import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaMoneyBillWave,
} from "react-icons/fa";

const FullAndFinalSalary = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payrolls`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayrolls(res.data.data.reverse());
    } catch (err) {
      console.error("Error fetching payrolls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUniqueDepartments = () => {
    const depts = payrolls
      .map((p) => p.employeeId?.departmentId?.name)
      .filter(Boolean);
    return ["All", ...new Set(depts)];
  };

  const getUniqueMonths = () => {
    const months = payrolls.map((p) => p.month).filter(Boolean);
    return ["All", ...new Set(months)];
  };

  const filteredPayrolls = payrolls.filter((p) => {
    const nameMatch = p.employeeId?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const deptMatch =
      selectedDept === "All" ||
      p.employeeId?.departmentId?.name === selectedDept;
    const monthMatch = selectedMonth === "All" || p.month === selectedMonth;
    return nameMatch && deptMatch && monthMatch;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Full and Final Salary Report", 14, 10);
    autoTable(doc, {
      head: [
        [
          "#",
          "Employee",
          "Department",
          "Month",
          "Basic",
          "Allowances",
          "Deductions",
          "Net",
        ],
      ],
      body: filteredPayrolls.map((p, i) => [
        i + 1,
        p.employeeId?.name,
        p.employeeId?.departmentId?.name || "-",
        p.month,
        `₹${p.basicSalary}`,
        p.allowances?.map((a) => `${a.title}: ₹${a.amount}`).join("\n") || "-",
        p.deductions?.map((d) => `${d.title}: ₹${d.amount}`).join("\n") || "-",
        `₹${p.netSalary}`,
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("full_and_final_salary.pdf");
  };

  const exportToExcel = () => {
    const excelData = filteredPayrolls.map((p, i) => ({
      S_No: i + 1,
      Employee: p.employeeId?.name,
      Department: p.employeeId?.departmentId?.name || "-",
      Month: p.month,
      Basic: p.basicSalary,
      Allowances:
        p.allowances?.map((a) => `${a.title}: ₹${a.amount}`).join(", ") || "-",
      Deductions:
        p.deductions?.map((d) => `${d.title}: ₹${d.amount}`).join(", ") || "-",
      Net: p.netSalary,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full & Final Salary");
    XLSX.writeFile(workbook, "full_and_final_salary.xlsx");
  };

  return (
    <AdminLayout>
      <div className="container py-4">
        <div className="bg-white shadow rounded-4 p-4">
          <div className="mb-4 text-center">
            <h2 className="fw-bold text-gradient d-flex text-align-center justify-center">
              <FaMoneyBillWave className="me-2 mt-1 text-success" />
              Full and Final Salary Report
            </h2>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {getUniqueDepartments().map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {getUniqueMonths().map((month, idx) => (
                  <option key={idx} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-outline-success me-2"
              onClick={exportToExcel}
            >
              <FaFileExcel />
            </button>
            <button className="btn btn-outline-primary" onClick={exportToPDF}>
              <FaFilePdf />
            </button>
          </div>

          <div className="table-responsive rounded">
            <table className="table table-hover text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-5">
                      <Loader />
                    </td>
                  </tr>
                ) : filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-muted py-3">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{p.employeeId?.name}</strong>
                      </td>
                      <td>{p.employeeId?.departmentId?.name || "-"}</td>
                      <td>{p.month}</td>
                      <td>₹{p.basicSalary}</td>
                      <td>
                        {p.allowances?.length > 0
                          ? p.allowances.map((a, idx) => (
                              <div key={idx} className="text-success small">
                                {a.title}: ₹{a.amount}
                              </div>
                            ))
                          : "-"}
                      </td>
                      <td>
                        {p.deductions?.length > 0
                          ? p.deductions.map((d, idx) => (
                              <div key={idx} className="text-danger small">
                                {d.title}: ₹{d.amount}
                              </div>
                            ))
                          : "-"}
                      </td>
                      <td className="fw-bold text-primary">₹{p.netSalary}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FullAndFinalSalary;
