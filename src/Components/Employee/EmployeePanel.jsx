import React, { useEffect, useState } from "react";
import { Table, Badge, Form, Button } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegCommentDots, FaCheckCircle, FaHourglassStart, FaRegClock, FaComments, FaClock } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import EmployeeLayout from "./EmployeeLayout";

const EmployeePanel = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;
  const token = user?.token;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentMap, setCommentMap] = useState({});
  const [logMap, setLogMap] = useState({});

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/projects");

      const employeeTasks = res.data.data.flatMap((proj) =>
        proj.tasks
          .filter((task) => {
            const assigned = task.assignedTo;
            const uid = userId?.toString();
            if (Array.isArray(assigned)) {
              return assigned.some((a) => a._id?.toString() === uid || a?.toString() === uid);
            } else {
              return assigned?._id?.toString() === uid || assigned?.toString() === uid;
            }
          })
          .map((task) => ({
            ...task,
            projectName: proj.name,
            projectId: proj._id,
          }))
      );

      setTasks(employeeTasks);
    } catch {
      Swal.fire("Error", "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (projectId, taskId, status) => {
    try {
      await axiosInstance.put(`/api/projects/${projectId}/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const addComment = async (projectId, taskId) => {
    const commentText = commentMap[taskId];
    if (!commentText) return;
    try {
      await axiosInstance.post(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        commentText,
        commentedBy: userId,
      });
      setCommentMap((prev) => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to add comment", "error");
    }
  };

  const logHours = async (projectId, taskId) => {
    const hours = logMap[taskId];
    if (!hours) return;
    try {
      await axiosInstance.post(`/api/projects/${projectId}/tasks/${taskId}/timelogs`, {
        employeeId: userId,
        hours,
      });
      setLogMap((prev) => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch {
      Swal.fire("Error", "Failed to log time", "error");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <EmployeeLayout>
      <div className="container mt-4">
        <h4>🧑‍💻 My Assigned Tasks</h4>

        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted">No tasks assigned.</p>
        ) : (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Project</th>
                <th>Title</th>
                <th>Status</th>
                <th>Due</th>
                <th>Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <React.Fragment key={task._id}>
                  <tr>
                    <td>{i + 1}</td>
                    <td>{task.projectName}</td>
                    <td>{task.title}</td>
                    <td>
                      <Badge
  bg={
    task.status === "completed"
      ? "success"
      : task.status === "in-progress"
      ? "warning"
      : "secondary"
  }
  className="d-inline-flex align-items-center gap-1"
>
  {task.status === "completed" && (
    <>
      Completed <FaCheckCircle />
    </>
  )}
  {task.status === "in-progress" && (
    <>
      In Progress <FaHourglassStart />
    </>
  )}
  {task.status === "pending" && (
    <>
      Pending <FaRegClock />
    </>
  )}
</Badge>

                    </td>
                    <td>{task.dueDate?.substring(0, 10)}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        defaultValue={task.status}
                        onChange={(e) =>
                          updateStatus(task.projectId, task._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </Form.Select>
                    </td>
                    <td>
                      <div className="d-inline-flex align-items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() =>
                            document.getElementById(`comments-${task._id}`)?.classList.toggle("d-none")
                          }
                        >
                          <strong className="d-inline-flex align-items-center gap-1">
  Comments <FaComments />
</strong>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() =>
                            document.getElementById(`timelogs-${task._id}`)?.classList.toggle("d-none")
                          }
                        >
                          <strong className="d-inline-flex align-items-center gap-1">
  Time Logs <FaClock />
</strong>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Comments Section */}
                  <tr id={`comments-${task._id}`} className="d-none">
                    <td colSpan={7}>
                      <strong>Comments</strong>
                      <Form className="mb-2 d-flex gap-2">
                        <Form.Control
                          size="sm"
                          placeholder="Add comment"
                          value={commentMap[task._id] || ""}
                          onChange={(e) =>
                            setCommentMap({ ...commentMap, [task._id]: e.target.value })
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => addComment(task.projectId, task._id)}
                        >
                          Post
                        </Button>
                      </Form>
                      {task.comments?.length > 0 ? (
                        <ul className="ps-3">
                          {task.comments.map((c, idx) => (
                            <li key={idx}>
                              <strong>{c.commentedBy?.name || "Unknown"}:</strong>{" "}
                              {c.commentText}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">No comments yet</p>
                      )}
                    </td>
                  </tr>

                  {/* Time Logs Section */}
                  <tr id={`timelogs-${task._id}`} className="d-none">
                    <td colSpan={7}>
                      <strong>🕒 Time Logs</strong>
                      <Form className="mb-2 d-flex gap-2">
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Hours"
                          value={logMap[task._id] || ""}
                          onChange={(e) =>
                            setLogMap({ ...logMap, [task._id]: e.target.value })
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => logHours(task.projectId, task._id)}
                        >
                          Log
                        </Button>
                      </Form>
                      {task.timeLogs?.length > 0 ? (
                        <ul className="ps-3">
                          {task.timeLogs.map((log, idx) => (
                            <li key={idx}>
                              {log.employeeId?.name || "Unknown"} — {log.hours} hrs on{" "}
                              {new Date(log.logDate).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">No time logs yet</p>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeePanel;
