import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { FcApproval } from "react-icons/fc";
import { Button, Form, Table, Card, Container } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader/Loader"; // 🌀 Reusable dot-style loader

// ✅ Yup validation schema
const schema = yup.object().shape({
  name: yup.string().required("Designation name is required"),
  departmentId: yup.string().required("Department is required"),
});

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/designations`);
      if (res.data.success) setDesignations(res.data.data);
    } catch (err) {
      Swal.fire("Error", "Error fetching designations:",err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/departments`);
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
            Swal.fire("Error", "No fetching departments",err);
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
          { headers: { Authorization: getToken() } }
        );
        if (res.data.success) {
          Swal.fire("Updated!", res.data.message, "success");
          setEditId(null);
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/designations`,
          data,
          { headers: { Authorization: getToken() } }
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/designations/${id}`, {
          headers: { Authorization: getToken() },
        });
        fetchDesignations();
        Swal.fire("Deleted!", "Designation has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <h3 className="text-center mb-4 d-flex justify-content-center align-items-center gap-2 text-success">
              <FcApproval />
              Designation Management
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
              <div className="row">
                <div className="col-md-5">
                  <Form.Control
                    placeholder="Designation Name"
                    {...register("name")}
                    className="mb-2"
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name.message}</small>
                  )}
                </div>
                <div className="col-md-5">
                  <Form.Select {...register("departmentId")} className="mb-2">
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.departmentId && (
                    <small className="text-danger">{errors.departmentId.message}</small>
                  )}
                </div>
                <div className="col-md-2 d-grid">
                  <Button type="submit" variant={editId ? "secondary" : "dark"}>
                    {editId ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </form>

            {loading ? (
              <div className="text-center my-5">
                <Loader />
              </div>
            ) : designations.length === 0 ? (
              <p className="text-center text-muted fs-5">No designations found.</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover responsive className="align-middle text-center shadow-sm">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Designation</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designations.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.departmentId?.name || "N/A"}</td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                          >
                            <FaTrash />
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

export default DesignationManagement;
