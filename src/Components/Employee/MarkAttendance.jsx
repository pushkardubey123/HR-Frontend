import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import { FaCheckCircle, FaRegCircle, FaSignInAlt, FaSignOutAlt, FaClock } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { MdDoneOutline } from "react-icons/md";

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);
  const [inOutLogs, setInOutLogs] = useState([]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const employeeId = user?.id;
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(`attendanceMarkedDate_${employeeId}`);

    if (storedDate === today) {
      setMarkedToday(true);
    }

    fetchTodayLogs(employeeId);
  }, []);

  const fetchTodayLogs = async (employeeId) => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await axios.get(`http://localhost:3003/api/attendance/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const today = new Date().toDateString();
        const todayLog = res.data.data.find(log => new Date(log.date).toDateString() === today);
        if (todayLog) {
          setInOutLogs(todayLog.inOutLogs || []);
        }
      }
    } catch (err) {
      console.error("Fetch logs failed:", err);
    }
  };

  const handleMark = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    const employeeId = user?.id;

    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation is not supported by your browser", "error");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const inTime = getCurrentTime();

        try {
          const res = await axios.post(
            "http://localhost:3003/api/attendance/mark",
            { employeeId, latitude, longitude, inTime },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const today = new Date().toDateString();
          if (res.data.success) {
            setMarkedToday(true);
            localStorage.setItem(`attendanceMarkedDate_${employeeId}`, today);
            Swal.fire("Success", res.data.message, "success");
            fetchTodayLogs(employeeId);
          } else {
            Swal.fire("Error", res.data.message, "error");
          }
        } catch (err) {
          const msg = err.response?.data?.message;
          Swal.fire("Error", msg || "Something went wrong", "error");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        Swal.fire("Error", "Unable to fetch location", "error");
      }
    );
  };

  const handleCheck = async (type) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const employeeId = user?.id;
    const token = user?.token;

    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation not supported", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await axios.post(
          "http://localhost:3003/api/attendance/session",
          {
            employeeId,
            latitude,
            longitude,
            actionType: type,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          Swal.fire("Success", `${type === "in" ? "Checked In" : "Checked Out"} successfully`, "success");
          fetchTodayLogs(employeeId);
        } else {
          Swal.fire("Error", res.data.message, "error");
        }
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
      }
    });
  };

  return (
    <EmployeeLayout>
      <div className="container mt-5 text-center">
        <h3 className="mb-4 fw-bold d-inline-flex align-items-center gap-2">
          <FaLocationCrosshairs />
          GPS Attendance
        </h3>

        <h5 className="mb-4">
          Attendance Status:{" "}
          {markedToday ? (
            <span className="text-success fw-bold d-inline-flex align-items-center gap-2">
              Marked <MdDoneOutline />
            </span>
          ) : (
            <span className="text-muted fw-medium d-inline-flex align-items-center gap-2">
              Not Marked <FaRegCircle />
            </span>
          )}
        </h5>

        <button
          className="btn btn-success mb-3 d-flex align-items-center justify-content-center mx-auto gap-2"
          onClick={handleMark}
          disabled={loading || markedToday}
        >
          <FaCheckCircle />
          {loading ? "Marking..." : "Mark Attendance"}
        </button>

        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => handleCheck("in")}>
            <FaSignInAlt /> Check In
          </button>
          <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={() => handleCheck("out")}>
            <FaSignOutAlt /> Check Out
          </button>
        </div>

        {inOutLogs.length > 0 && (
          <div className="mt-4 text-start">
            <h5 className="text-decoration-underline d-flex align-items-center gap-2">
              <FaClock /> In/Out Session Logs
            </h5>
            <table className="table table-bordered mt-2 text-center">
              <thead className="table-secondary">
                <tr>
                  <th>S No.</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                </tr>
              </thead>
              <tbody>
                {inOutLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{log.inTime}</td>
                    <td>{log.outTime || "Still In"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default MarkAttendance;
