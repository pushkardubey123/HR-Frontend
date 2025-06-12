import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Minimum 6 characters required"),
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
      navigate("/");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Reset failed", "error");
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="card shadow" style={cardStyle}>
        <div className="card-header text-center">
          <h4>Reset Password</h4>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-1">
                <FaLock /> <span>New Password</span>
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <small className="text-danger">{errors.newPassword.message}</small>
              )}
            </div>
          </div>
          <div className="card-footer text-end">
            <button type="submit" className="btn btn-secondary">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const backdropStyle = {
  backgroundImage: `url("https://img.freepik.com/free-photo/top-view-lock-with-password-keyboard_23-2148578100.jpg?ga=GA1.1.1970270771.1749550567&semt=ais_items_boosted&w=740")`,
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

export default ResetPassword;
