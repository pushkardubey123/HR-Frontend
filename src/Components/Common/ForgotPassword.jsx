import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/forgot-password`,
        data
      );
      Swal.fire("Success", res.data.message, "success");
      localStorage.setItem("email", data.email);
      navigate("/verify-otp");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  return (
    <div style={backdropStyle}>
      <div className="card shadow" style={cardStyle}>
        <div className="card-header text-center">
          <h4>Forgot Password</h4>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-1">
                <FaEnvelope /> <span>Email</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <small className="text-danger">{errors.email.message}</small>
              )}
            </div>
          </div>
          <div className="card-footer text-end">
            <button type="submit" className="btn btn-dark">
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const backdropStyle = {
  backgroundImage: `url('https://images.pexels.com/photos/1007568/pexels-photo-1007568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
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

export default ForgotPassword;
