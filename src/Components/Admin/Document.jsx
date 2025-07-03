import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { Button, Card, Modal, Table, Form } from "react-bootstrap";
import {
  FaEye,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaFolderOpen,
  FaCloudUploadAlt,
} from "react-icons/fa";
import Loader from "./Loader/Loader";
import Swal from "sweetalert2";

const Document = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);



  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

const fetchEmployees = async () => {
  try {
    setLoadingEmployees(true);
    const res = await axiosInstance.get("/user");
    setEmployees(res.data?.data || []);
  } catch {
    Swal.fire("Error", "Failed to load employees", "error");
  } finally {
    setLoadingEmployees(false);
  }
};


  const fetchDocuments = async (emp) => {
    try {
      setSelectedEmployee(emp);
      setLoadingDocs(true);
      const res = await axiosInstance.get(`/api/documents/${emp._id}`);
      setDocuments(res.data?.data || []);
      setShowModal(true);
      setLoadingDocs(false);
    } catch {
      setLoadingDocs(false);
      Swal.fire("error", "Failed to fetch documents", "error");
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
        Swal.fire("Deleted", "Deleted successfully", "success");
        if (selectedEmployee) fetchDocuments(selectedEmployee);
      } catch {
        Swal.fire("Deleting...", "Delete Failed", "error");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !documentType || !selectedEmployee?._id) {
      return Swal.fire("Document", "All fields are required", "error");
    }

    const formData = new FormData();
    formData.append("employeeId", selectedEmployee._id);
    formData.append("documentType", documentType);
    formData.append("file", uploadFile);

    try {
      await axiosInstance.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Document", "Document uploaded successfully", "success");
      setUploadFile(null);
      setDocumentType("");
      fetchDocuments(selectedEmployee);
    } catch {
      Swal.fire("Uploading...", "Upload Failed!", "error");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <AdminLayout>
      <Card className="p-4 shadow border-0 rounded-4">
        <h4 className="mb-4 d-flex align-items-center gap-2 text-primary">
          <FaFolderOpen /> Employee Documents
        </h4>
<Form.Group className="mb-4">
  <Form.Control
    type="text"
    placeholder="Search employee by name or email..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="shadow-sm rounded-pill px-4 py-2"
  />
</Form.Group>

{loadingEmployees ? (
  <div className="text-center py-5">
    <Loader />
  </div>
) : (
  <div className="row g-4">
    {employees
      .filter((emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 ? (
        <div className="text-muted text-center">No employees found</div>
      ) : (
        employees
          .filter((emp) =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((emp) => (
            <div key={emp._id} className="col-md-6 col-lg-4">
              <Card className="h-100 border-0 rounded-4 shadow-sm employee-card position-relative overflow-hidden">
                <Card.Body className="d-flex flex-column justify-content-between p-4">
                  <div className="mb-3">
                    <h5 className="fw-bold d-flex align-items-center gap-2 text-dark mb-2">
                      <FaUser /> {emp.name}
                    </h5>
                    <p className="text-muted d-flex align-items-center gap-2 mb-0">
                      <FaEnvelope /> {emp.email}
                    </p>
                  </div>
                  <div className="mt-auto text-end">
                    <Button
                      variant="info"
                      className="text-white d-inline-flex align-items-center gap-2"
                      onClick={() => fetchDocuments(emp)}
                    >
                      <FaEye /> View Files
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
      )}
  </div>
)}



      </Card>

      {/* 📁 Document Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Documents for: {selectedEmployee?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Upload Section */}
          <Card className="p-3 shadow-sm mb-4 border rounded">
            <h6 className="mb-3 d-flex align-items-center gap-2">
              <FaCloudUploadAlt /> Upload New Document
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
            <Form.Group className="mb-3" >
              <Form.Label>Upload File</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </Form.Group>
            <Button variant="success" className="d-inline-flex align-items-center gap-1" onClick={handleUpload} disabled={!uploadFile}>
              <FaCloudUploadAlt className="me-2" />
              Upload
            </Button>
          </Card>

          {/* Document Table */}
          {loadingDocs ? (
            <div className="text-center py-5">
              <Loader />
            </div>
          ) : (
            <Table bordered hover responsive className="align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-muted">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, i) => (
                    <tr key={doc._id}>
                      <td>{i + 1}</td>
                      <td>{doc.documentType}</td>
                      <td>{doc.uploadedBy?.name || "Unknown"}</td>
                      <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/static/${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-success d-flex align-items-center justify-content-center gap-2"
                        >
                          <FaEye /> View
                        </a>
                      </td>
                      <td>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Document;
