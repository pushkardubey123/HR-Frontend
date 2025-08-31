import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import AdminLayout from "../Admin/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;

const AdminApplications = () => {
  const [allApplications, setAllApplications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/applications`, headers);
      const data = res?.data?.data || [];
      setAllApplications(data);
      setApplications(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    return `${API_URL}/static/${filePath
      .replace(/\\/g, "/")
      .replace("uploads/", "")}`;
  };

  const handleView = (app) => {
    const profile = app.profileImage
      ? `<img src="${getFileUrl(app.profileImage)}" class="sa-avatar" />`
      : `<div class="sa-avatar sa-avatar--initial">${(app.name || "?")
          .slice(0, 1)
          .toUpperCase()}</div>`;

    Swal.fire({
      title: app.name || "Applicant",
      html: `
        <div class="sa-details">
          <div class="sa-details__left">
            ${profile}
          </div>
          <div class="sa-details__right">
            <p><b>Email:</b> ${app.email || "—"}</p>
            <p><b>Phone:</b> ${app.phone || "—"}</p>
            <p><b>Job Title:</b> ${app.jobId?.title || "—"}</p>
            <p><b>Status:</b> ${prettyStatus(app.status)}</p>
            ${
              app.resume
                ? `<p><b>Resume:</b> <a href="${getFileUrl(
                    app.resume
                  )}" target="_blank">Download</a></p>`
                : ""
            }
            ${
              app.coverLetter
                ? `<p><b>Cover Letter:</b> <a href="${getFileUrl(
                    app.coverLetter
                  )}" target="_blank">Download</a></p>`
                : ""
            }
          </div>
        </div>
      `,
      width: 680,
      confirmButtonText: "Close",
    });
  };

  const handleShortlist = async (id, status) => {
    if (status === "shortlisted" || status === "interview_scheduled") {
      return Swal.fire("Info", "Already shortlisted.", "info");
    }
    const ok = await Swal.fire({
      title: "Shortlist candidate?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, shortlist",
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_URL}/api/applications/${id}/shortlist`,
        {},
        headers
      );
      Swal.fire("Shortlisted!", "Candidate has been shortlisted.", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to shortlist", "error");
    }
  };

  const handleReject = async (id, status) => {
    if (status === "rejected") {
      return Swal.fire("Info", "Already rejected.", "info");
    }
    const ok = await Swal.fire({
      title: "Reject application?",
      text: "This action can be changed later if needed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.put(`${API_URL}/api/applications/${id}/reject`, {}, headers);
      Swal.fire("Rejected!", "Application has been rejected.", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to reject", "error");
    }
  };

  const jobOptions = useMemo(() => {
    const set = new Set();
    allApplications.forEach((a) => a?.jobId?.title && set.add(a.jobId.title));
    return ["all", ...Array.from(set)];
  }, [allApplications]);

  useEffect(() => {
    const qLower = q.trim().toLowerCase();
    let list = [...allApplications];

    if (qLower) {
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(qLower) ||
          a.email?.toLowerCase().includes(qLower) ||
          a.jobId?.title?.toLowerCase().includes(qLower)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (jobFilter !== "all") {
      list = list.filter((a) => a.jobId?.title === jobFilter);
    }
    setApplications(list);
    setPage(1);
  }, [q, statusFilter, jobFilter, allApplications]);

  const total = applications.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const current = applications.slice(start, start + PER_PAGE);

  const prettyStatus = (s) => {
    switch (s) {
      case "applied":
        return `<span class="badge badge--applied">Applied</span>`;
      case "shortlisted":
        return `<span class="badge badge--shortlisted">Shortlisted</span>`;
      case "rejected":
        return `<span class="badge badge--rejected">Rejected</span>`;
      case "interview_scheduled":
        return `<span class="badge badge--interview">Interview Scheduled</span>`;
      default:
        return `<span class="badge">${s || "—"}</span>`;
    }
  };

  return (
    <AdminLayout>
      <div className="apps-wrap">
        <div className="apps-head">
          <h2>Job Applications</h2>

          <div className="filters">
            <div className="input-group">
              <FaSearch />
              <input
                placeholder="Search name, email, job…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="select-group">
              <FaFilter />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="interview_scheduled">Interview Scheduled</option>
              </select>
            </div>

            <div className="select-group">
              <FaFilter />
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                {jobOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "all" ? "All Jobs" : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="skeleton-table">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row" />
              ))}
            </div>
          ) : current.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://dummyimage.com/160x120/edf2f7/9aa3b2&text=No+Applications"
                alt=""
              />
              <p>No applications match your filters.</p>
            </div>
          ) : (
            <table className="apps-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th className="ta-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((app) => {
                  const avatarUrl = app.profileImage
                    ? getFileUrl(app.profileImage)
                    : null;
                  const appliedOn = app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString()
                    : "—";
                  const isShortlisted =
                    app.status === "shortlisted" ||
                    app.status === "interview_scheduled";
                  const isRejected = app.status === "rejected";

                  return (
                    <tr key={app._id}>
                      <td>
                        <div className="userCell">
                          {avatarUrl ? (
                            <img src={avatarUrl} className="avatar" />
                          ) : (
                            <div className="avatar avatar--initial">
                              {(app.name || "?").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="userMeta">
                            <div className="name">{app.name || "—"}</div>
                            <div className="muted">
                              {app.phone || app.gender || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{app.email || "—"}</td>
                      <td>{app.jobId?.title || "—"}</td>
                      <td>{appliedOn}</td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html: prettyStatus(app.status),
                        }}
                      />
                      <td className="ta-right">
                        <div className="actions">
                          <button
                            className="btn btn--ghost"
                            title="View"
                            onClick={() => handleView(app)}
                          >
                            <FaEye />
                            <span>View</span>
                          </button>

                          <button
                            className="btn btn--success"
                            title="Shortlist"
                            disabled={isShortlisted}
                            onClick={() => handleShortlist(app._id, app.status)}
                          >
                            <FaCheckCircle />
                            <span>Shortlist</span>
                          </button>

                          <button
                            className="btn btn--danger"
                            title="Reject"
                            disabled={isRejected}
                            onClick={() => handleReject(app._id, app.status)}
                          >
                            <FaTimesCircle />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && total > PER_PAGE && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {page} / {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <style>
        {`
        /* Container */
.apps-wrap {
  padding: 20px;
}

.apps-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.apps-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

/* Filters */
.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group,
.select-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f4f6fa;
  border: 1px solid #e4e8f1;
  border-radius: 12px;
  padding: 8px 10px;
}

.input-group input {
  border: none;
  outline: none;
  background: transparent;
  min-width: 240px;
}

.select-group select {
  border: none;
  outline: none;
  background: transparent;
  padding-right: 2px;
}

/* Card */
.card {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 8px 20px rgba(18, 38, 63, 0.04);
}

/* Table */
.apps-table {
  width: 100%;
  border-collapse: collapse;
}

.apps-table th,
.apps-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f0f2f7;
  text-align: left;
}

.apps-table thead th {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  background: #fafbfe;
  position: sticky;
  top: 0;
  z-index: 1;
}

.apps-table tbody tr:hover {
  background: #fbfcff;
}

/* User cell */
.userCell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar--initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e8efff;
  color: #2b5cff;
  font-weight: 700;
}

.userMeta .name {
  font-weight: 600;
}

.userMeta .muted {
  color: #8a93a6;
  font-size: 12px;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e9edf5;
  background: #f6f8fc;
  color: #637189;
}

.badge--applied {
  background: #eef2ff;
  color: #4338ca;
  border-color: #e0e7ff;
}

.badge--shortlisted {
  background: #eafaf0;
  color: #166534;
  border-color: #d7f0e0;
}

.badge--rejected {
  background: #fff1f2;
  color: #b91c1c;
  border-color: #ffe2e5;
}

.badge--interview {
  background: #f5f3ff;
  color: #6d28d9;
  border-color: #e9e5ff;
}

/* Actions */
.ta-right {
  text-align: right;
}

.actions {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 10px;
  background: #f6f8fc;
  color: #334155;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.15s ease;
}

.btn svg {
  font-size: 14px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(18, 38, 63, 0.06);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Variants */
.btn--ghost {
  background: #eef2ff;
  color: #1d4ed8;
  border-color: #e0e7ff;
}

.btn--success {
  background: #eafaf0;
  color: #166534;
  border-color: #d7f0e0;
}

.btn--danger {
  background: #fff1f2;
  color: #b91c1c;
  border-color: #ffe2e5;
}

/* Skeleton */
.skeleton-table {
  padding: 10px;
}

.skeleton-row {
  height: 44px;
  background: linear-gradient(90deg, #f5f7fb, #eef2f7, #f5f7fb);
  background-size: 200% 100%;
  animation: pulse 1.2s infinite;
  border-radius: 8px;
  margin: 8px 0;
}

@keyframes pulse {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.empty-state {
  padding: 36px 16px;
  text-align: center;
  color: #6b7280;
}

.empty-state img {
  opacity: 0.8;
  margin-bottom: 8px;
}

/* Pagination */
.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 14px;
}

.pagination button {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e5e8f1;
  background: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Note */
.note {
  color: #8a93a6;
  font-size: 12px;
  margin-top: 8px;
}

/* SweetAlert details */
.sa-details {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
  text-align: left;
}

.sa-avatar {
  width: 76px;
  height: 76px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid #edf0f7;
}

.sa-avatar--initial {
  width: 76px;
  height: 76px;
  border-radius: 12px;
  background: #e8efff;
  color: #2b5cff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 26px;
}

        `}
      </style>
    </AdminLayout>
  );
};

export default AdminApplications;
