import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { BiCalendarEvent } from "react-icons/bi";
import { BsPinAngleFill } from "react-icons/bs";
import "./EventManagement.css";

const MeetingCalendar = () => {
  const [meetings, setMeetings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/meeting/all`, headers);
      console.log(res)
      setMeetings(res.data.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

const handleEditDelete = (meeting) => {
  const participantsList = meeting.participants
    ?.map((p) => `<li><b>${p.name}</b> (${p.email})</li>`)
    .join("") || "<li>No participants</li>";

  Swal.fire({
    title: "Meeting Details",
    html: `
      <div style="display: flex; flex-direction: row; gap: 20px; text-align: left;">
        <div style="flex: 1;">
          <label><b>Title</b></label>
          <input id="title" class="swal2-input" value="${meeting.title}" />
          <label><b>Description</b></label>
          <textarea id="desc" class="swal2-textarea" placeholder="Description">${meeting.description || ""}</textarea>
          <label><b>Date</b></label>
          <input type="date" id="date" class="swal2-input" value="${moment(meeting.date).format("YYYY-MM-DD")}" />
        </div>
        <div style="flex: 1;">
          <label><b>Start Time</b></label>
          <input type="time" id="startTime" class="swal2-input" value="${meeting.startTime}" />
          <label><b>End Time</b></label>
          <input type="time" id="endTime" class="swal2-input" value="${meeting.endTime}" />
          <p style="margin-top: 10px;"><b>Google Meet:</b><br/>
            <a href="${meeting.googleMeetLink}" target="_blank" style="color:#2563eb; text-decoration:underline;">
              ${meeting.googleMeetLink}
            </a>
          </p>
          <p style="margin-top: 10px;"><b>Participants:</b></p>
          <ul style="padding-left: 1rem; font-size: 13px; max-height: 100px; overflow-y: auto;">
            ${participantsList}
          </ul>
        </div>
      </div>
    `,
    width: "800px",
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Update",
    denyButtonText: "Delete",
    cancelButtonText: "Close",
    preConfirm: () => {
      const updated = {
        title: document.getElementById("title").value,
        description: document.getElementById("desc").value,
        date: document.getElementById("date").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
      };
      if (!updated.title || !updated.date || !updated.startTime || !updated.endTime) {
        Swal.showValidationMessage("All fields are required.");
        return false;
      }
      return updated;
    }
  }).then(async (res) => {
    if (res.isConfirmed) {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/meeting/update/${meeting._id}`, res.value, headers);
      Swal.fire("✅ Updated", "Meeting updated successfully", "success");
      fetchMeetings();
    } else if (res.isDenied) {
      const confirm = await Swal.fire({
        title: "Confirm Delete",
        text: "Are you sure you want to delete this meeting?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it"
      });
      if (confirm.isConfirmed) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/meeting/delete/${meeting._id}`, headers);
        Swal.fire("🗑️ Deleted", "Meeting has been deleted", "success");
        fetchMeetings();
      }
    }
  });
};



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

        const dayMeetings = meetings.filter((m) =>
          currentDay.isSame(moment(m.date), "day")
        );

        week.push(
          <td key={currentDay} className={`calendar-cell ${isToday ? "today" : ""}`}>
            <div className="date-number">{currentDay.date()}</div>
            <div className="events-container">
              {dayMeetings.map((m, idx) => (
                <div
                  key={idx}
                  className="event-chip"
                  title={m.title}
                  onClick={() => handleEditDelete(m)}
                >
                  {m.title}
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

  const upcoming = meetings.filter((m) =>
    moment(m.date).isSameOrAfter(moment(), "day")
  );

  return (
    <AdminLayout>
      <div className="calendar-container">
        <div className="calendar-top">
          <h2 className="d-flex text-align-center"><BiCalendarEvent className="mt-1 me-1 text-primary" /> {currentMonth.format("MMMM YYYY")}</h2>
          <h2>Meeting Calendar</h2>
          <div className="calendar-buttons">
            <button onClick={prevMonth}>←</button>
            <button onClick={nextMonth}>→</button>
            <button onClick={goToday}>Today</button>
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
            <h3 className="d-flex text-align-center"><BsPinAngleFill className="mt-1 me-1" /> Upcoming Meetings</h3>
            {upcoming.length === 0 ? (
              <p className="no-event">No upcoming meetings</p>
            ) : (
              upcoming.map((m, idx) => (
                <div key={idx} className="upcoming-card">
                  <strong>{m.title}</strong>
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

export default MeetingCalendar;
