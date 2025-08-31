import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";

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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/verify-otp`,
        {
          email,
          otp: data.otp,
        }
      );
      Swal.fire("Success", res.data.message, "success");
      localStorage.setItem("otp", data.otp);
      navigate("/reset-password");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Invalid OTP", "error");
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="card shadow" style={cardStyle}>
        <div className="card-header text-center">
          <h4>Verify OTP</h4>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-1">
                <FaKey /> <span>Enter OTP</span>
              </label>
              <input
                className="form-control"
                placeholder="Enter the OTP"
                {...register("otp")}
              />
              {errors.otp && (
                <small className="text-danger">{errors.otp.message}</small>
              )}
            </div>
          </div>
          <div className="card-footer text-end">
            <button type="submit" className="btn btn-success">
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const backdropStyle = {
  backgroundImage: `url('https://img.freepik.com/free-vector/enter-otp-concept-illustration_114360-7867.jpg?semt=ais_items_boosted&w=740')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "1rem",
};

const cardStyle = {
  width: "100%",
  maxWidth: "400px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.95)",
};

export default VerifyOtp;
