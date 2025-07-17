import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { MdAttachFile, MdOutlineEmail } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";

const ComposeMail = () => {
  const [formData, setFormData] = useState({
    to: [],
    subject: "",
    message: "",
    files: [],
  });

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [sending, setSending] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mail/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loggedInEmail = JSON.parse(localStorage.getItem("user"))?.email;

      const options = res.data.data
        .filter((u) => u.email !== loggedInEmail)
        .map((u) => ({
          label: u.email,
          value: u.email,
        }));

      setEmployeeOptions(options);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      setFormData({ ...formData, files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (selected) => {
    setFormData({ ...formData, to: selected || [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.to.length || !formData.subject || !formData.message) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    try {
      setSending(true);
      const data = new FormData();
      data.append("to", formData.to.map((t) => t.value).join(","));
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

      setFormData({ to: [], subject: "", message: "", files: [] });
    } catch (err) {
      console.error("Mail send error:", err);
      Swal.fire("Error", "Failed to send mail", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="bg-white p-5 shadow-lg rounded-4 border border-light">
        <h4 className="mb-4 text-primary d-flex align-items-center gap-2">
          <MdOutlineEmail size={28} />
          Compose Email
        </h4>

        <form onSubmit={handleSubmit}>
          {/* To field */}
          <div className="mb-4">
            <label className="form-label fw-semibold">To </label>
            <Select
              isMulti
              options={employeeOptions}
              value={formData.to}
              onChange={handleSelectChange}
              placeholder="Select recipient(s)..."
              className="shadow-sm"
              classNamePrefix="select"
            />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Subject</label>
            <input
              type="text"
              name="subject"
              className="form-control shadow-sm"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Project Update"
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Message</label>
            <textarea
              name="message"
              rows="6"
              className="form-control shadow-sm"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
            ></textarea>
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center gap-2">
              <MdAttachFile />
              Attach Files
            </label>
            <input
              type="file"
              name="files"
              multiple
              className="form-control shadow-sm"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2"
              disabled={sending}
            >
              <FaPaperPlane />
              {sending ? "Sending..." : "Send Mail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMail;
