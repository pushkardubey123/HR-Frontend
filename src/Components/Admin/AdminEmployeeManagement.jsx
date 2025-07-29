import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaEdit, FaTrash, FaUserPlus, FaEye } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import Loader from "./Loader/Loader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  phone: yup.string().required("Phone is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("DOB is required"),
  address: yup.string().required("Address is required"),
  departmentId: yup.string().required("Department is required"),
  designationId: yup.string().required("Designation is required"),
  shiftId: yup.string().required("Shift is required"),
  pan: yup.string().required("PAN is required"),
bankAccount: yup.string().required("Bank A/C is required"),
  doj: yup.string().required("DOJ is required"),
  password: yup.string().when("isEdit", {
    is: false,
    then: yup.string().required("Password is required"),
  }),
});

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);



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

const {
  register,
  handleSubmit,
  reset,
  setValue,
  watch,
  formState: { errors },
} = useForm({
    resolver: yupResolver(schema),
  });
    const selectedDepartmentId = watch("departmentId");
const filteredDesignations = selectedDepartmentId
  ? designations.filter((d) => d.departmentId?._id === selectedDepartmentId)
  : [];
  const onSubmit = async (data) => {
    const formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "emergencyContact") {
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value);
      }
    });
    if (profilePic) formDataToSend.append("profilePic", profilePic);

    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/employeeget/${editId}`, data, getHeaders());
        Swal.fire("Updated", "Employee updated successfully", "success");
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, formDataToSend, getHeaders());
        Swal.fire(res.data.success ? "Success" : "Error", res.data.message, res.data.success ? "success" : "error");
      }
      fetchData();
      setShowModal(false);
      reset();
      setProfilePic(null);
      setEditId(null);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp._id);
    Object.entries(emp).forEach(([key, value]) => setValue(key, value));
    setValue("password", "");
    setShowModal(true);
  };

  const handleViewDetails = (emp) => {
    const profileUrl = emp.profilePic ? `${import.meta.env.VITE_API_URL}/static/${emp.profilePic}` : null;
    Swal.fire({
      title: `<h3>${emp.name}</h3>`,
      html: `
        <div style="text-align:left; max-height:500px; overflow-y:auto">
          ${profileUrl ? `<img src='${profileUrl}' alt='profile' style='height:120px;width:120px;border-radius:8px;object-fit:cover;margin:0 auto 10px;display:block'/>` : ''}
          <table class='table table-bordered'>
            <tr><td><b>Email</b></td><td>${emp.email}</td></tr>
            <tr><td><b>Phone</b></td><td>${emp.phone || 'N/A'}</td></tr>
            <tr><td><b>Gender</b></td><td>${emp.gender || 'N/A'}</td></tr>
            <tr><td><b>Date of Birth</b></td><td>${emp.dob?.substring(0,10) || 'N/A'}</td></tr>
            <tr><td><b>Department</b></td><td>${emp.departmentId?.name || 'N/A'}</td></tr>
            <tr><td><b>Designation</b></td><td>${emp.designationId?.name || 'N/A'}</td></tr>
            <tr><td><b>Shift</b></td><td>${emp.shiftId?.name || 'N/A'}</td></tr>
            <tr><td><b>Joining Date</b></td><td>${emp.doj?.substring(0,10) || 'N/A'}</td></tr>
            <tr><td><b>Address</b></td><td>${emp.address || 'N/A'}</td></tr>
            <tr><td><b>Emergency Contact</b></td><td>${emp.emergencyContact?.name || '-'} (${emp.emergencyContact?.relation || '-'}) - ${emp.emergencyContact?.phone || '-'}</td></tr>
          </table>
        </div>`,
      width: "700px",
      showCloseButton: true,
      confirmButtonText: "Close",
    });
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
      <div className="employee-container px-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h4 className="section-heading d-flex align-items-center gap-2"><FaUserPlus /> Employee Management</h4>
          <button className="btn btn-success" onClick={() => { reset(); setEditId(null); setShowModal(true); }}>+ Add Employee</button>
        </div>

        <div className="table-responsive custom-table-wrapper">
          {loading ? <Loader /> : (
            <table className="table table-bordered text-center">
              <thead className="table-light">
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
                      <td className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleViewDetails(emp)}><FaEye /></button>
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
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            <div><input {...register("name")} className="form-control" placeholder="Name" /><p className="text-danger small">{errors.name?.message}</p></div>
            <div><input {...register("email")} type="email" className="form-control" placeholder="Email" /><p className="text-danger small">{errors.email?.message}</p></div>
            <div><input {...register("phone")} className="form-control" placeholder="Phone" /><p className="text-danger small">{errors.phone?.message}</p></div>
            <div><input {...register("pan")} className="form-control" placeholder="PAN Number" /><p className="text-danger small">{errors.pan?.message}</p></div>
<div><input {...register("bankAccount")} className="form-control" placeholder="Bank A/C Number" /><p className="text-danger small">{errors.bankAccount?.message}</p></div>

            <div>
              <select {...register("gender")} className="form-select">
                <option value="">Select Gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-danger small">{errors.gender?.message}</p>
            </div>
            <div><input {...register("dob")} type="date" className="form-control" placeholder="DOB" /><p className="text-danger small">{errors.dob?.message}</p></div>
            <div><input {...register("address")} className="form-control" placeholder="Address" /><p className="text-danger small">{errors.address?.message}</p></div>
            <div>
              <select {...register("departmentId")} className="form-select">
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <p className="text-danger small">{errors.departmentId?.message}</p>
            </div>
            <div>
              <select {...register("designationId")} className="form-select">
  <option value="">Select Designation</option>
  {filteredDesignations.map((d) => (
    <option key={d._id} value={d._id}>{d.name}</option>
  ))}
</select>
              <p className="text-danger small">{errors.designationId?.message}</p>
            </div>
            <div>
              <select {...register("shiftId")} className="form-select">
                <option value="">Select Shift</option>
                {shifts.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <p className="text-danger small">{errors.shiftId?.message}</p>
            </div>
            <div><input {...register("doj")} type="date" className="form-control" placeholder="Joining Date" /><p className="text-danger small">{errors.doj?.message}</p></div>
            {!editId && (
              <div><input {...register("password")} type="password" className="form-control" placeholder="Password" /><p className="text-danger small">{errors.password?.message}</p></div>
            )}
            <div><input type="file" className="form-control" onChange={(e) => setProfilePic(e.target.files[0])} /></div>
            <div><input {...register("emergencyContact.name")} className="form-control" placeholder="Emergency Contact Name" /></div>
            <div><input {...register("emergencyContact.phone")} className="form-control" placeholder="Emergency Contact Phone" /></div>
            <div><input {...register("emergencyContact.relation")} className="form-control" placeholder="Relation" /></div>
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
