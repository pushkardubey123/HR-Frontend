import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EmployeeLayout from "./EmployeeLayout";

const MySalarySlips = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserId(user?.id);
    const fetchPayrolls = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payrolls`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        const data = res.data.data.filter(
          (p) => p.employeeId?._id === user?.id
        );
        setPayrolls(data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch leaves", error.message);
      }
    };
    fetchPayrolls();
  }, []);

  const filtered = selectedMonth
    ? payrolls.filter((p) => p.month === selectedMonth)
    : payrolls;

  const exportPDF = (item) => {
    const doc = new jsPDF();
    doc.text("Salary Slip", 80, 10);
    autoTable(doc, {
      head: [["Field", "Details"]],
      body: [
        ["Employee", item.employeeId?.name],
        ["Email", item.employeeId?.email],
        ["Month", item.month],
        ["Basic Salary", `INR ${item.basicSalary}`],
        ["Net Salary", `INR ${item.netSalary}`],
        [
          "Allowances",
          item.allowances.map((a) => `${a.title}: INR ${a.amount}`).join(", "),
        ],
        [
          "Deductions",
          item.deductions.map((d) => `${d.title}: INR ${d.amount}`).join(", "),
        ],
      ],
    });
    doc.save(`SalarySlip-${item.month}.pdf`);
  };

  return (
    <EmployeeLayout>
      <div className="container mt-4">
        <h4 className="text-center mb-4">📄 My Salary Slips</h4>

        <div className="mb-3 text-center">
          <label>Select Month: </label>
          <select
            className="form-select w-auto d-inline-block ms-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">All</option>
            {[...new Set(payrolls.map((p) => p.month))].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>S No.</th>
              <th>Month</th>
              <th>Basic</th>
              <th>Net</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.month}</td>
                  <td>INR {item.basicSalary}</td>
                  <td>INR {item.netSalary}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => exportPDF(item)}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No salary slips found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </EmployeeLayout>
  );
};

export default MySalarySlips;
