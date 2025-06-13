import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { Button, Form, Table, Card, Container } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { FcDepartment } from "react-icons/fc";
import Loader from "./Loader/Loader"; // Dot-style loader

const schema = yup.object().shape({
  name: yup.string().required("Department name is required"),
  description: yup.string().required("Description is required"),
});

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/departments`);
      setDepartments(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", "No fetching departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (location.state && location.state.name) {
      setValue("name", location.state.name);
      setValue("description", location.state.description);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data) => {
    try {
      if (id) {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/departments/${id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Updated!", res.data.message, "success");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/departments`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Created!", res.data.message, "success");
      }
      reset();
      navigate("/admin/department");
      fetchDepartments();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Action failed", "error");
    }
  };

  const handleDelete = async (deptId) => {
    const confirm = await Swal.fire({
      title: "Delete Department?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/departments/${deptId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Department removed successfully", "success");
        fetchDepartments();
      } catch (err) {
        Swal.fire("Error", "Failed to delete department", "error");
      }
    }
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <h3 className="text-center mb-4 d-flex justify-content-center align-items-center gap-2 text-primary">
              <FcDepartment />
              Department Management
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
              <div className="row">
                <div className="col-md-5">
                  <Form.Control
                    placeholder="Department Name"
                    {...register("name")}
                    className="mb-2"
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name.message}</small>
                  )}
                </div>
                <div className="col-md-5">
                  <Form.Control
                    placeholder="Description"
                    {...register("description")}
                    className="mb-2"
                  />
                  {errors.description && (
                    <small className="text-danger">{errors.description.message}</small>
                  )}
                </div>
                <div className="col-md-2 d-grid">
                  <Button type="submit" variant={id ? "secondary" : "dark"}>
                    {id ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </form>

            {/* 🔄 Table Section */}
            {loading ? (
              <div className="text-center my-5">
                <Loader />
              </div>
            ) : departments.length === 0 ? (
              <p className="text-center text-muted fs-5">No departments available</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover responsive className="align-middle text-center shadow-sm">
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Department Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept, index) => (
                      <tr key={dept._id}>
                        <td>{index + 1}</td>
                        <td>{dept.name}</td>
                        <td>{dept.description}</td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              navigate(`/admin/department/${dept._id}`, {
                                state: {
                                  name: dept.name,
                                  description: dept.description,
                                },
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(dept._id)}
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

export default Department;
