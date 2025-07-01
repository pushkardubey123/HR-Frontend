import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { Button, Card, Form, Modal, Table, Badge } from "react-bootstrap";
import { FaFileAlt, FaUser, FaEdit, FaSave, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "./Loader/Loader";

const AdminExit = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    interviewFeedback: "",
    clearanceStatus: "",
    amount: "",
    settledOn: "",
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/exit/");
      setRequests(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch exit requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Delete this exit request?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    confirmButtonColor: "#d33",
  });

  if (confirm.isConfirmed) {
    try {
      await axiosInstance.delete(`/api/exit/${id}`);
      Swal.fire("Deleted", "Request has been removed", "success");
      fetchRequests();
    } catch {
      Swal.fire("Error", "Failed to delete", "error");
    }
  }
};

  const handleEditClick = (req) => {
    setEditing(req._id);
    setEditData({
      interviewFeedback: req.interviewFeedback || "",
      clearanceStatus: req.clearanceStatus || "",
      amount: req.finalSettlement?.amount || "",
      settledOn: req.finalSettlement?.settledOn?.substring(0, 10) || "",
    });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/api/exit/${editing}`, {
        interviewFeedback: editData.interviewFeedback,
        clearanceStatus: editData.clearanceStatus,
        finalSettlement: {
          amount: editData.amount,
          settledOn: editData.settledOn,
        },
      });
      setEditing(null);
      Swal.fire("Updated", "Exit request updated", "success");
      fetchRequests();
    } catch {
      Swal.fire("Error", "Failed to update", "error");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "cleared") return <Badge bg="success">Cleared</Badge>;
    if (status === "on-hold") return <Badge bg="warning">On-Hold</Badge>;
    return <Badge bg="secondary">Pending</Badge>;
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
<AdminLayout>
      <div
        className="d-flex justify-content-center align-items-center py-5"
        style={{
          minHeight: "70vh",
          background: "linear-gradient(135deg, #dbe9f4 0%, #f0f4ff 100%)",
        }}
      >
        <Card
          className="p-4 border-0 shadow-lg rounded-5"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.3)",
            width: "100%",
            maxWidth: "1100px",
          }}
        >
          <h4 className="d-flex align-items-center gap-2 mb-4 text-primary fw-bold">
            <FaFileAlt /> Employee Exit Requests
          </h4>

          {loading ? (
            <div className="text-center py-5"><Loader /></div>
          ) : (
            <Table
              bordered
              hover
              responsive
              className="align-middle text-center rounded-4 overflow-hidden shadow-sm"
              style={{ backgroundColor: "#ffffffcc" }}
            >
              <thead style={{ backgroundColor: "#212529", color: "#fff" }}>
                <tr>
                  <th>S No.</th>
                  <th>Employee</th>
                  <th>Reason</th>
                  <th>Resign Date</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Settlement</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-muted">No requests found</td>
                  </tr>
                ) : (
                  requests.map((r, i) => (
                    <tr key={r._id}>
                      <td>{i + 1}</td>
                      <td className="text-center px-3 d-flex align-items-center gap-2 justify-content-center">
                        <FaUser className="text-secondary" />
                        {r.employeeId?.name}
                      </td>
                      <td>{r.reason}</td>
                      <td>{new Date(r.resignationDate).toLocaleDateString()}</td>
                      <td>
                        <Badge
                          bg={
                            r.clearanceStatus === "cleared"
                              ? "success"
                              : r.clearanceStatus === "on-hold"
                              ? "warning"
                              : "secondary"
                          }
                          className="rounded-pill px-3 pt-1 shadow-sm text-uppercase"
                        >
                          {r.clearanceStatus || "Pending"}
                        </Badge>
                      </td>
                      <td>{r.interviewFeedback || <span className="text-muted">--</span>}</td>
                      <td>
                        {r.finalSettlement?.amount ? (
                          <>
                            ₹{r.finalSettlement.amount}
                            <br />
                            <small>{new Date(r.finalSettlement.settledOn).toLocaleDateString()}</small>
                          </>
                        ) : (
                          <span className="text-muted">--</span>
                        )}
                      </td>
                      <td className="d-flex justify-content-center gap-2">
  <Button
    size="sm"
    onClick={() => handleEditClick(r)}
    style={{
      background: "linear-gradient(to right, #00c6ff, #0072ff)",
      border: "none",
      color: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,114,255,0.4)",
    }}
  >
    <FaEdit />
  </Button>

  <Button
    size="sm"
    variant="danger"
    style={{ borderRadius: "12px" }}
    onClick={() => handleDelete(r._id)}
  >
    <i className="bi bi-trash"></i>
    <FaTrash/>
  </Button>
</td>

                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Modal */}
      <Modal show={!!editing} onHide={() => setEditing(null)} centered>
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold">Update Exit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Interview Feedback</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editData.interviewFeedback}
              onChange={(e) =>
                setEditData({ ...editData, interviewFeedback: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Clearance Status</Form.Label>
            <Form.Select
              value={editData.clearanceStatus}
              onChange={(e) =>
                setEditData({ ...editData, clearanceStatus: e.target.value })
              }
            >
              <option value="">-- Select --</option>
              <option value="cleared">Cleared</option>
              <option value="on-hold">On-Hold</option>
              <option value="pending">Pending</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Settlement Amount</Form.Label>
            <Form.Control
              type="number"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold">Settlement Date</Form.Label>
            <Form.Control
              type="date"
              value={editData.settledOn}
              onChange={(e) =>
                setEditData({ ...editData, settledOn: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            <FaSave className="me-1" /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>

  );
};

export default AdminExit;
