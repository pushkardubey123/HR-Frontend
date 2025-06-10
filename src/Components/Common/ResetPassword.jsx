// src/pages/ResetPassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  newPassword: yup.string().required("New password is required").min(6, "Min 6 characters"),
});

const ResetPassword = () => {
  const email = localStorage.getItem("email");
  const otp = localStorage.getItem("otp");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/reset-password`, {
        email,
        otp,
        newPassword: data.newPassword,
      });
      Swal.fire("Success", res.data.message, "success");
      localStorage.removeItem("email");
      localStorage.removeItem("otp");
      navigate("/login");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Reset failed", "error");
    }
  };

  return (
    <div className="container mt-5">
      <h3>Reset Password</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label>New Password</label>
          <input type="password" className="form-control" {...register("newPassword")} />
          <small className="text-danger">{errors.newPassword?.message}</small>
        </div>
        <button className="btn btn-warning">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
