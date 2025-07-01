import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Badge } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUserTag, FaTrash, FaClock, FaCommentDots, FaComments } from "react-icons/fa";

const TaskModal = ({ show, handleClose, project }) => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [commentMap, setCommentMap] = useState({});
  const [logMap, setLogMap] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const role = user?.role;
  const userId = user?.id;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const { register, handleSubmit, reset } = useForm();

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/user/");
      const filtered = res.data.data.filter((e) => e.role === "employee");
      setEmployees(filtered);
    } catch {
      Swal.fire("Error", "Failed to load employees", "error");
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/projects/${project._id}`);
      setTasks(res.data.data.tasks);
    } catch {
      Swal.fire("Error", "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project && show) {
      fetchTasks();
      fetchEmployees();
    }
  }, [project, show]);

  const handleEmployeeSelect = (e) => {
    const value = e.target.value;
    if (!selectedEmployees.some((emp) => emp._id === value)) {
      const selected = employees.find((emp) => emp._id === value);
      if (selected) setSelectedEmployees([...selectedEmployees, selected]);
    }
  };

  const removeEmployee = (id) => {
    setSelectedEmployees(selectedEmployees.filter((emp) => emp._id !== id));
  };

  const handleAddTask = async (data) => {
    try {
      const assignedToIds = selectedEmployees.map((emp) => emp._id);
      await axiosInstance.post(`/api/projects/${project._id}/tasks`, {
        ...data,
        assignedTo: assignedToIds.length === 1 ? assignedToIds[0] : assignedToIds,
      });
      Swal.fire("Success", "Task added", "success");
      reset();
      setSelectedEmployees([]);
      setShowAddForm(false);
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to add task", "error");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await axiosInstance.put(`/api/projects/${project._id}/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirm = await Swal.fire({
      title: "Delete this task?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/projects/${project._id}/tasks/${taskId}`);
        Swal.fire("Deleted", "Task removed", "success");
        fetchTasks();
      } catch {
        Swal.fire("Error", "Failed to delete task", "error");
      }
    }
  };

  const handleAddComment = async (taskId) => {
    const commentText = commentMap[taskId];
    if (!commentText) return;
    try {
      await axiosInstance.post(`/api/projects/${project._id}/tasks/${taskId}/comments`, {
        commentText,
        commentedBy: userId,
      });
      setCommentMap((prev) => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to add comment", "error");
    }
  };

  const handleAddTimeLog = async (taskId) => {
    const hours = logMap[taskId];
    if (!hours) return;
    try {
      await axiosInstance.post(`/api/projects/${project._id}/tasks/${taskId}/timelogs`, {
        employeeId: userId,
        hours,
      });
      setLogMap((prev) => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to log time", "error");
    }
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Tasks for: {project?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {role === "admin" && (
          <div className="mb-3 text-end">
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "Add Task"}
            </Button>
          </div>
        )}

        {showAddForm && (
          <Form onSubmit={handleSubmit(handleAddTask)} className="mb-4">
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control {...register("title")} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control {...register("description")} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Due Date</Form.Label>
              <Form.Control type="date" {...register("dueDate")} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Assign Employees</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {selectedEmployees.map((emp) => (
                  <Badge
                    key={emp._id}
                    bg="info"
                    className="d-flex align-items-center"
                    style={{ padding: "0.5em 0.75em" }}
                  >
                    {emp.name}
                    <FaTrash
                      size={14}
                      className="ms-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeEmployee(emp._id)}
                    />
                  </Badge>
                ))}
              </div>
              <Form.Select onChange={handleEmployeeSelect}>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option
                    key={emp._id}
                    value={emp._id}
                    disabled={selectedEmployees.some((e) => e._id === emp._id)}
                  >
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">Save Task</Button>
          </Form>
        )}

        {/* ✅ Stylish Task Table */}
        <Table bordered hover responsive size="sm" className="text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Assigned Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading...</td></tr>
            ) : (
              tasks.map((t, i) => (
                <React.Fragment key={t._id}>
                  <tr>
                    <td>{i + 1}</td>
                    <td>{t.title}</td>
                    <td>
                      <Badge bg={
                        t.status === "completed" ? "success" :
                        t.status === "in-progress" ? "warning" : "secondary"
                      }>
                        {t.status}
                      </Badge>
                    </td>
                    <td>{t.dueDate?.substring(0, 10)}</td>
                    <td>
                      {Array.isArray(t.assignedTo)
                        ? t.assignedTo.map((emp, idx) => (
                            <Badge key={idx} bg="light" text="dark" className="me-1">
                              <strong className="d-inline-flex align-items-center gap-1"><FaUserTag />
                              {emp?.name || "Unknown"}
</strong>
                            </Badge>
                          ))
                        : <Badge bg="light" text="dark"><FaUserTag className="me-1" />{t.assignedTo?.name || "Unknown"}</Badge>}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Button size="sm" variant="outline-secondary" onClick={() => {
                          document.getElementById(`comments-${t._id}`)?.classList.toggle("d-none");
                        }}>
                          <strong className="d-inline-flex align-items-center gap-1">
                            Comments <FaComments />
                          </strong>
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => {
                          document.getElementById(`timelogs-${t._id}`)?.classList.toggle("d-none");
                        }}>
                          <strong className="d-inline-flex align-items-center gap-1">
                            Time Logs <FaClock />
                          </strong>
                        </Button>
                        {role === "admin" && (
                          <Button size="sm" variant="danger" onClick={() => handleDeleteTask(t._id)}>
                            Delete
                          </Button>
                        )}
                        {role === "employee" &&
                          ((Array.isArray(t.assignedTo) && t.assignedTo.some(emp => emp._id === userId)) ||
                            t.assignedTo === userId) && (
                            <Form.Select size="sm" defaultValue={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </Form.Select>
                          )}
                      </div>
                    </td>
                  </tr>

                  {/* Comment & TimeLog Sections */}
                  <tr id={`comments-${t._id}`} className="d-none">
                    <td colSpan={6}>
                      <Form className="d-flex gap-2 mb-2">
                        <Form.Control
                          size="sm"
                          placeholder="Add comment"
                          value={commentMap[t._id] || ""}
                          onChange={(e) => setCommentMap({ ...commentMap, [t._id]: e.target.value })}
                        />
                        <Button size="sm" onClick={() => handleAddComment(t._id)}>Post</Button>
                      </Form>
                      {t.comments?.length > 0 ? (
                        <ul className="ps-3">
                          {t.comments.map((c, idx) => (
                            <li key={idx}><strong>{c.commentedBy?.name || "Unknown"}:</strong> {c.commentText}</li>
                          ))}
                        </ul>
                      ) : <p className="text-muted">No comments yet</p>}
                    </td>
                  </tr>

                  <tr id={`timelogs-${t._id}`} className="d-none">
                    <td colSpan={6}>
                      <Form className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder="Hours"
                          value={logMap[t._id] || ""}
                          onChange={(e) => setLogMap({ ...logMap, [t._id]: e.target.value })}
                        />
                        <Button size="sm" onClick={() => handleAddTimeLog(t._id)}>Log</Button>
                      </Form>
                      {t.timeLogs?.length > 0 ? (
                        <ul className="ps-3">
                          {t.timeLogs.map((log, idx) => (
                            <li key={idx}>
                              {log.employeeId?.name || "Unknown"} — {log.hours} hrs on {new Date(log.logDate).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-muted">No time logs yet</p>}
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
