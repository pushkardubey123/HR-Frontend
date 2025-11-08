import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Container, Card, Table, Button } from "react-bootstrap";
import { FaUserShield, FaCheckCircle, FaTimesCircle, FaUser } from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import Loader from "./Loader/Loader";

const SuperAdminApproveAdmin = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  // ✅ Fetch all pending admins
  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/pending-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAdmins(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      Swal.fire("Error", "Failed to load pending admins", "error");
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  // ✅ Approve admin
  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve Admin?",
      text: "This will move the admin to the main user list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/user/approve-admin/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Approved!", "Admin has been approved successfully.", "success");
        fetchPendingAdmins();
      } catch (err) {
        Swal.fire("Error", "Failed to approve admin", "error");
      }
    }
  };

  // ✅ Reject admin
  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: "Reject Admin?",
      text: "This will permanently remove the admin request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/user/reject-admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Rejected!", "Admin request has been rejected.", "success");
        fetchPendingAdmins();
      } catch (err) {
        Swal.fire("Error", "Failed to reject admin", "error");
      }
    }
  };

  // ✅ View details modal
  const handleViewDetails = (admin) => {
    const profileUrl = admin.profilePic
      ? `${import.meta.env.VITE_API_URL}/static/${admin.profilePic}`
      : null;

    Swal.fire({
      title: `<h3>${admin.name}</h3>`,
      html: `
        <div style="text-align:left; max-height:400px; overflow-y:auto">
          ${
            profileUrl
              ? `<img src='${profileUrl}' alt='profile' style='height:120px;width:120px;border-radius:8px;object-fit:cover;margin:0 auto 10px;display:block'/>`
              : ""
          }
          <table class='table table-bordered'>
            <tr><td><b>Email</b></td><td>${admin.email}</td></tr>
            <tr><td><b>Phone</b></td><td>${admin.phone || "N/A"}</td></tr>
            <tr><td><b>Company</b></td><td>${admin.companyName || "N/A"}</td></tr>
            <tr><td><b>Address</b></td><td>${admin.address || "N/A"}</td></tr>
          </table>
        </div>
      `,
      width: "600px",
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  return (
    <SuperAdminLayout>
      <Container className="mt-5">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-center align-items-center mb-4">
              <FaUserShield className="me-2 text-primary fs-3" />
              <h3 className="m-0 text-primary">Pending Admin Approvals</h3>
            </div>

            {loading ? (
              <div className="my-5">
                <Loader />
              </div>
            ) : pendingAdmins.length === 0 ? (
              <p className="text-center text-muted fs-5">No pending admin requests</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="text-center align-middle shadow-sm">
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Company Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAdmins.map((admin, i) => (
                      <tr key={admin._id}>
                        <td>{i + 1}</td>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{admin.phone || "N/A"}</td>
                        <td>{admin.companyName || "N/A"}</td>
                        <td className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                          <Button
                            variant="info"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleViewDetails(admin)}
                          >
                            <FaUser className="me-1" /> View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleApprove(admin._id)}
                          >
                            <FaCheckCircle className="me-1" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="rounded-pill d-flex align-items-center"
                            onClick={() => handleReject(admin._id)}
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
    </SuperAdminLayout>
  );
};

export default SuperAdminApproveAdmin;
