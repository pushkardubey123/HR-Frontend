import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import "./CreateMeetingForm.css";
import { useNavigate } from "react-router-dom";
import { MdMeetingRoom } from "react-icons/md";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  date: yup.string().required("Date is required"),
  startTime: yup.string().required("Start Time is required"),
  endTime: yup.string().required("End Time is required"),
  participants: yup.array().min(1, "Select at least one participant"),
});

const CreateMeetingForm = () => {
  const [users, setUsers] = useState([]);
  const navigate= useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/user`, getHeaders())
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const options = res.data.data.map((user) => ({
            value: user._id,
            label: `${user.name} (${user.email})`,
          }));
          setUsers(options);
        } else {
          throw new Error("Unexpected user data format");
        }
      })
      .catch((err) => {
        console.error("Failed to load participants:", err);
        Swal.fire("Error", "Failed to load participants", "error");
      });
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        participants: data.participants.map((p) => p.value),
        sendEmail: data.sendEmail || false,
        sendReminder: data.sendReminder || false,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/meeting/create`,
        payload,
        getHeaders()
      );

      if (res.data.success) {
        Swal.fire("Success", "Meeting created successfully", "success");
        reset();
        navigate("/admin/meeting-calender")

      } else {
        Swal.fire("Error", res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      console.error("Error creating meeting:", err);
      Swal.fire("Error", "Failed to create meeting", "error");
    }
  };

return (
  <AdminLayout>
    <div className="meeting-container">
      <div className="meeting-header pb-5"><MdMeetingRoom className="me-1"/> Schedule Meeting</div>
      <form onSubmit={handleSubmit(onSubmit)} className="meeting-section">
        <label>Meeting Title</label>
        <div>
          <input {...register("title")} className="form-input" placeholder="Enter title" />
          <p className="error">{errors.title?.message}</p>
        </div>

        <label>Description</label>
        <div>
          <textarea
            {...register("description")}
            className="form-input"
            rows={3}
            placeholder="Meeting description"
          />
          <p className="error">{errors.description?.message}</p>
        </div>

        <label>Date</label>
        <div>
          <input type="date" {...register("date")} className="form-input" />
          <p className="error">{errors.date?.message}</p>
        </div>

        <label>Start Time</label>
        <div>
          <input type="time" {...register("startTime")} className="form-input" />
          <p className="error">{errors.startTime?.message}</p>
        </div>

        <label>End Time</label>
        <div>
          <input type="time" {...register("endTime")} className="form-input" />
          <p className="error">{errors.endTime?.message}</p>
        </div>

        <label>Participants</label>
        <div>
          <Controller
            name="participants"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={users}
                className="select-wrapper"
                classNamePrefix="select"
                placeholder="Select participants"
              />
            )}
          />
          <p className="error">{errors.participants?.message}</p>
        </div>

        <div></div>
        <div className="checkboxes">
          <label>
            <input type="checkbox" {...register("sendEmail")} />
            Send Email Notification
          </label>
          <label>
            <input type="checkbox" {...register("sendReminder")} />
            Send Reminder
          </label>
        </div>

        <div></div>
        <button type="submit" className="submit-btn">Create Meeting</button>
      </form>
    </div>
  </AdminLayout>
);


};

export default CreateMeetingForm;
