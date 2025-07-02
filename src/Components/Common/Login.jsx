import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  captcha: yup.string().required("Captcha is required"),
});

const Login = ({ onClose, onLoginSuccess }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [captcha, setCaptcha] = useState("otutg");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const refreshCaptcha = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newCaptcha = "";
    for (let i = 0; i < 5; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(newCaptcha);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const onSubmit = async (data) => {
    if (data.captcha !== captcha) {
      refreshCaptcha();
      setError("captcha", { message: "Captcha doesn't match" });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, data);
      if (res.data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            role: res.data.data.role,
            token: res.data.token,
            id: res.data.data.id,
            username: res.data.data.name,
          })
        );

        Swal.fire("Success", "Logged in successfully", "success");
        if (typeof onLoginSuccess === "function") onLoginSuccess();
        onClose();
        navigate(res.data.data.role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
      } else {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="d-flex w-100 flex-column flex-md-row" style={modalContainerStyle}>
        {/* Left image (hidden on mobile) */}
        <div className="w-50 d-none d-md-block">
          <img
            src="https://hrms.indianhr.in/assets/images/login-img.png"
            alt="login-img"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="w-100 w-md-50 bg-white d-flex flex-column justify-content-center align-items-center p-4" style={{ maxWidth: 400 }}>
          <h4 className="fw-bold text-center mb-4">LOGIN</h4>

          <form className="w-100" onSubmit={handleSubmit(onSubmit)}>
            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Email"
              {...register("email")}
            />
            {errors.email && <small className="text-danger d-block mb-2">{errors.email.message}</small>}

            <input
              type="password"
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Password"
              {...register("password")}
            />
            {errors.password && <small className="text-danger d-block mb-2">{errors.password.message}</small>}

            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the captcha"
              {...register("captcha")}
            />
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="border rounded-pill px-3 py-1"
                style={{ fontFamily: "monospace", background: "#f9f9f9", fontSize: "1rem" }}
              >
                {captcha}
              </div>
              <span
                onClick={refreshCaptcha}
                style={{ color: "#007bff", cursor: "pointer", fontSize: 14 }}
              >
                Refresh here
              </span>
            </div>
            {errors.captcha && <small className="text-danger d-block mb-2">{errors.captcha.message}</small>}

            {/* Remember me */}
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              className="btn btn-dark w-100 rounded-pill fw-bold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            {/* Forgot password */}
            <div className="text-center mt-3 d-flex align-items-center justify-evenly">
              <FaLock />
              <Link to="/forgot-password" onClick={onClose} className="text-decoration-none text-primary me-2">
                Forgot password?
              </Link>
              <p className="mb-0">Not registered? <Link to="/register" onClick={onClose}>Signup</Link></p>
            </div>
          </form>
        </div>
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
