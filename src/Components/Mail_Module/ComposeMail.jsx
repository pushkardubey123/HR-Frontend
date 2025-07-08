// src/components/Mail/ComposeMail.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ComposeMail = () => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
    files: [],
  });

  const [sending, setSending] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      setFormData({ ...formData, files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.to || !formData.subject || !formData.message) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    try {
      setSending(true);
      const data = new FormData();
      data.append("to", formData.to);
      data.append("subject", formData.subject);
      data.append("message", formData.message);

      for (let i = 0; i < formData.files.length; i++) {
        data.append(`file${i}`, formData.files[i]);
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/mail/send`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "Mail sent successfully!", "success");
      setFormData({ to: "", subject: "", message: "", files: [] });
    } catch (err) {
      console.error("Mail send error:", err);
      Swal.fire("Error", "Failed to send mail", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mt-3">
      <h4 className="text-primary mb-3">📨 Compose Email</h4>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-4 shadow-sm border"
      >
        <div className="mb-3">
          <label className="form-label">To (comma separated)</label>
          <input
            type="text"
            name="to"
            className="form-control"
            value={formData.to}
            onChange={handleChange}
            placeholder="e.g., john@example.com, jane@example.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            name="subject"
            className="form-control"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter subject"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            name="message"
            rows="6"
            className="form-control"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message..."
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Attachments</label>
          <input
            type="file"
            name="files"
            multiple
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Mail"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMail;
