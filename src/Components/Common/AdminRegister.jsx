import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// -------------------- Validation Schema --------------------
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
  phone: yup.string().matches(/^\d{10}$/, "10 digit phone required").required(),
  companyName: yup.string().required("Company Name is required"),
  address: yup.string().required("Company Address is required"),
  profilePic: yup.mixed().required("Profile picture is required"),
});

const AdminRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("companyName", data.companyName);
      formData.append("address", data.address);
      formData.append("role", "admin");
      formData.append("profilePic", data.profilePic[0]);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, formData);

      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
        reset();
        navigate("/login");
      } else {
        Swal.fire("Error", res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Name", icon: <FaUser />, name: "name" },
    { label: "Email", icon: <FaEnvelope />, name: "email" },
    { label: "Password", icon: <FaLock />, name: "password", type: "password" },
    { label: "Phone", icon: <FaPhone />, name: "phone" },
    { label: "Company Name", icon: <FaBuilding />, name: "companyName" },
    { label: "Company Address", icon: <FaMapMarkerAlt />, name: "address" },
    { label: "Profile Picture", icon: <FaImage />, name: "profilePic", type: "file" },
  ];

  return (
    <div className="animated-bg" style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", paddingTop: 40 }}>
      <div className="container">
        <div className="row bg-white rounded shadow-lg overflow-hidden">
          <div className="col-md-4 d-none d-md-block text-white p-4" style={{ background: "#007bff" }}>
            <h2 className="fw-bold">Welcome</h2>
            <p className="text-light">Register as an Admin and create your company.</p>
            <img
              src="https://static.vecteezy.com/system/resources/previews/003/689/228/non_2x/online-registration-or-sign-up-login-for-account-on-smartphone-app-user-interface-with-secure-password-mobile-application-for-ui-web-banner-access-cartoon-people-illustration-vector.jpg"
              alt="register"
              className="img-fluid rounded"
            />
          </div>

          <div className="col-md-8 p-4">
            <h4 className="text-center text-primary mb-4 fw-bold">Admin Registration</h4>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <div className="row g-3">
                {fields.map((field, idx) => (
                  <div className="col-md-6" key={idx}>
                    <label className="form-label d-flex align-items-center">
                      <span className="me-2">{field.icon}</span> {field.label}
                    </label>
                    {field.type === "file" ? (
                      <input type="file" className="form-control" {...register(field.name)} />
                    ) : (
                      <input type={field.type || "text"} className="form-control" {...register(field.name)} />
                    )}
                    <p className="text-danger small">{errors[field.name]?.message}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="btn btn-lg fw-bold"
                  disabled={loading}
                  style={{
                    background: "#0d6efd",
                    color: "white",
                    boxShadow: "0 0 10px #0d6efd, 0 0 20px #0d6efd",
                  }}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
