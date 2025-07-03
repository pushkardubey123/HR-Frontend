import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

// ✅ Validation Schema
const schema = yup.object().shape({
  role: yup.string().required("Role is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  captcha: yup.string().required("Captcha is required"),
});

const Login = ({ onClose, onLoginSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Generate new captcha
  function generateCaptcha() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  const refreshCaptcha = () => setCaptcha(generateCaptcha());

  // ✅ Submit Handler
  const onSubmit = async (data) => {
    if (data.captcha !== captcha) {
      refreshCaptcha();
      return Swal.fire("Error", "Captcha doesn't match", "error");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, data);

      if (res.data.success) {
        const actualRole = res.data.data.role;

        // ✅ Role mismatch check
        if (actualRole.toLowerCase() !== data.role.toLowerCase()) {
          refreshCaptcha();
          setLoading(false);
          return Swal.fire(
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

        Swal.fire("Success", "Logged in successfully", "success");
        if (typeof onLoginSuccess === "function") onLoginSuccess();
        onClose();
        navigate(actualRole === "admin" ? "/admin/dashboard" : "/employee/dashboard");
      } else {
        Swal.fire("Error", res.data.message, "error");
        refreshCaptcha();
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Login failed", "error");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="d-flex w-100 flex-column flex-md-row" style={modalContainerStyle}>
        {/* Left Side Image */}
        <div className="w-100 w-md-50 d-none d-md-block">
          <img
            src="https://hrms.indianhr.in/assets/images/login-img.png"
            alt="login-banner"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Right Side Form */}
        <div className="w-100 w-md-50 bg-white d-flex flex-column justify-content-center align-items-center p-4" style={{ maxWidth: 400 }}>
          <h4 className="fw-bold text-center mb-4">HRMS LOGIN</h4>
          <form className="w-100" onSubmit={handleSubmit(onSubmit)}>

            {/* Role Field */}
            <select className="form-control rounded-pill mb-2" {...register("role")}>
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
            {errors.role && <small className="text-danger d-block mb-2">{errors.role.message}</small>}

            {/* Email */}
            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Email"
              {...register("email")}
            />
            {errors.email && <small className="text-danger d-block mb-2">{errors.email.message}</small>}

            {/* Password */}
            <input
              type="password"
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Password"
              {...register("password")}
            />
            {errors.password && <small className="text-danger d-block mb-2">{errors.password.message}</small>}

            {/* Captcha Input */}
            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the captcha"
              {...register("captcha")}
            />
            {errors.captcha && <small className="text-danger d-block mb-2">{errors.captcha.message}</small>}

            {/* Captcha Display */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="border rounded-pill px-3 py-1" style={{ fontFamily: "monospace", background: "#f0f0f0" }}>
                {captcha}
              </div>
              <span
                onClick={refreshCaptcha}
                style={{ cursor: "pointer", color: "#007bff", fontSize: 14 }}
              >
                Refresh Captcha
              </span>
            </div>

            {/* Remember Me */}
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill fw-bold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            {/* Footer Links */}
            <div className="text-center mt-3 d-flex align-items-center justify-content-between">
              <Link to="/register" onClick={onClose} className="text-decoration-none">
                Not Registered?
              </Link>
              <div className="d-flex align-items-center gap-1">
                <FaLock />
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-decoration-none text-primary"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ✅ Styles
const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalContainerStyle = {
  width: "90%",
  maxWidth: "900px",
  height: "500px",
  backgroundColor: "#fff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
};

export default Login;
