import React, { useEffect, useState } from "react";
import EmployeeLayout from "./EmployeeLayout";
import axios from "axios";
import { Button, Card, Form, Table } from "react-bootstrap";
import {
  FaCloudUploadAlt,
  FaTrash,
  FaEye,
  FaFileAlt,
  FaSyncAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "../Admin/Loader/Loader";

const EmployeeDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [editingDocId, setEditingDocId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const employeeId = user?.id;
  const token = user?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/documents/${employeeId}`);
      setDocuments(res.data?.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!documentType || (!uploadFile && !editingDocId)) {
      return Swal.fire(
        "Warning",
        "Document type and file are required",
        "warning"
      );
    }

    const formData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("documentType", documentType);
    if (uploadFile) formData.append("file", uploadFile);

    try {
      if (editingDocId) {
        const res = await axiosInstance.put(
          `/api/documents/${editingDocId}`,
          formData
        );
        if (res.data.success) {
          Swal.fire("Updated", "Document updated successfully", "success");
        } else {
          Swal.fire("Failed", res.data.message || "Update failed", "error");
        }
      } else {
        const res = await axiosInstance.post(
          "/api/documents/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.data.success) {
          Swal.fire("Uploaded", "Document uploaded successfully", "success");
        } else {
          Swal.fire("Failed", res.data.message || "Upload failed", "error");
        }
      }

      setUploadFile(null);
      setDocumentType("");
      setEditingDocId(null);
      fetchDocuments();
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/documents/${id}`);
        Swal.fire("Deleted", "Document removed", "success");
        fetchDocuments();
      } catch {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  const handleEdit = (doc) => {
    setEditingDocId(doc._id);
    setDocumentType(doc.documentType);
    setUploadFile(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <EmployeeLayout>
      <Card className="p-4 shadow border-0 rounded-4">
        <h4 className="mb-4 d-flex align-items-center gap-2 text-primary">
          <FaFileAlt /> My Documents
        </h4>

        <Card className="p-3 border rounded shadow-sm mb-4">
          <h6 className="mb-3 d-flex align-items-center gap-2">
            <FaCloudUploadAlt />{" "}
            {editingDocId ? "Update Document" : "Upload New Document"}
          </h6>
          <Form.Group className="mb-2">
            <Form.Label>Document Type</Form.Label>
            <Form.Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="">-- Select Type --</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Resume">Resume</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Bank Details">Bank Details</option>
              <option value="Others">Others</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              {editingDocId ? "Replace File (optional)" : "Upload File"}
            </Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
          </Form.Group>
          <Button
            variant={editingDocId ? "warning" : "success"}
            className="d-inline-flex align-items-center gap-2"
            onClick={handleUpload}
            disabled={!documentType || (!uploadFile && !editingDocId)}
          >
            {editingDocId ? <FaSyncAlt /> : <FaCloudUploadAlt />}
            {editingDocId ? "Update" : "Upload"}
          </Button>
          {editingDocId && (
            <Button
              variant="secondary"
              className="ms-2 mt-2"
              onClick={() => {
                setEditingDocId(null);
                setDocumentType("");
                setUploadFile(null);
              }}
            >
              Cancel
            </Button>
          )}
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Loader />
          </div>
        ) : (
          <Table bordered hover responsive className="align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Date</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc, i) => (
                  <tr key={doc._id}>
                    <td>{i + 1}</td>
                    <td>{doc.documentType}</td>
                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      <a
                        href={`${import.meta.env.VITE_API_URL}/static/${
                          doc.fileUrl
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-success d-flex align-items-center justify-content-center gap-2"
                      >
                        <FaEye /> View
                      </a>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(doc)}
                      >
                        <FaSyncAlt />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(doc._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </EmployeeLayout>
  );
};

export default EmployeeDocument;
