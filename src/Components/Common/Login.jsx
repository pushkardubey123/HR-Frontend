import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUserTag, FaEye, FaEyeSlash } from "react-icons/fa";

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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        data
      );

      if (res.data.success === true) {
        const actualRole = res.data.data.role;

        if (actualRole.toLowerCase() !== data.role.toLowerCase()) {
          setLoading(false);
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

        navigate(actualRole === "admin" ? "/admin/dashboard" : "/employee/dashboard");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="card shadow" style={modalStyle}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Login</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            {/* Role Field */}
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2">
                <FaUserTag /> <span>Role</span>
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

            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2">
                <FaEnvelope /> <span>Email</span>
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

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2">
                <FaLock /> <span>Password</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter password"
                  {...register("password")}
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <small className="text-danger">{errors.password.message}</small>
              )}
            </div>
          </div>

          <div className="card-footer mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="mb-0">
                Not registered?{" "}
                <Link to="/register" onClick={onClose}>
                  Signup
                </Link>
              </p>
              <label className="form-label d-flex align-items-center gap-2">
                <FaLock />
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  style={{ textDecoration: "none", color: "#0d6efd", fontWeight: "500" }}
                >
                  <span>Forgot Password?</span>
                </Link>
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
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

const modalStyle = {
  width: "100%",
  maxWidth: "400px",
};

export default Login;
