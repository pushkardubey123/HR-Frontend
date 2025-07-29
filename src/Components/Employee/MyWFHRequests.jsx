import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import Loader from "../Admin/Loader/Loader"; // optional loader
import EmployeeLayout from "./EmployeeLayout";

const statusIcon = {
  pending: <MdPendingActions className="text-warning" />,
  approved: <FaCheckCircle className="text-success" />,
  rejected: <FaTimesCircle className="text-danger" />,
};

const EmployeeWFHList = () => {
  const [wfhList, setWfhList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getWFHRequests = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:3003/api/wfh/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWfhList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch WFH data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWFHRequests();
  }, []);

  return (
    <EmployeeLayout>
      <div className="p-6 max-w-5xl mx-auto mt-8 bg-white shadow-md rounded-2xl">
        <div className="container mt-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="text-center text-primary mb-4 fs-4 fw-semibold">
                My WHF Requests
              </h2>

              {loading ? (
                <Loader />
              ) : wfhList.length === 0 ? (
                <p className="text-center text-muted">No WFH requests found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-primary">
                      <tr>
                        <th scope="col">From</th>
                        <th scope="col">To</th>
                        <th scope="col">Reason</th>
                        <th scope="col" className="text-center">Status</th>
                        <th scope="col">Admin Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wfhList.map((item) => (
                        <tr key={item._id}>
                          <td>{new Date(item.fromDate).toLocaleDateString()}</td>
                          <td>{new Date(item.toDate).toLocaleDateString()}</td>
                          <td>{item.reason}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center align-items-center gap-1">
                              {statusIcon[item.status]}
                              <span className="text-capitalize fw-medium">{item.status}</span>
                            </div>
                          </td>
                          <td className="text-muted small">{item.adminRemarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeWFHList;
