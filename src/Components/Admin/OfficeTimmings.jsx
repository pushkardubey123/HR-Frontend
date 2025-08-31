import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

const OfficeTiming = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [message, setMessage] = useState("");

  const fetchTiming = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings/timing`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setStart(res.data.data.officeStart);
        setEnd(res.data.data.officeEnd);
      }
    } catch (err) {
      console.log("No timing set");
    }
  };

  const saveTiming = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/settings/timing`,
        {
          officeStart: start,
          officeEnd: end,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage("Failed to save timing");
    }
  };

  useEffect(() => {
    fetchTiming();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h4 className="fw-bold mb-3">Set Office Timing</h4>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label>Office Start Time</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label>Office End Time</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button onClick={saveTiming} className="btn btn-success w-100">
              Save Timing
            </button>
          </div>
        </div>

        <div className="alert alert-secondary">
          <strong>Current Timing:</strong> {start} to {end}
        </div>

        {message && <div className="alert alert-info">{message}</div>}
      </div>
    </AdminLayout>
  );
};

export default OfficeTiming;
