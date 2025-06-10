// src/pages/VerifyOtp.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  otp: yup.string().required("OTP is required"),
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/verify-otp`, {
        email,
        otp: data.otp,
      });
      Swal.fire("Success", res.data.message, "success");
      localStorage.setItem("otp", data.otp);
      navigate("/reset-password");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Invalid OTP", "error");
    }
  };

  return (
    <div className="container mt-5">
      <h3>Verify OTP</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label>Enter OTP</label>
          <input className="form-control" {...register("otp")} />
          <small className="text-danger">{errors.otp?.message}</small>
        </div>
        <button className="btn btn-success">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
