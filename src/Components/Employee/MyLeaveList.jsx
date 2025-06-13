import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";

const MyLeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      const employeeId = user?.id;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leaves/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch leaves",error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <EmployeeLayout>
      <div className="container mt-4">
        <h4 className="shadow-lg text-center p-2 bg-secondary text-white">
          My Leave Lists
        </h4>
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p>No leave records found.</p>
        ) : (
          <table className="table  table-striped mt-3">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span
                      className={`badge ${
                        leave.status === "Approved"
                          ? "bg-success"
                          : leave.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default MyLeaveList;
