import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import AdminLayout from "./AdminLayout";
import "./EventManagement.css";
import { BiCalendarEvent } from "react-icons/bi";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };
 const token = JSON.parse(localStorage.getItem("user"))?.token;
const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

const handleAddEvent = async () => {
  try {
    const [departmentsRes, employeesRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/departments`),
      axios.get(`${import.meta.env.VITE_API_URL}/user`, getHeaders())
    ]);

    const departments = departmentsRes.data.data;
    console.log(departments);
    const employees = employeesRes.data.data;
    console.log(employees);

    Swal.fire({
      title: "<h3 style='color:#2c3e50;margin-bottom:10px;'>📅 Add New Event</h3>",
      width: 700,
      html: `
        <div style="text-align: left; font-family: 'Segoe UI'; padding: 5px 20px;">
          <label style="margin-top: 8px; display:block;">Title <span style="color:red">*</span></label>
          <input type="text" id="title" class="swal2-input" placeholder="Event Title" style="width:100%; margin-bottom:10px;" />

          <label style="margin-top: 8px; display:block;">Description</label>
          <textarea id="desc" class="swal2-textarea" placeholder="Description" style="width:100%; height:70px; margin-bottom:10px;"></textarea>

          <label style="margin-top: 8px; display:block;">Start Date <span style="color:red">*</span></label>
          <input type="date" id="start" class="swal2-input" style="width:100%; margin-bottom:10px;" />

          <label style="margin-top: 8px; display:block;">End Date <span style="color:red">*</span></label>
          <input type="date" id="end" class="swal2-input" style="width:100%; margin-bottom:10px;" />

          <label style="margin-top: 8px; display:block;">Select Departments</label>
          <select id="departments" multiple class="swal2-select" style="width:100%; height:90px; padding:6px; border:1px solid #ccc; border-radius:4px;">
            <option value="all">All Departments</option>
            ${departments.map(dep => `<option value="${dep._id}">${dep.name}</option>`).join("")}
          </select>

          <label style="margin-top: 12px; display:block;">Select Employees</label>
          <select id="employees" multiple class="swal2-select" style="width:100%; height:90px; padding:6px; border:1px solid #ccc; border-radius:4px;">
            <option value="all">All Employees</option>
            ${employees.map(emp => `<option value="${emp._id}">${emp.name}</option>`).join("")}
          </select>
        </div>
      `,
      customClass: {
        popup: 'swal2-event-popup'
      },
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("desc").value.trim();
        const startDate = document.getElementById("start").value;
        const endDate = document.getElementById("end").value;

        const selectedDepartments = Array.from(document.getElementById("departments").selectedOptions).map(o => o.value);
        const selectedEmployees = Array.from(document.getElementById("employees").selectedOptions).map(o => o.value);

        if (!title || !startDate || !endDate) {
          Swal.showValidationMessage("Please fill all required fields (*)");
          return false;
        }

        const departmentId = selectedDepartments.includes("all")
          ? departments.map(dep => dep._id)
          : selectedDepartments;

        const employeeId = selectedEmployees.includes("all")
          ? employees.map(emp => emp._id)
          : selectedEmployees;

        return {
          title,
          description,
          startDate,
          endDate,
          departmentId,
          employeeId,
          createdBy: user?.id
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("🔍 Sending this to backend:", result.value);
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/events/create`, result.value, getHeaders());
          fetchEvents();
          Swal.fire("✅ Success", "Event created successfully!", "success");
        } catch (error) {
          console.error("❌ Axios Error:", error.response?.data || error.message);
          Swal.fire("❌ Failed", "Something went wrong while creating the event.", "error");
        }
      }
    });

  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    Swal.fire("❌ Error", "Failed to load departments or employees", "error");
  }
};



  const renderCalendar = () => {
    const today = moment();
    const start = currentMonth.clone().startOf("month").startOf("week");
    const end = currentMonth.clone().endOf("month").endOf("week");
    const day = start.clone();
    const rows = [];

    while (day.isBefore(end)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = day.clone();
        const isToday = currentDay.isSame(today, "day");

        const dayEvents = events.filter((e) =>
          currentDay.isBetween(moment(e.startDate), moment(e.endDate), "day", "[]")
        );

        week.push(
          <td key={currentDay} className={`calendar-cell ${isToday ? "today" : ""}`}>
            <div className="date-number">{currentDay.date()}</div>
            <div className="events-container">
{dayEvents.map((e, idx) => (
  <div
    key={idx}
    className="event-chip"
    title={e.title}
onClick={() =>
  Swal.fire({
    title: "Event Details",
    html: `
      <input type="text" id="edit-title" class="swal2-input" value="${e.title}" placeholder="Title">
      <textarea id="edit-desc" class="swal2-textarea" placeholder="Description">${e.description || ""}</textarea>
      <input type="date" id="edit-start" class="swal2-input" value="${moment(e.startDate).format("YYYY-MM-DD")}">
      <input type="date" id="edit-end" class="swal2-input" value="${moment(e.endDate).format("YYYY-MM-DD")}">
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    cancelButtonText: "Close",
    showDenyButton: true,
    denyButtonText: "Delete",
    preConfirm: () => {
      const title = document.getElementById("edit-title").value;
      const description = document.getElementById("edit-desc").value;
      const startDate = document.getElementById("edit-start").value;
      const endDate = document.getElementById("edit-end").value;

      if (!title || !startDate || !endDate) {
        Swal.showValidationMessage("All fields are required");
        return false;
      }

      return { title, description, startDate, endDate };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Update event
      await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${e._id}`, result.value);
      fetchEvents();
      Swal.fire("Updated", "Event updated successfully", "success");
    } else if (result.isDenied) {
      // Confirm delete
      const confirmDelete = await Swal.fire({
        title: "Are you sure?",
        text: "This event will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmDelete.isConfirmed) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${e._id}`);
        fetchEvents();
        Swal.fire("Deleted", "Event deleted successfully", "success");
      }
    }
  })
}

  >
    {e.title}
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

  const upcomingEvents = events.filter((e) =>
    moment(e.startDate).isSameOrAfter(moment(), "day")
  );

  return (
    <AdminLayout>
      <div className="calendar-container">
        <div className="calendar-top">
          <h2 className="d-flex text-align-center "><BiCalendarEvent className="mt-1 me-1 text-primary"/>{currentMonth.format("MMMM YYYY")}</h2>
          <h2 className="d-flex justify-center">Celender</h2>
          <div className="calendar-buttons">
            <button onClick={prevMonth}>←</button>
            <button onClick={nextMonth}>→</button>
            <button onClick={goToday}>Today</button>
            <button onClick={handleAddEvent}>+ Add Event</button>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-main">
            <table className="calendar-table">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderCalendar()}</tbody>
            </table>
          </div>

          <div className="calendar-sidebar">
            <h3 className="d-flex text-align-center"><BsPinAngleFill className="mt-1 me-1"/> Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="no-event">No upcoming events</p>
            ) : (
              upcomingEvents.map((e, idx) => (
                <div key={idx} className="upcoming-card">
                  <strong>{e.title}</strong>
                  <p>
                    {moment(e.startDate).format("MMM D")} -{" "}
                    {moment(e.endDate).format("MMM D")}
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

export default CalendarPage;
