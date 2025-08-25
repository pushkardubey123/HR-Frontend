import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import AdminLayout from "../Admin/AdminLayout";
import { BiCalendarEvent } from "react-icons/bi";
import { BsPinAngleFill } from "react-icons/bs";
import "../Admin/EventManagement.css";

const InterviewCalendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [shortlisted, setShortlisted] = useState([]);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchShortlisted();
    fetchInterviews();
  }, []);

  const fetchShortlisted = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/applications`,
        headers
      );
      const onlyShortlisted = res.data.data.filter(
        (app) => app.status === "shortlisted"
      );
      setShortlisted(onlyShortlisted);
    } catch (err) {
      console.error("Error fetching shortlisted", err);
    }
  };

  // Fetch interviews
  const fetchInterviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/interviews`,
        headers
      );
      setInterviews(res.data.interviews || []);
    } catch (err) {
      console.error("Fetch error", err);
      setInterviews([]);
    }
  };

// Add new interview
const handleAddInterview = async () => {
  if (!shortlisted || shortlisted.length === 0) {
    return Swal.fire("⚠️ No candidates", "No shortlisted candidates available", "warning");
  }

  // Build select options using applicationId._id
  const options = shortlisted
    .map(
      (c) =>
        `<option value="${c.applicationId?._id || c._id || ""}">
          ${c.fullName || c.name || "Candidate"} - ${c.jobId?.title || ""}
        </option>`
    )
    .join("");

  const { value: formValues } = await Swal.fire({
    title: "📅 Schedule Interview",
    html: `
      <div style="display:flex; flex-direction:column; gap:12px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333;">
        <select id="applicationId" style="padding:10px; border-radius:8px; border:1px solid #ccc; font-size:14px;">
          <option value="">-- Select Candidate --</option>
          ${options}
        </select>
        <input id="title" class="swal2-input" placeholder="Interview Title" style="border-radius:8px; padding:10px; border:1px solid #ccc;" />
        <textarea id="desc" class="swal2-textarea" placeholder="Description" style="border-radius:8px; padding:10px; border:1px solid #ccc;"></textarea>
        <input id="date" type="date" class="swal2-input" style="border-radius:8px; padding:10px; border:1px solid #ccc;" />
        <input id="startTime" type="time" class="swal2-input" style="border-radius:8px; padding:10px; border:1px solid #ccc;" />
        <input id="endTime" type="time" class="swal2-input" style="border-radius:8px; padding:10px; border:1px solid #ccc;" />
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Schedule",
    cancelButtonText: "Cancel",
    width: 500,
    preConfirm: () => {
      const applicationId = document.getElementById("applicationId")?.value;
      const title = document.getElementById("title")?.value;
      const description = document.getElementById("desc")?.value;
      const date = document.getElementById("date")?.value;
      const startTime = document.getElementById("startTime")?.value;
      const endTime = document.getElementById("endTime")?.value;
      if (!applicationId) {
        Swal.showValidationMessage("Please select a candidate");
        return false;
      }
      if (!title || !date || !startTime || !endTime) {
        Swal.showValidationMessage("Please fill all required fields");
        return false;
      }

      return {
        applicationId: applicationId.trim(),
        title: title.trim(),
        description: description.trim(),
        date,
        startTime,
        endTime,
        mode: "Online",
      };
    },
  });

  if (formValues) {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/schedule`,
        formValues,
        headers
      );

      Swal.fire("Added", "Interview scheduled successfully", "success");
      fetchInterviews();
    } catch (err) {
      console.error("❌ Error scheduling interview:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to schedule interview",
        "error"
      );
    }
  }
};



