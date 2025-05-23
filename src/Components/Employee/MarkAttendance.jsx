import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);

 const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0"); // 00–23
  const minutes = now.getMinutes().toString().padStart(2, "0"); // 00–59
  return `${hours}:${minutes}`; // Example: "15:30"
};


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const employeeId = user?.id;
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(`attendanceMarkedDate_${employeeId}`);

    if (storedDate === today) {
      setMarkedToday(true);
    }
  }, []);

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
        try {
          const { latitude, longitude } = position.coords;
          const inTime = getCurrentTime();

          const res = await axios.post(
            "http://localhost:3003/api/attendance/mark",
            { employeeId, latitude, longitude, inTime },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log(res)
          const today = new Date().toDateString();
          if (res.data.success) {
            setMarkedToday(true);
            localStorage.setItem(`attendanceMarkedDate_${employeeId}`, today);
            Swal.fire("Success", res.data.message, "success");
          } else {
            const msg = res.data.message;
            if (msg === "Attendance already marked for today") {
              setMarkedToday(true);
              localStorage.setItem(`attendanceMarkedDate_${employeeId}`, today);
              Swal.fire("Already Marked", "You have already marked attendance for today!", "info");
            } else if (msg === "You are outside the allowed office location") {
              Swal.fire("Out of Range", "You are not within office GPS range!", "error");
            } else {
              Swal.fire("Error", msg || "Something went wrong", "error");
            }
          }
        } catch (error) {
          const serverMessage = error.response?.data?.message;
          const today = new Date().toDateString();

          if (serverMessage === "Attendance already marked for today") {
            setMarkedToday(true);
            localStorage.setItem(`attendanceMarkedDate_${employeeId}`, today);
            Swal.fire("Already Marked", "You have already marked attendance for today!", "info");
          } else if (serverMessage === "You are outside the allowed office location") {
            Swal.fire("Out of Range", "You are not within office GPS range!", "error");
          } else {
            Swal.fire("Error", serverMessage || "Something went wrong", "error");
          }
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        Swal.fire("Error", "Unable to fetch your location", "error");
      }
    );
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
              Marked <FaCheckCircle />
            </span>
          ) : (
            <span className="text-muted fw-medium d-inline-flex align-items-center gap-2">
              Not Marked <FaRegCircle />
            </span>
          )}
        </h5>

        <button
          className="btn btn-success"
          onClick={handleMark}
          disabled={loading || markedToday}
        >
          {loading ? "Marking..." : "Mark Attendance"}
        </button>
      </div>
    </EmployeeLayout>
  );
};

export default MarkAttendance;
