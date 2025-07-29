import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FaCalendarAlt, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import EmployeeLayout from "./EmployeeLayout";


const MySwal = withReactContent(Swal);

const EmployeeEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const employeeId = user?.id;

  useEffect(() => {
    if (employeeId) {
      fetchEvents();
    }
  }, [employeeId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3003/api/events/employee/${employeeId}`
      );
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewEventDetails = (event) => {
    MySwal.fire({
      title: `<strong>${event.title}</strong>`,
      html: `
        <p><strong>Description:</strong> ${event.description}</p>
        <p><strong>Start:</strong> ${moment(event.startDate).format("LL")}</p>
        <p><strong>End:</strong> ${moment(event.endDate).format("LL")}</p>
        <p><strong>Departments:</strong> ${event.departmentId.map((d) => d.name).join(", ")}</p>
        <p><strong>Created By:</strong> ${event.createdBy?.name}</p>
      `,
      confirmButtonText: "Close",
    });
  };

  return (
    <>
    <EmployeeLayout>
            <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaCalendarAlt /> My Events
      </h2>

      {loading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-400">No events available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => viewEventDetails(event)}
                >
                  <FaEye />
                </button>
              </div>
              <p className="text-gray-600 text-sm">
                {moment(event.startDate).format("MMM D")} -{" "}
                {moment(event.endDate).format("MMM D, YYYY")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {event.description.slice(0, 60)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </EmployeeLayout>
    </>

  );
};

export default EmployeeEvents;
