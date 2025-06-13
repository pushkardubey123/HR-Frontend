import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "./EmployeeManagement.css";
import Loader from "./Loader/Loader";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "employee", phone: "",
    gender: "", dob: "", address: "", departmentId: "", designationId: "",
    shiftId: "", doj: "", emergencyContact: { name: "", phone: "", relation: "" },
    profilePic: null,
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchData = async () => {
    try {
      const [empRes, deptRes, desigRes, shiftRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/user`, getHeaders()),
        axios.get(`${import.meta.env.VITE_API_URL}/api/departments`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/designations`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`),
      ]);
      setEmployees(empRes.data.data.reverse());
      setDepartments(deptRes.data.data);
      setDesignations(desigRes.data.data);
      setShifts(shiftRes.data.data);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith("emergency")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [key]: value },
      }));
    } else if (name === "profilePic") {
      setFormData((prev) => ({ ...prev, profilePic: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", password: "", role: "employee", phone: "", gender: "",
      dob: "", address: "", departmentId: "", designationId: "", shiftId: "",
      doj: "", emergencyContact: { name: "", phone: "", relation: "" }, profilePic: null,
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      if (key === "emergencyContact") {
        data.append("emergencyContact", JSON.stringify(formData.emergencyContact));
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/employeeget/${editId}`, formData, getHeaders());
        Swal.fire("Updated", "Employee updated successfully", "success");
      } else {
        const posting = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, data, getHeaders());
        if (posting.data.success) {
          Swal.fire("Success", posting.data.message, "success");
        } else {
          Swal.fire("Error", posting.data.message, "error");
        }
      }
      fetchData();
      resetForm();
      setShowModal(false);
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp._id);
    setFormData({
      ...emp,
      password: "",
      profilePic: null,
      emergencyContact: emp.emergencyContact || { name: "", phone: "", relation: "" },
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the employee permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/employeedelete/${id}`, getHeaders());
      fetchData();
      Swal.fire("Deleted", "Employee deleted successfully", "success");
    }
  };

  return (
    <AdminLayout>
      <div className="employee-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="section-heading"><FaUserPlus /> Employee Management</h4>
          <button className="btn add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Employee
          </button>
        </div>

        <div className="custom-table-wrapper">
          {loading ? (
            <Loader />
          ) : (
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Shift</th>
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
                      <td>{emp.departmentId?.name || "N/A"}</td>
                      <td>{emp.designationId?.name || "N/A"}</td>
                      <td>{emp.shiftId?.name || "N/A"}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => handleEdit(emp)}><FaEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(emp._id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7">No employees found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-2">
            {[["name", "Name"], ["email", "Email"], ["phone", "Phone"],
              ["gender", "Gender", "select"], ["dob", "Date of Birth", "date"],
              ["address", "Address"], ["departmentId", "Department", "select", departments],
              ["designationId", "Designation", "select", designations],
              ["shiftId", "Shift", "select", shifts],
              ["doj", "Joining Date", "date"]
            ].map(([name, placeholder, type = "text", list]) => (
              <div className="col-md-4" key={name}>
                {type === "select" ? (
                  <select name={name} className="form-select" value={formData[name]} onChange={handleChange}>
                    <option value="">Select {placeholder}</option>
                    {list?.map((item) => (
                      <option value={item._id} key={item._id}>{item.name}</option>
                    ))}
                  </select>
                ) : (
                  <input type={type} name={name} className="form-control" value={formData[name]} onChange={handleChange} placeholder={placeholder} />
                )}
              </div>
            ))}
            {!editId && (
              <div className="col-md-4">
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Password" />
              </div>
            )}
            <div className="col-md-4"><input type="file" className="form-control" name="profilePic" onChange={handleChange} /></div>
            <div className="col-md-4"><input className="form-control" name="emergency.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Emergency Contact Name" /></div>
            <div className="col-md-4"><input className="form-control" name="emergency.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="Emergency Contact Phone" /></div>
            <div className="col-md-4"><input className="form-control" name="emergency.relation" value={formData.emergencyContact.relation} onChange={handleChange} placeholder="Relation" /></div>
            <div className="col-12 text-end mt-3">
              <Button type="submit" variant="primary">{editId ? "Update" : "Add"} Employee</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default EmployeeManagement;
