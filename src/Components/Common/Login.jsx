import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";

const schema = yup.object().shape({
  role: yup.string().required("Role is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = ({ onClose, onLoginSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      customClass: { container: "custom-swal-zindex" },
    });
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        data
      );
      if (res.data.success === true) {
        const actualRole = res.data.data.role;

        if (actualRole.toLowerCase() !== data.role.toLowerCase()) {
          return showAlert(
            "Access Denied",
            `You are registered as ${actualRole}, but selected ${data.role}`,
            "error"
          );
        }

        localStorage.setItem(
          "user",
          JSON.stringify({
            role: actualRole,
            token: res.data.token,
            id: res.data.data.id,
            username: res.data.data.name,
          })
        );

        await showAlert("Success", "Logged in successfully", "success");

        if (typeof onLoginSuccess === "function") onLoginSuccess();

        onClose();
        console.log(actualRole);
        if (actualRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/employee/dashboard");
        }
      } else {
        showAlert("Failed", res.data.message, "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert(
        "Error",
        err.response?.data?.message || "Login failed",
        "error"
      );
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="card shadow" style={modalStyle}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Login</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">
                <FaUserTag className="me-1" /> Role
              </label>
              <select className="form-select" {...register("role")}>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
              {errors.role && (
                <small className="text-danger">{errors.role.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <FaEnvelope className="me-1" /> Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                {...register("email")}
              />
              {errors.email && (
                <small className="text-danger">{errors.email.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <FaLock className="me-1" /> Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                {...register("password")}
              />
              {errors.password && (
                <small className="text-danger">{errors.password.message}</small>
              )}
            </div>
          </div>
          <div className="card-footer flex justify-around mt-3">
            <p>
              Not registered?{" "}
              <Link to="/register" onClick={onClose}>
                Signup
              </Link>
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};
const modalStyle = { width: "100%", maxWidth: "400px" };

export default Login;
