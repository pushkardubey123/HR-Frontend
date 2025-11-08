import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaCheckCircle, FaCalendarAlt, FaUserCheck, FaSearch } from "react-icons/fa";

const BulkAttendancePanel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedEmployees, setMarkedEmployees] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmp, setFilterEmp] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEmployees(res.data.data);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch employees", "error");
      }
    };
    fetchEmployees();
  }, []);
const handleSubmit = async () => {
  if (!selectedDate || selectedEmployees.length === 0) {
    return Swal.fire("Error", "Select date and at least one employee", "error");
  }

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/bulk`,
      { employeeIds: selectedEmployees, date: selectedDate },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    Swal.fire("✅ Success", res.data.message, "success");
    setMarkedEmployees(res.data.data);
    console.log("📦 Bulk mark success:", res.data);
  } catch (err) {
    console.error("Bulk mark error:", err.response?.data || err);
    Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
  }
};

  const applyFilter = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, {
        params: {
          date: filterDate,
          employeeId: filterEmp,
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const all = Object.values(res.data.data).flat();
      setMarkedEmployees(all);
    } catch (err) {
      Swal.fire("Error", "Failed to filter attendance", "error");
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      <div className="container py-4">
        <h4 className="mb-3 d-flex align-items-center gap-2 text-primary">
          <FaCalendarAlt /> Bulk Mark Attendance
        </h4>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Select Date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="col-md-8">
            <label>Select Employees:</label>
            <div className="d-flex flex-wrap gap-1 text-align-center">
              {employees.map((emp) => (
                <button
                  key={emp._id}
                  className={`btn btn-sm rounded-pill d-flex text-align-center ${
                    selectedEmployees.includes(emp._id)
                      ? "btn-success"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => toggleEmployee(emp._id)}
                >
                  <FaUserCheck/>
                  {emp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary mb-4  d-flex text-align-center">
          <FaCheckCircle className="me-2" />
          Submit Attendance
        </button>

        <hr />
        <h5 className="d-flex align-items-center gap-2">
          <FaSearch /> Attendance Records
        </h5>
        <div className="row mb-3">
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-control"
              value={filterEmp}
              onChange={(e) => setFilterEmp(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button onClick={applyFilter} className="btn btn-dark mt-1">
              🔍 Filter
            </button>
          </div>
        </div>

        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {markedEmployees.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              markedEmployees.map((att, idx) => (
                <tr key={att._id}>
                  <td>{idx + 1}</td>
                  <td>{att.employeeId?.name || "-"}</td>
                  <td>{new Date(att.date).toLocaleDateString()}</td>
                  <td>{att.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default BulkAttendancePanel;
