import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [editId, setEditId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const getTokenHeader = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchShifts = async () => {
    try {
      const res = await axios.get("http://localhost:3003/api/shifts");
      if (res.data.success) setShifts(res.data.data);
    } catch (err) {
      console.error("Fetch Shifts Error:", err.message);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const res = await axios.put(
          `http://localhost:3003/api/shifts/${editId}`,
          data,
          getTokenHeader()
        );
        if (res.data.success) {
          Swal.fire("Updated", res.data.message, "success");
        }
      } else {
        const res = await axios.post(
          "http://localhost:3003/api/shifts",
          data,
          getTokenHeader()
        );
        if (res.data.success) {
          Swal.fire("Success", res.data.message, "success");
        }
      }
      fetchShifts();
      reset();
      setEditId(null);
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setValue("name", item.name);
    setValue("startTime", item.startTime);
    setValue("endTime", item.endTime);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Shift?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    });
    if (confirm.isConfirmed) {
      await axios.delete(`http://localhost:3003/api/shifts/${id}`, getTokenHeader());
      Swal.fire("Deleted!", "Shift has been deleted.", "success");
      fetchShifts();
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h3 className="text-center">Shift Management</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="row g-2 mb-4">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Shift Name"
              {...register("name", { required: true })}
            />
            {errors.name && <small className="text-danger">Name is required</small>}
          </div>

          <div className="col-md-3">
            <input
              type="time"
              className="form-control"
              {...register("startTime", { required: true })}
            />
            {errors.startTime && <small className="text-danger">Start time is required</small>}
          </div>

          <div className="col-md-3">
            <input
              type="time"
              className="form-control"
              {...register("endTime", { required: true })}
            />
            {errors.endTime && <small className="text-danger">End time is required</small>}
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn btn-dark w-100">
              {editId ? "Update" : "Add"}
            </button>
          </div>
        </form>

        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Shift Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => (
              <tr key={shift._id}>
                <td>{index + 1}</td>
                <td>{shift.name}</td>
                <td>{shift.startTime}</td>
                <td>{shift.endTime}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(shift)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(shift._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ShiftManagement;
