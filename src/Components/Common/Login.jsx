// Updated Login.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

const schema = yup.object().shape({
  role: yup.string().required("Role is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  captcha: yup.string().required("Captcha is required"),
});

const AVAILABLE_MODULES = [
  { key: "employee_management", label: "Employee Management" },
  { key: "payroll", label: "Payroll" },
  { key: "attendance", label: "Attendance" },
  { key: "project_management", label: "Projects" },
  { key: "finance_management", label: "Finance" },
];

const Login = ({ onClose, onLoginSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function generateCaptcha() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  const refreshCaptcha = () => setCaptcha(generateCaptcha());

  async function showSubscriptionChooser(token) {
    // Step 1: choose modules & duration
    const html = `
      <div style="text-align:left">
        <div id="modules">
          ${AVAILABLE_MODULES.map(m => `
            <div style="margin-bottom:6px">
              <label><input type=checkbox value='${m.key}' /> ${m.label}</label>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:8px">Duration:<br/>
          <label><input type=radio name="duration" value="1month" checked /> 1 month</label><br/>
          <label><input type=radio name="duration" value="6month" /> 6 months</label><br/>
          <label><input type=radio name="duration" value="1year" /> 1 year</label>
        </div>
      </div>
    `;

    const { value: selection } = await Swal.fire({
      title: 'Choose modules & duration',
      html,
      showCancelButton: true,
      confirmButtonText: 'Continue',
      focusConfirm: false,
      preConfirm: () => {
        // read DOM
        const checked = Array.from(document.querySelectorAll('#modules input[type=checkbox]'))
          .filter(i => i.checked)
          .map(i => i.value);
        const durationEl = document.querySelector('input[name="duration"]:checked');
        const duration = durationEl ? durationEl.value : null;
        if (!checked.length) {
          Swal.showValidationMessage('Please select at least one module');
          return null;
        }
        return { modules: checked, duration };
      }
    });

    if (!selection) return false; // user cancelled or invalid

    // Normalize dependencies (payroll/attendance need employee_management)
    const deps = new Set(selection.modules);
    if (deps.has('payroll') || deps.has('attendance')) deps.add('employee_management');
    const modulesFinal = Array.from(deps);

    // Call price API
    try {
      const priceRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscription/price`, {
        params: { modules: modulesFinal.join(','), duration: selection.duration },
        headers: { Authorization: `Bearer ${token}` }
      });

      const price = priceRes.data.price;

      const confirm = await Swal.fire({
        title: 'Confirm Purchase',
        html: `<div>Modules: <b>${modulesFinal.join(', ')}</b><br/>Duration: <b>${selection.duration}</b><br/>Price: <b>₹ ${price}</b></div>`,
        showCancelButton: true,
        confirmButtonText: 'Purchase (manual)',
      });

      if (!confirm.isConfirmed) return false;

      // Create subscription (manual paymentRef)
      const subRes = await axios.post(`${import.meta.env.VITE_API_URL}/subscription/subscribe`, {
        modules: modulesFinal,
        duration: selection.duration,
        paymentRef: 'manual-test'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (subRes.data.success) {
        Swal.fire('Success', 'Subscription activated', 'success');
        // update localStorage user subscription by fetching status
        const status = await axios.get(`${import.meta.env.VITE_API_URL}/subscription/status`, { headers: { Authorization: `Bearer ${token}` } });
        const stored = JSON.parse(localStorage.getItem('user')) || {};
        stored.subscription = status.data.data || null;
        localStorage.setItem('user', JSON.stringify(stored));
        return true;
      } else {
        Swal.fire('Error', subRes.data.message || 'Subscription failed', 'error');
        return false;
      }

    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to calculate price or subscribe', 'error');
      return false;
    }
  }

  const onSubmit = async (data) => {
    if (data.captcha !== captcha) {
      refreshCaptcha();
      return Swal.fire('Error', "Captcha doesn't match", 'error');
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, data);
      if (res.data.success) {
        console.log(res.data)
        const actualRole = res.data.data.role;

        if (actualRole.toLowerCase() !== data.role.toLowerCase()) {
          refreshCaptcha();
          setLoading(false);
          return Swal.fire(
            'Access Denied',
            `You are registered as ${actualRole}, but selected ${data.role}`,
            'error'
          );
        }

        // Save user data
        const userObj = {
          role: actualRole,
          token: res.data.token,
          id: res.data.data.id,
          username: res.data.data.name,
          email: res.data.data.email,
          subscription: res.data.data.subscription || null
        };

        localStorage.setItem('user', JSON.stringify(userObj));

        // If admin and no active subscription or expired -> prompt subscription
        if (actualRole.toLowerCase() === 'admin') {
          const sub = res.data.data.subscription;
          const noActive = !sub || sub.status !== 'active';
          if (noActive) {
            const accepted = await showSubscriptionChooser(res.data.token);
            if (!accepted) {
              // user cancelled subscription — allow login but inform them
              Swal.fire('Note', 'You can purchase a subscription later from the dashboard.', 'info');
            }
          }
        }

        Swal.fire('Success', 'Logged in successfully', 'success');
        if (typeof onLoginSuccess === 'function') onLoginSuccess();
        onClose();

        // ✅ Navigate based on role
        if (actualRole.toLowerCase() === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (actualRole.toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        Swal.fire('Error', res.data.message, 'error');
        refreshCaptcha();
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Login failed', 'error');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="d-flex w-100 flex-column flex-md-row" style={modalContainerStyle}>
        <div className="w-100 w-md-50 d-none d-md-block">
          <img
            src="https://hrms.indianhr.in/assets/images/login-img.png"
            alt="login-banner"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          className="w-100 w-md-50 bg-white d-flex flex-column justify-content-center align-items-center p-4"
          style={{ maxWidth: 400 }}
        >
          <h4 className="fw-bold text-center mb-4">HRMS LOGIN</h4>
          <form className="w-100" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Dropdown */}
            <select className="form-control rounded-pill mb-2" {...register('role')}>
              <option value="">Select Role</option>
              <option value="SuperAdmin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
            {errors.role && <small className="text-danger d-block mb-2">{errors.role.message}</small>}

            {/* Email */}
            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Email"
              {...register('email')}
            />
            {errors.email && <small className="text-danger d-block mb-2">{errors.email.message}</small>}

            {/* Password */}
            <input
              type="password"
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the Password"
              {...register('password')}
            />
            {errors.password && <small className="text-danger d-block mb-2">{errors.password.message}</small>}

            {/* Captcha */}
            <input
              className="form-control rounded-pill mb-2"
              placeholder="Please enter the captcha"
              {...register('captcha')}
            />
            {errors.captcha && <small className="text-danger d-block mb-2">{errors.captcha.message}</small>}

            {/* Captcha Box */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="border rounded-pill px-3 py-1"
                style={{ fontFamily: 'monospace', background: '#f0f0f0' }}
              >
                {captcha}
              </div>
              <span
                onClick={refreshCaptcha}
                style={{ cursor: 'pointer', color: '#007bff', fontSize: 14 }}
              >
                Refresh Captcha
              </span>
            </div>

            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill fw-bold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>

            {/* Not Registered & Forgot Password */}
            <div className="text-center mt-3 d-flex align-items-center justify-content-between">
              <span
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'Select Registration Type',
                    text: 'You want to register as?',
                    icon: 'question',
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Employee',
                    denyButtonText: 'Admin',
                    cancelButtonText: 'Cancel',
                    reverseButtons: true,
                  });

                  if (result.isConfirmed) {
                    onClose();
                    navigate('/employee/register');
                  } else if (result.isDenied) {
                    onClose();
                    navigate('/admin/register');
                  }
                }}
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'none' }}
              >
                Not Registered?
              </span>

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
