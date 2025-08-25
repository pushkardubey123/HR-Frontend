import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "./jobApi";
import "./JobDetail.css"; // Custom CSS file

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      const data = await getJobById(id);
      setJob(data);
    };
    fetchJob();
  }, [id]);

  if (!job) return <div className="job-loading">Loading...</div>;

  return (
    <div className="job-detail-container">
      <div className="job-card">
        <div className="job-main">
          <h2 className="job-title">{job.title}</h2>
          <div className="job-info">
            <p><strong>Department:</strong> {job.departmentId.name}</p>
            <p><strong>Designation:</strong> {job.designationId.name}</p>
            <p><strong>Positions:</strong> {job.positions}</p>
            <p><strong>Skills:</strong> {job.skills.join(", ")}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Requirement:</strong> {job.requirement}</p>
            <p><strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(job.endDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="job-action">
          <button onClick={() => navigate(`/jobs/${job._id}/apply`)} className="apply-btn">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
