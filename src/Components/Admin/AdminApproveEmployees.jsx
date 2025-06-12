import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingUsers,
  approveUser,
  rejectUser,
} from "../Redux/Slices/pendingUserSlice";
import Swal from "sweetalert2";

const AdminApproveEmployees = () => {
  const dispatch = useDispatch();

  const pendingUsers = useSelector((state) => state.pendingUsers);
  const data = pendingUsers?.data || [];
  const loading = pendingUsers?.loading || false;

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
    <div className="container mt-4">
      <h4 className="text-center mb-3">Pending Employee Approvals</h4>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-muted">No pending registrations</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
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
                  <td>{emp.departmentId.name || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApprove(emp._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(emp._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApproveEmployees;
