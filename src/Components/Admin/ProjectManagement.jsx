import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProjects } from "../Redux/Slices/projectSlice";
import TaskModal from "./TaskModal";
import { AiOutlinePlus, AiFillEdit, AiFillDelete } from "react-icons/ai";
import {
  BsClipboardCheck,
  BsFolderFill,
  BsCalendarEvent,
} from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader/Loader";

const ProjectManagement = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state?.project?.list);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const token = user?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/projects");
      dispatch(setProjects(res.data.data));
    } catch {
      Swal.fire("Error", "Unable to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingProject) {
        await axiosInstance.put(`/api/projects/${editingProject._id}`, data);
        Swal.fire("Updated", "Project updated successfully", "success");
      } else {
        await axiosInstance.post("/api/projects/projects", data);
        Swal.fire("Created", "Project created successfully", "success");
      }
      setShowModal(false);
      reset();
      fetchProjects();
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Project?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/projects/${id}`);
        Swal.fire("Deleted", "Project deleted successfully", "success");
        fetchProjects();
      } catch {
        Swal.fire("Error", "Failed to delete project", "error");
      }
    }
  };

  const openAdd = () => {
    setEditingProject(null);
    reset();
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description,
      startDate: project.startDate?.substring(0, 10),
      endDate: project.endDate?.substring(0, 10),
      status: project.status,
    });
    setShowModal(true);
  };

  const openTaskModal = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  const filteredProjects = projects
    .filter((proj) =>
      proj.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((proj) =>
      filterStatus === "all" ? true : proj.status === filterStatus
    );

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
          <h4 className="text-primary d-flex align-items-center gap-2 fw-bold">
            <BsFolderFill /> Project Management
          </h4>
          {role === "admin" && (
            <Button
              variant="success"
              onClick={openAdd}
              className="d-flex align-items-center gap-2"
            >
              <AiOutlinePlus /> Add Project
            </Button>
          )}
        </div>

        <Row className="mb-3 g-2">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="🔍 Search a project"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={6}>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Filter by status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Col>
        </Row>

        {loading ? (
          <Loader />
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover className="shadow-sm">
              <thead className="table-dark text-center">
                <tr>
                  <th>#</th>
                  <th> Name</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {filteredProjects.map((proj, i) => (
                  <tr key={proj._id}>
                    <td>{i + 1}</td>
                    <td className="fw-semibold text-primary">{proj.name}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          proj.status === "completed"
                            ? "success"
                            : proj.status === "in-progress"
                            ? "warning"
                            : "secondary"
                        }`}
                      >
                        {proj.status}
                      </span>
                    </td>
                    <td>{proj.startDate?.substring(0, 10)}</td>
                    <td>{proj.endDate?.substring(0, 10)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Button
                          className="d-flex align-items-center"
                          size="sm"
                          variant="info"
                          onClick={() => openTaskModal(proj)}
                        >
                          <BsClipboardCheck /> Tasks
                        </Button>
                        {role === "admin" && (
                          <>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => openEdit(proj)}
                            >
                              <AiFillEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(proj._id)}
                            >
                              <AiFillDelete />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProject ? "Edit Project" : "Add Project"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit(handleSave)}>
            <Modal.Body>
              <Form.Group className="mb-2">
                <Form.Label className="d-flex align-items-center">
                  <BsFolderFill className="me-2" /> Name
                </Form.Label>
                <Form.Control {...register("name")} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control {...register("description")} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FaRegCalendarAlt /> Start Date
                </Form.Label>
                <Form.Control type="date" {...register("startDate")} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="d-flex align-items-center gap-2">
                  <BsCalendarEvent /> End Date
                </Form.Label>
                <Form.Control type="date" {...register("endDate")} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="d-flex align-items-center gap-2">
                  <BsClipboardCheck /> Status
                </Form.Label>
                <Form.Select {...register("status")} required>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingProject ? "Update" : "Create"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {selectedProject && (
          <TaskModal
            show={showTaskModal}
            handleClose={() => setShowTaskModal(false)}
            project={selectedProject}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectManagement;
