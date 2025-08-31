import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingUsers,
  rejectUser,
} from "../Redux/Slices/pendingUserSlice";
import Swal from "sweetalert2";
import { Container, Card, Table, Button, Modal, Form } from "react-bootstrap";
import {
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader/Loader";
import axios from "axios";

const AdminApproveEmployees = () => {
  const dispatch = useDispatch();
  const { data = [], loading = false } = useSelector(
    (state) => state.pendingUsers
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [basicSalary, setBasicSalary] = useState("");

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    dispatch(fetchPendingUsers());
  }, [dispatch]);

  const handleApproveClick = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!basicSalary) {
      Swal.fire("Error", "Please enter basic salary", "error");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/approve-user/${selectedUserId}`,
        { basicSalary },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire("Approved!", "User approved with basic salary", "success");
      setShowModal(false);
      setBasicSalary("");
      dispatch(fetchPendingUsers());
    } catch (err) {
      Swal.fire("Error", "Failed to approve user", "error");
    }
  };

  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: "Reject User?",
      text: "This will remove the pending request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
    });
    if (confirm.isConfirmed) {
      await dispatch(rejectUser(id));
      Swal.fire("Rejected!", "Request has been removed.", "success");
    }
  };

  const handleViewDetails = (emp) => {
    const profileUrl = emp.profilePic
      ? `${import.meta.env.VITE_API_URL}/static/${emp.profilePic}`
      : null;

    Swal.fire({
      title: `<h3>${emp.name}</h3>`,
      html: `
        <div style="text-align:left; max-height:500px; overflow-y:auto">
          ${
            profileUrl
              ? `<img src='${profileUrl}' alt='profile' style='height:120px;width:120px;border-radius:8px;object-fit:cover;margin:0 auto 10px;display:block'/>`
              : ""
          }
          <table class='table table-bordered'>
            <tr><td><b>Email</b></td><td>${emp.email}</td></tr>
            <tr><td><b>Phone</b></td><td>${emp.phone || "N/A"}</td></tr>
            <tr><td><b>Gender</b></td><td>${emp.gender || "N/A"}</td></tr>
            <tr><td><b>Date of Birth</b></td><td>${
              emp.dob?.substring(0, 10) || "N/A"
            }</td></tr>
            <tr><td><b>Department</b></td><td>${
              emp.departmentId?.name || "N/A"
            }</td></tr>
            <tr><td><b>Designation</b></td><td>${
              emp.designationId?.name || "N/A"
            }</td></tr>
            <tr><td><b>Shift</b></td><td>${emp.shiftId?.name || "N/A"}</td></tr>
            <tr><td><b>Joining Date</b></td><td>${
              emp.doj?.substring(0, 10) || "N/A"
            }</td></tr>
            <tr><td><b>Address</b></td><td>${emp.address || "N/A"}</td></tr>
            <tr><td><b>Emergency Contact</b></td>
                <td>${emp.emergencyContact?.name || "-"} (${
        emp.emergencyContact?.relation || "-"
      }) - ${emp.emergencyContact?.phone || "-"}</td></tr>
          </table>
        </div>
      `,
      width: "700px",
      showCloseButton: true,
      confirmButtonText: "Close",
    });
  };

  return (
    <AdminLayout>
      <Container className="mt-5">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-center align-items-center mb-4">
              <FaUserClock className="me-2 text-primary fs-3" />
              <h3 className="m-0 text-primary">Pending Employee Approvals</h3>
            </div>

            {loading ? (
              <div className="my-5">
                <Loader />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted fs-5">
                No pending registrations
              </p>
            ) : (
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  className="text-center align-middle shadow-sm"
                >
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((emp, i) => (
                      <tr key={emp._id}>
                        <td>{i + 1}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.phone}</td>
                        <td>{emp.departmentId?.name || "N/A"}</td>
                        <td className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                          <Button
                            variant="info"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleViewDetails(emp)}
                          >
                            <FaUser className="me-1" /> View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleApproveClick(emp._id)}
                          >
                            <FaCheckCircle className="me-1" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleReject(emp._id)}
                          >
                            <FaTimesCircle className="me-1" /> Reject
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Basic Salary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Basic Salary (₹)</Form.Label>
            <Form.Control
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              placeholder="Enter basic salary"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApproveConfirm}>
            Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default AdminApproveEmployees;
