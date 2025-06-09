import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";

const AdminEmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3003/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this employee!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3003/employeedelete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchEmployees();
        Swal.fire("Deleted!", "Employee deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete employee.", "error");
      }
    }
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3003/employeeget/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const user = res.data.data;
        Swal.fire({
          title: `${user.name}'s Details`,
          html: `
            <strong>Email:</strong> ${user.email}<br/>
            <strong>Phone:</strong> ${user.phone || "-"}<br/>
            <strong>Department:</strong> ${user.departmentId?.name || "-"}<br/>
            <strong>Designation:</strong> ${user.designationId?.name || "-"}<br/>
            <strong>Status:</strong> ${user.status}<br/>
            <strong>Shift:</strong> ${user.shiftId?.name || "-"}
          `,
          imageUrl: user.profilePic ? `http://localhost:3003/uploads/${user.profilePic}` : null,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Profile Pic",
        });
      }
    } catch (err) {
      console.error("View error:", err);
      Swal.fire("Error", "Could not load employee details.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="text-center">👥 Employee Management</h4>

        <table className="table table-bordered text-center mt-3">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp, i) => (
                <tr key={emp._id}>
                  <td>{i + 1}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.role}</td>
                  <td>
                    <span className={`badge bg-${emp.status === "active" ? "success" : "secondary"}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-info btn-sm me-2" onClick={() => handleView(emp._id)}>
                      <FaEye />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No employee data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeeManagement;
