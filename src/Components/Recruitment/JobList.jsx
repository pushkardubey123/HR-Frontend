import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Admin/AdminLayout";
import { FaTrash, FaEdit, FaEye, FaPlus } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import moment from "moment";
import "./CreateJob.module.css"; // same style reuse

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // ✅ Fetch Jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/jobs`,
        getHeaders()
      );
      setJobs(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Delete Job
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the job permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/jobs/${id}`,
          getHeaders()
        );
        Swal.fire("Deleted!", "Job has been deleted.", "success");
        fetchJobs();
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
    }
  };

  // ✅ View Job (Modal)
  const handleView = (job) => {
    Swal.fire({
      title: `<strong>${job.title}</strong>`,
      html: `
        <p><b>Department:</b> ${job.departmentId?.name || "-"}</p>
        <p><b>Designation:</b> ${job.designationId?.name || "-"}</p>
        <p><b>Positions:</b> ${job.positions}</p>
        <p><b>Status:</b> ${job.status}</p>
        <p><b>Start Date:</b> ${moment(job.startDate).format("DD MMM YYYY")}</p>
        <p><b>End Date:</b> ${moment(job.endDate).format("DD MMM YYYY")}</p>
        <p><b>Skills:</b> ${job.skills?.join(", ") || "-"}</p>
        <hr/>
        <p><b>Description:</b><br/>${job.description}</p>
        <p><b>Requirement:</b><br/>${job.requirement}</p>
      `,
      icon: "info",
      width: "600px",
      confirmButtonColor: "#2563eb",
    });
  };

  // ✅ Edit Job (SweetAlert Form)
  const handleEdit = (job) => {
    Swal.fire({
      title: "Edit Job",
      html: `
        <input id="title" class="swal2-input" placeholder="Title" value="${job.title}" />
        <input id="positions" class="swal2-input" type="number" placeholder="Positions" value="${job.positions}" />
        <select id="status" class="swal2-input">
          <option value="Active" ${job.status === "Active" ? "selected" : ""}>Active</option>
          <option value="Inactive" ${job.status === "Inactive" ? "selected" : ""}>Inactive</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        return {
          title: document.getElementById("title").value,
          positions: document.getElementById("positions").value,
          status: document.getElementById("status").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/jobs/${job._id}`,
            result.value,
            getHeaders()
          );
          Swal.fire("Updated!", "Job has been updated.", "success");
          fetchJobs();
        } catch (err) {
          Swal.fire("Error", err.response?.data?.message || err.message, "error");
        }
      }
    });
  };

  // ✅ Count Stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const inactiveJobs = jobs.filter((j) => j.status === "Inactive").length;

  return (
    <AdminLayout>
      <div className="createjob-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="createjob-title d-flex text-align-center">
            <CgFileDocument className="mt-1 me-1" /> Job List
          </h2>
          <button
            className="btn btn-primary rounded-circle"
            onClick={() => navigate("/admin/jobcreate")}
          >
            <FaPlus />
          </button>
        </div>

        {/* ✅ Stats Boxes */}
<div className="d-flex justify-content-between align-items-center mb-4 gap-3">
  {/* Total Jobs Card */}
  <div className="card text-center shadow-lg p-3 border-0 bg-light flex-grow-1">
    <h5>Total Jobs</h5>
    <h3 className="text-primary">{totalJobs}</h3>
  </div>

  {/* Active Jobs Card */}
  <div className="card text-center shadow-lg p-3 border-0 bg-light flex-grow-1">
    <h5>Active Jobs</h5>
    <h3 className="text-success">{activeJobs}</h3>
  </div>

  {/* Inactive Jobs Card */}
  <div className="card text-center shadow-lg p-3 border-0 bg-light flex-grow-1">
    <h5>Inactive Jobs</h5>
    <h3 className="text-danger">{inactiveJobs}</h3>
  </div>
</div>

        {/* ✅ Job Table */}
        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Positions</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.departmentId?.name}</td>
                    <td>{job.designationId?.name}</td>
                    <td>{job.positions}</td>
                    <td>
                      <span
                        className={`badge ${
                          job.status === "Active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>{moment(job.startDate).format("DD/MM/YYYY")}</td>
                    <td>{moment(job.endDate).format("DD/MM/YYYY")}</td>
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => handleView(job)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(job)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(job._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default JobList;