const handleEditDelete = (interview) => {
  const getFileUrl = (filePath) => {
    if (!filePath) return "https://via.placeholder.com/120";
    return `${import.meta.env.VITE_API_URL}/static/${filePath.replace(/\\/g, "/").replace("uploads/", "")}`;
  };

  const app = interview.applicationId || {};

  Swal.fire({
    html: `
      <div style="display:flex; flex-wrap:wrap; gap:20px; min-width:680px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333;">
        
        <!-- Left Section: Candidate -->
        <div style="flex:1; min-width:200px; padding:20px; border-radius:12px; background: #f9f9f9; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <img src="${getFileUrl(app.profileImage)}" 
               alt="Candidate" 
               style="width:120px; height:120px; border-radius:50%; object-fit:cover; margin-bottom:15px; border:3px solid #1a73e8;" />
          <h2 style="margin:5px 0; font-weight:700; font-size:1.3rem;">${interview.candidateName || app.name || "-"}</h2>
          <p style="margin:3px 0; font-weight:500; color:#555;">${interview.title}</p>
          <p style="margin:5px 0; font-size:13px; color:#777;">${interview.description || "-"}</p>
          <p style="margin-top:8px; font-size:12px; color:#999;">${moment(interview.date).format("MMM D, YYYY")}</p>
        </div>

        <!-- Right Section: Details -->
        <div style="flex:1; min-width:250px; padding:20px; display:flex; flex-direction:column; justify-content:center; gap:10px; border-radius:12px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <p><strong>🕒 Start:</strong> ${interview.startTime}</p>
          <p><strong>🕒 End:</strong> ${interview.endTime}</p>
          <p><strong>💼 Job:</strong> ${interview.jobId?.title || "-"}</p>
          <p>
            <strong>🔗 Meet:</strong> 
            <a href="${interview.googleMeetLink || "#"}" target="_blank" style="color:#1a73e8; font-weight:600; text-decoration:underline;">
              ${interview.googleMeetLink ? "Join Meeting" : "N/A"}
            </a>
          </p>
        </div>

      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Update",
    denyButtonText: "Delete",
    width: 720,
    focusConfirm: false,
    background: "#fdfdfd",
  }).then(async (res) => {
    if (res.isConfirmed) {
      const updated = {
        title: interview.title,
        description: interview.description,
        date: moment(interview.date).format("YYYY-MM-DD"),
        startTime: interview.startTime,
        endTime: interview.endTime,
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/interviews/${interview._id}`,
        updated,
        headers
      );
      Swal.fire("✅ Updated", "Interview updated successfully", "success");
      fetchInterviews();
    } else if (res.isDenied) {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/interviews/${interview._id}`,
        headers
      );
      Swal.fire("🗑️ Deleted", "Interview deleted", "success");
      fetchInterviews();
    }
  });
};


  // Calendar rendering
  const renderCalendar = () => {
    const start = currentMonth.clone().startOf("month").startOf("week");
    const end = currentMonth.clone().endOf("month").endOf("week");
    const today = moment();
    const day = start.clone();
    const rows = [];

    while (day.isBefore(end)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = day.clone();
        const isToday = currentDay.isSame(today, "day");

        const dayInterviews = interviews.filter((m) =>
          currentDay.isSame(moment(m.date), "day")
        );

        week.push(
          <td key={currentDay} className={`calendar-cell ${isToday ? "today" : ""}`}>
            <div className="date-number">{currentDay.date()}</div>
            <div className="events-container">
              {dayInterviews.map((m, idx) => (
                <div
                  key={idx}
                  className="event-chip"
                  onClick={() => handleEditDelete(m)}
                >
                  {m.title} {m.candidateId?.fullName ? `- ${m.candidateId.fullName}` : ""}
                </div>
              ))}
            </div>
          </td>
        );
        day.add(1, "day");
      }
      rows.push(<tr key={day}>{week}</tr>);
    }
    return rows;
  };

  const nextMonth = () => setCurrentMonth(currentMonth.clone().add(1, "month"));
  const prevMonth = () => setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  const goToday = () => setCurrentMonth(moment());

  const upcoming = interviews.filter((m) =>
    moment(m.date).isSameOrAfter(moment(), "day")
  );

  return (
    <AdminLayout>
      <div className="calendar-container">
        <div className="calendar-top">
          <h2 className="d-flex align-item-center">
            <BiCalendarEvent className="me-2 mt-1" /> {currentMonth.format("MMMM YYYY")}
          </h2>
          <h2>Interview Calendar</h2>
          <div className="calendar-buttons">
            <button onClick={prevMonth}>←</button>
            <button onClick={nextMonth}>→</button>
            <button onClick={goToday}>Today</button>
            <button onClick={handleAddInterview} className="btn btn-primary">
              + Add
            </button>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-main">
            <table className="calendar-table">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderCalendar()}</tbody>
            </table>
          </div>

          <div className="calendar-sidebar">
            <h3 className="d-flex align-item-center">
              <BsPinAngleFill className="me-2 mt-1" /> Upcoming Interviews
            </h3>
            {upcoming.length === 0 ? (
              <p className="no-event">No upcoming interviews</p>
            ) : (
              upcoming.map((m, idx) => (
                <div key={idx} className="upcoming-card">
                  <strong>
                    {m.title} {m.candidateId?.fullName ? `- ${m.candidateId.fullName}` : ""}
                  </strong>
                  <p>
                    {moment(m.date).format("MMM D")} — {m.startTime} to {m.endTime}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InterviewCalendar;
