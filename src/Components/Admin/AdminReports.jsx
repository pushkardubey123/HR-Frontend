import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { Card, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import Loader from "./Loader/Loader";
import { FaFileDownload, FaFileAlt } from "react-icons/fa";

const AdminReport = () => {
  const [type, setType] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

const handleGenerate = async () => {
  if (!type) {
    return Swal.fire("Required", "Please select a report type", "warning");
  }

  setLoading(true);
  try {
    window.open(`${import.meta.env.VITE_API_URL}/api/reports/stream?type=${type}`, "_blank");
  } catch (err) {
    Swal.fire("Error", "Something went wrong", "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <AdminLayout>
      <div
        className="d-flex justify-content-center align-items-center py-5"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        }}
      >
        <Card
          className="p-5 shadow-lg border-0 rounded-5 w-100"
          style={{
            maxWidth: "600px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h4 className="mb-4 d-flex align-items-center gap-2 text-primary">
            <FaFileAlt /> Generate Reports
          </h4>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Select Report Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="shadow-sm"
            >
              <option value="">-- Choose --</option>
              <option value="attendance">Attendance</option>
              <option value="leaves">Leaves</option>
              <option value="users">Users</option>
              <option value="exit">Exit Requests</option>
              <option value="projects">Projects</option>
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleGenerate}
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader size={20} /> : <FaFileDownload />}
            Generate Report
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReport;
