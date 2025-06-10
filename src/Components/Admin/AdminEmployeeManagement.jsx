import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    departmentId: "",
    designationId: "",
    shiftId: "",
    doj: "",
    emergencyContact: { name: "", phone: "", relation: "" },
    profilePic: null,
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchData = async () => {
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
      name: "",
      email: "",
      password: "",
      role: "employee",
      phone: "",
      gender: "",
      dob: "",
      address: "",
      departmentId: "",
      designationId: "",
      shiftId: "",
      doj: "",
      emergencyContact: { name: "", phone: "", relation: "" },
      profilePic: null,
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
        const posting = await axios.post("https://backend-hrms-k73a.onrender.com/user/register", data, getHeaders());
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
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaUserPlus /> Employee Management
          </h4>
          <button className="btn btn-dark" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Employee
          </button>
        </div>

        <table className="table table-bordered text-center">
          <thead className="table-dark">
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
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(emp)}><FaEdit /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-2">
            <div className="col-md-4">
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
            </div>
            {!editId && (
              <div className="col-md-4">
                <input className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Password" />
              </div>
            )}
            <div className="col-md-4">
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="col-md-4">
              <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
            </div>
            <div className="col-md-4">
              <select className="form-select" name="departmentId" value={formData.departmentId} onChange={handleChange}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option value={d._id} key={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" name="designationId" value={formData.designationId} onChange={handleChange}>
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option value={d._id} key={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" name="shiftId" value={formData.shiftId} onChange={handleChange}>
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option value={s._id} key={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="date" className="form-control" name="doj" value={formData.doj} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input type="file" className="form-control" name="profilePic" onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="emergency.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Emergency Contact Name" />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="emergency.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="Emergency Contact Phone" />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="emergency.relation" value={formData.emergencyContact.relation} onChange={handleChange} placeholder="Relation" />
            </div>
            <div className="col-12 text-end">
              <Button variant="primary" type="submit">{editId ? "Update" : "Add"} Employee</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default EmployeeManagement;
