import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBell, FaPaperPlane, FaImage } from "react-icons/fa";
import AdminLayout from "./AdminLayout";

const templates = {
  "New Announcement": {
    message:
      "{announcement_title} announcement created for branch {branch_name} from {start_date} to {end_date}",
    placeholders: [
      "announcement_title",
      "branch_name",
      "start_date",
      "end_date",
    ],
  },
  "New Meeting": {
    message:
      "Meeting scheduled on {meeting_date} at {meeting_time} with {team_name}",
    placeholders: ["meeting_date", "meeting_time", "team_name"],
  },
  "New Award": {
    message: "Awarded {employee_name} with {award_title} on {award_date}",
    placeholders: ["employee_name", "award_title", "award_date"],
  },
  "New Holidays": {
    message: "Holiday: {holiday_name} from {start_date} to {end_date}",
    placeholders: ["holiday_name", "start_date", "end_date"],
  },
  "New Company Policy": {
    message: "New Policy '{policy_title}' effective from {start_date}",
    placeholders: ["policy_title", "start_date"],
  },
};

const SendNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState("info");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [template, setTemplate] = useState("");
  const [templateValues, setTemplateValues] = useState({});

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data.data || []);
      } catch (err) {
        Swal.fire("Error", "Failed to load employees", "error");
      }
    };
    fetchEmployees();
  }, [token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      Swal.fire("Error", "Title and Message are required", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("recipient", recipient || "all");
    formData.append("type", type);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/send`,
        formData
      );
      Swal.fire("Success", res.data.message, "success");
      setTitle("");
      setMessage("");
      setRecipient("");
      setImage(null);
      setPreview(null);
      setTemplate("");
      setTemplateValues({});
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Send failed", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleTemplateChange = (e) => {
    const selected = e.target.value;
    setTemplate(selected);
    setTemplateValues({});
    if (templates[selected]) {
      setMessage(templates[selected].message);
    } else {
      setMessage("");
    }
  };

  const handlePlaceholderChange = (key, value) => {
    const updatedValues = { ...templateValues, [key]: value };
    setTemplateValues(updatedValues);

    const rawTemplate = templates[template]?.message || "";
    let newMessage = rawTemplate;

    for (let k in updatedValues) {
      newMessage = newMessage.replaceAll(`{${k}}`, updatedValues[k]);
    }
    setMessage(newMessage);
  };

  return (
    <AdminLayout>
      <div className="container">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header bg-dark text-white fw-bold fs-5 py-3 rounded-top-4 d-flex align-items-center">
            <FaBell className="me-2" />
            Send Notification
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSend} encType="multipart/form-data">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Select Template
                </label>
                <select
                  className="form-select rounded-3"
                  value={template}
                  onChange={handleTemplateChange}
                >
                  <option value="">-- Choose a Template --</option>
                  {Object.keys(templates).map((temp) => (
                    <option key={temp} value={temp}>
                      {temp}
                    </option>
                  ))}
                </select>
              </div>

              {templates[template]?.placeholders?.map((ph) => (
                <div className="mb-3" key={ph}>
                  <label className="form-label fw-semibold text-capitalize">
                    {ph.replace("_", " ")}
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder={`Enter ${ph}`}
                    value={templateValues[ph] || ""}
                    onChange={(e) =>
                      handlePlaceholderChange(ph, e.target.value)
                    }
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Notification Title
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                <textarea
                  rows="4"
                  className="form-control rounded-3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter notification message"
                ></textarea>
              </div>

              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold">Recipient</label>
                  <select
                    className="form-select rounded-3"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  >
                    <option value="">-- Select Employee --</option>
                    <option value="all">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label fw-semibold">Type</label>
                  <select
                    className="form-select rounded-3"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <FaImage /> Upload Image
                </label>
                <input
                  type="file"
                  className="form-control rounded-3"
                  onChange={handleImageChange}
                />
                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="img-thumbnail border rounded-4 shadow-sm"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              <div className="text-end mt-4">
                <button
                  type="submit"
                  className="btn btn-success px-4 py-2 rounded-3 fw-semibold d-flex text-align-center"
                >
                  <FaPaperPlane className="me-2" />
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SendNotification;
