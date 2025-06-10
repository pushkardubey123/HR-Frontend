import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { FcApproval } from "react-icons/fc";
import AdminLayout from "./AdminLayout";

// ✅ Yup validation
const schema = yup.object().shape({
  name: yup.string().required("Designation name is required"),
  departmentId: yup.string().required("Department is required"),
});

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const getToken = () =>
    `Bearer ${JSON.parse(localStorage.getItem("user"))?.token || ""}`;

  const fetchDesignations = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/designations`
      );
      console.log(res);
      if (res.data.success) setDesignations(res.data.data);
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/departments`
      );
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/designations/${editId}`,
          data,
          {
            headers: { Authorization: getToken() },
          }
        );
        if (res.data.success) {
          Swal.fire("Updated!", res.data.message, "success");
          setEditId(null);
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/designations`,
          data,
          {
            headers: { Authorization: getToken() },
          }
        );
        if (res.data.success) {
          Swal.fire("Success", res.data.message, "success");
        } else {
          Swal.fire("Error", res.data.message, "error");
        }
      }
      reset();
      fetchDesignations();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (item) => {
    setValue("name", item.name);
    setValue("departmentId", item.departmentId?._id);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/designations/${id}`,
          {
            headers: { Authorization: getToken() },
          }
        );
        fetchDesignations();
        Swal.fire("Deleted!", "Designation has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h3 className="text-center mb-4 d-flex justify-content-center align-items-center gap-2">
          <FcApproval />
          Designation Management
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                placeholder="Enter Designation Name"
                {...register("name")}
              />
              <div className="invalid-feedback">{errors.name?.message}</div>
            </div>

            <div className="col-md-4">
              <select
                className={`form-select ${
                  errors.departmentId ? "is-invalid" : ""
                }`}
                {...register("departmentId")}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">
                {errors.departmentId?.message}
              </div>
            </div>

            <div className="col-md-2">
              <button type="submit" className="btn btn-dark w-100">
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </form>

        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>S No</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {designations.length > 0 ? (
              designations.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.departmentId?.name || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No designations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default DesignationManagement;
