import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingUsers, approveUser, rejectUser } from "../Redux/Slices/pendingUserSlice";
import Swal from "sweetalert2";
import {
  Container,
  Card,
  Table,
  Button,
} from "react-bootstrap";
import {
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader/Loader"; // ✅ Import dot-loader

const AdminApproveEmployees = () => {
  const dispatch = useDispatch();
  const { data = [], loading = false } = useSelector((state) => state.pendingUsers);

  useEffect(() => {
    dispatch(fetchPendingUsers());
  }, [dispatch]);

  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve User?",
      text: "This will create an official employee record.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
    });
    if (confirm.isConfirmed) {
      await dispatch(approveUser(id));
      Swal.fire("Approved!", "User has been added.", "success");
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

  return (
    <AdminLayout>
      <Container className="mt-5">
        <Card className="shadow-lg rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-center align-items-center mb-4">
              <FaUserClock className="me-2 text-primary fs-3" />
              <h3 className="m-0 text-primary">Pending Employee Approvals</h3>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="my-5">
                <Loader />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted fs-5">No pending registrations</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover responsive className="text-center align-middle shadow-sm">
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
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2 rounded-pill px-3 d-inline-flex align-items-center"
                            onClick={() => handleApprove(emp._id)}
                          >
                            <FaCheckCircle className="me-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="rounded-pill px-3 d-inline-flex align-items-center"
                            onClick={() => handleReject(emp._id)}
                          >
                            <FaTimesCircle className="me-1" />
                            Reject
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
    </AdminLayout>
  );
};

export default AdminApproveEmployees;
