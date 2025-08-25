import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL; 

export const getJobs = async () => {
  const res = await axios.get(`${BASE_URL}/api/jobs`);
  return res.data.data;
};

export const getJobById = async (id) => {
  const res = await axios.get(`${BASE_URL}/api/jobs/${id}`);
  return res.data.data;
};

export const applyJob = async (formData) => {
  const res = await axios.post(`${BASE_URL}/api/applications/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data.data;
};
