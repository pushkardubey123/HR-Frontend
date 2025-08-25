import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { applyJob } from "./jobApi";

const ApplyJob = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    jobId: id,
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: ""
  });
  const [files, setFiles] = useState({
    profileImage: null,
    resume: null,
    coverLetter: null
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Object.keys(files).forEach((key) => files[key] && data.append(key, files[key]));

    await applyJob(data);
    alert("Application submitted successfully!");
  };

  return (
    <>
      <div className="apply-job-container">
        <div className="apply-job-card">
          <h2 className="apply-job-title">Apply for This Job</h2>
          <p className="apply-job-subtitle">
            Fill out the form below and submit your application.
          </p>

          <form onSubmit={handleSubmit} className="apply-job-form">
            <div className="form-grid">
              {/* Left Column */}
              <div className="form-col">
                <div className="input-group">
                  <input type="text" name="name" required onChange={handleChange} />
                  <label>Full Name</label>
                </div>

                <div className="input-group">
                  <input type="email" name="email" required onChange={handleChange} />
                  <label>Email Address</label>
                </div>

                <div className="input-group">
                  <input type="text" name="phone" onChange={handleChange} />
                  <label>Phone Number</label>
                </div>

                <div className="input-group">
                  <select name="gender" onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <label>Gender</label>
                </div>

                <div className="input-group">
                  <input type="date" name="dob" onChange={handleChange} />
                  <label>Date of Birth</label>
                </div>
              </div>

              {/* Right Column */}
              <div className="form-col">
                <div className="input-group">
                  <textarea name="address" onChange={handleChange}></textarea>
                  <label>Address</label>
                </div>

                <div className="file-group">
                  <label className="file-label">
                    {files.profileImage ? files.profileImage.name : "Upload Profile Image"}
                    <input type="file" name="profileImage" onChange={handleFileChange} />
                  </label>

                  <label className="file-label">
                    {files.resume ? files.resume.name : "Upload Resume (PDF) *"}
                    <input type="file" name="resume" onChange={handleFileChange} required />
                  </label>

                  <label className="file-label">
                    {files.coverLetter ? files.coverLetter.name : "Upload Cover Letter"}
                    <input type="file" name="coverLetter" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Submit Application
            </button>
          </form>
        </div>
      </div>

      <style>
        {`
      /* Container */
      .apply-job-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(90deg, #ebf8ff, #f3e8ff);
        padding: 20px;
      }

      /* Card */
      .apply-job-card {
        background: #fff;
        padding: 50px 60px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        max-width: 1000px;
        width: 100%;
        text-align: center;
      }

      /* Title & Subtitle */
      .apply-job-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #1a202c;
        margin-bottom: 10px;
      }
      .apply-job-subtitle {
        color: #6b7280;
        margin-bottom: 35px;
        font-size: 1rem;
      }

      /* Form */
      .apply-job-form {
        display: flex;
        flex-direction: column;
        gap: 25px;
      }

      /* Grid Layout */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }
      .form-col {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* Floating labels */
      .input-group {
        position: relative;
      }
      .input-group input,
      .input-group select,
      .input-group textarea {
        width: 100%;
        padding: 16px;
        border: 1.5px solid #cbd5e0;
        border-radius: 12px;
        font-size: 1rem;
        outline: none;
        transition: all 0.3s ease;
      }
      .input-group textarea {
        resize: none;
        min-height: 90px;
      }
      .input-group label {
        position: absolute;
        top: 50%;
        left: 15px;
        color: #a0aec0;
        font-size: 1rem;
        pointer-events: none;
        transform: translateY(-50%);
        transition: all 0.2s ease;
      }
      .input-group input:focus + label,
      .input-group input:not(:placeholder-shown) + label,
      .input-group select:focus + label,
      .input-group select:not([value=""]) + label,
      .input-group textarea:focus + label,
      .input-group textarea:not(:placeholder-shown) + label {
        top: -10px;
        left: 10px;
        background: #fff;
        padding: 0 5px;
        font-size: 0.85rem;
        color: #4f46e5;
      }

      /* Focus Effect */
      .input-group input:focus,
      .input-group select:focus,
      .input-group textarea:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 12px rgba(79, 70, 229, 0.2);
      }

      /* File Upload */
      .file-group {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .file-label {
        border: 2px dashed #cbd5e0;
        padding: 16px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        text-align: center;
        color: #6b7280;
      }
      .file-label:hover {
        border-color: #4f46e5;
        background: #f0f0ff;
        color: #1a202c;
      }
      .file-label input {
        display: none;
      }

      /* Submit Button */
      .submit-btn {
        background: linear-gradient(90deg, #4f46e5, #8b5cf6);
        color: white;
        padding: 16px 0;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .submit-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
        `}
      </style>
    </>
  );
};

export default ApplyJob;
