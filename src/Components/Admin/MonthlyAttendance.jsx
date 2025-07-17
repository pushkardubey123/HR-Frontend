// MonthlyAttendance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Admin/AdminLayout";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Button, Form } from "react-bootstrap";
import { BiSolidCalendar } from "react-icons/bi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const MonthlyAttendance = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const daysInMonth = new Date(month.split("-")[0], month.split("-")[1], 0).getDate();

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/monthly?month=${month}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAttendanceData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch monthly attendance:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(res.data.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [month]);

  const getEmployeeList = () => {
    const employees = {};
    Object.values(attendanceData).flat().forEach((record) => {
      const emp = record.employeeId;
      if (!emp || (selectedEmployee && selectedEmployee !== emp._id)) return;

      if (!employees[emp._id]) {
        employees[emp._id] = {
          name: emp.name,
          attendance: {},
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      const day = new Date(record.date).getDate();
      const status = record.status || "-";
      employees[emp._id].attendance[day] = status[0];
      if (status === "Present") employees[emp._id].present += 1;
      if (status === "Absent") employees[emp._id].absent += 1;
      if (status === "Late") employees[emp._id].late += 1;
    });
    return Object.values(employees);
  };

  const employeeList = getEmployeeList();

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text(`Monthly Attendance - ${month}`, 14, 15);

    const columns = ["Employee", ...Array.from({ length: daysInMonth }, (_, i) => i + 1), "Present", "Absent", "Late"];
    const rows = employeeList.map(emp => {
      const row = [emp.name];
      for (let i = 1; i <= daysInMonth; i++) {
        row.push(emp.attendance[i] || "-");
      }
      row.push(emp.present, emp.absent, emp.late);
      return row;
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save(`Attendance_${month}.pdf`);
  };

  const exportToExcel = () => {
    const columns = ["Employee", ...Array.from({ length: daysInMonth }, (_, i) => i + 1), "P", "A", "L"];
    const data = employeeList.map(emp => {
      const row = [emp.name];
      for (let i = 1; i <= daysInMonth; i++) {
        row.push(emp.attendance[i] || "-");
      }
      row.push(emp.present, emp.absent, emp.late);
      return row;
    });
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${month}.xlsx`);
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="mb-3 d-flex text-align-center"><BiSolidCalendar className="mt-1 me-1" />Monthly Attendance - {month}</h2>

        <div className="d-flex flex-wrap gap-3 mb-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-control w-auto"
          />
          <Form.Select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="form-control w-auto"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </Form.Select>
          <Button className="d-flex text-align-center" variant="dark" onClick={exportToExcel}><FaFileExcel />Export Excel</Button>
          <Button className="d-flex text-align-center " variant="secondary" onClick={exportToPDF}><FaFilePdf />Export PDF
</Button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                {[...Array(daysInMonth)].map((_, idx) => (
                  <th key={idx}>{idx + 1}</th>
                ))}
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
              </tr>
            </thead>
            <tbody>
              {employeeList.map((emp, index) => (
                <tr key={index}>
                  <td>{emp.name}</td>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <td key={i}>{emp.attendance[i + 1] || "-"}</td>
                  ))}
                  <td><strong>{emp.present}</strong></td>
                  <td><strong>{emp.absent}</strong></td>
                  <td><strong>{emp.late}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MonthlyAttendance;
