import React, { useEffect, useState } from "react";
import EmployeeLayout from "./EmployeeLayout";
import axios from "axios";
import { Button, Card, Form, Table, Badge } from "react-bootstrap";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "../Admin/Loader/Loader";

const EmployeeExit = () => {
  const [reason, setReason] = useState("");
  const [resignationDate, setResignationDate] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const res = await axiosInstance.get("/api/exit/my-requests");
      setRequests(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Failed to load exit requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !resignationDate) {
      return Swal.fire("Required", "Please fill all fields", "warning");
    }

    try {
      await axiosInstance.post("/api/exit/submit", { reason, resignationDate });
      setReason("");
      setResignationDate("");
      Swal.fire("Submitted", "Exit request submitted", "success");
      fetchRequests();
    } catch {
      Swal.fire("Error", "Submission failed", "error");
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
    <EmployeeLayout>
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)" }}>
        <Card className="p-4 shadow-lg border-0 rounded-4" style={{ backdropFilter: "blur(15px)", background: "rgba(255, 255, 255, 0.6)", width: "100%", maxWidth: "900px" }}>
          <h5 className="mb-4 d-flex align-items-center gap-2 text-danger">
            <FaFileAlt /> Exit Management
          </h5>

          {/* Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Why are you resigning?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                <FaCalendarAlt /> Resignation Date
              </Form.Label>
              <Form.Control
                type="date"
                value={resignationDate}
                onChange={(e) => setResignationDate(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="dark" type="submit" className="d-inline-flex align-items-center gap-2">
              <FaCheckCircle /> Submit Resignation
            </Button>
          </Form>

          {/* Table */}
          <h6 className="mt-5 mb-3 d-flex align-items-center gap-2 text-dark">
            <FaClock /> Your Exit Requests
          </h6>
          {loading ? (
            <div className="text-center py-4"><Loader /></div>
          ) : requests.length === 0 ? (
            <div className="text-muted">No exit requests found</div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="text-center align-middle bg-white rounded-3">
                <thead className="table-dark">
                  <tr>
                    <th>S No</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Feedback</th>
                    <th>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={r._id}>
                      <td>{i + 1}</td>
                      <td>{r.reason}</td>
                      <td>{new Date(r.resignationDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(r.clearanceStatus)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeExit;
