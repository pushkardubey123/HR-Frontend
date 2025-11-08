import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, Table, Card, Container } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { FaBusinessTime } from "react-icons/fa";
import Loader from "./Loader/Loader";

const schema = yup.object().shape({
  name: yup.string().required("Shift name is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
});

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const getTokenHeader = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

const fetchShifts = async () => {
  setLoading(true);
  try {
    const config = token ? getTokenHeader() : {};
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`, config);
    if (res.data.success) setShifts(res.data.data);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchShifts();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/shifts/${editId}`,
          data,
          getTokenHeader()
        );
        if (res.data.success) {
          Swal.fire("Updated!", res.data.message, "success");
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/shifts`,
          data,
          getTokenHeader()
        );
        if (res.data.success) {
          Swal.fire("Created!", res.data.message, "success");
        }
      }
      fetchShifts();
      reset();
      setEditId(null);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
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
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/shifts/${id}`,
          getTokenHeader()
        );
        Swal.fire("Deleted!", "Shift deleted successfully", "success");
        fetchShifts();
      } catch (err) {
        Swal.fire("Error", "Failed to delete shift", "error");
      }
    }
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <h3 className="text-center mb-4 d-flex justify-content-center align-items-center gap-2 text-dark">
              <FaBusinessTime />
              Shift Management
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
              <div className="row">
                <div className="col-md-4">
                  <Form.Control
                    placeholder="Shift Name"
                    {...register("name")}
                    className="mb-2"
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name.message}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <Form.Control
                    type="time"
                    {...register("startTime")}
                    className="mb-2"
                    placeholder="Start Time"
                  />
                  {errors.startTime && (
                    <small className="text-danger">
                      {errors.startTime.message}
                    </small>
                  )}
                </div>
                <div className="col-md-3">
                  <Form.Control
                    type="time"
                    {...register("endTime")}
                    className="mb-2"
                  />
                  {errors.endTime && (
                    <small className="text-danger">
                      {errors.endTime.message}
                    </small>
                  )}
                </div>
                <div className="col-md-2 d-grid">
                  <Button type="submit" variant={editId ? "secondary" : "dark"}>
                    {editId ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
              <hr />
            </form>
            {/* 🔄 Table Section */}
            {loading ? (
              <div className="text-center my-5">
                <Loader />
              </div>
            ) : shifts.length === 0 ? (
              <p className="text-center text-muted fs-5">No shifts available</p>
            ) : (
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  responsive
                  className="align-middle text-center shadow-sm"
                >
                  <thead className="table-primary">
                    <tr>
                      <th>S No.</th>
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
                          <Button
                            variant="secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(shift)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(shift._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default ShiftManagement;
