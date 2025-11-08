import React, { useEffect, useState } from "react";
import { getJobs } from "./jobApi";
import { useNavigate } from "react-router-dom";
import { FaInfoCircle, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";

const UserJobLists = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const data = await getJobs();
      setJobs(data);
    };
    fetchJobs();
  }, []);

  const getTagColor = (job) => {
    const today = new Date();
    const start = new Date(job.startDate);
    const diff = (start - today) / (1000 * 60 * 60 * 24);
    if (diff <= 7) return "bg-red-500";
    if (diff <= 30) return "bg-indigo-500";
    return "bg-blue-500";
  };

  return (
    <div
      className="min-h-screen p-8 bg-cover bg-center relative"
      style={{
        backgroundImage: 'url("https://wallpapercave.com/wp/wp3616209.jpg")',
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

      <div className="relative z-10">
        <h2 className="text-5xl font-extrabold mb-10 text-white text-center flex justify-center items-center gap-2">
          <BiDetail /> Job Openings
        </h2>
        <hr className="border-gray-300 mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div
                key={job._id}
                className="relative bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-3 transform transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`absolute top-4 right-4 text-white px-3 py-1 rounded-full text-sm font-semibold ${getTagColor(
                    job
                  )} shadow-lg`}
                >
                  {getTagColor(job) === "bg-red-500"
                    ? "Urgent"
                    : getTagColor(job) === "bg-indigo-500"
                    ? "New"
                    : "Open"}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-gray-800 text-xl font-bold">
                    <FaBriefcase className="text-yellow-400" />
                    {job.title}
                  </div>
                  {job.companyId && (
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Company:</strong> {job.companyId.name || "N/A"}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaCalendarAlt className="text-green-400" />
                    <span>
                      <strong>Start:</strong>{" "}
                      {new Date(job.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 mb-5">
                    <FaCalendarAlt className="text-red-400" />
                    <span>
                      <strong>End:</strong>{" "}
                      {new Date(job.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-500 transition-all duration-300"
                  >
                    <FaInfoCircle /> View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white text-xl p-6">
              No job openings available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserJobLists;
