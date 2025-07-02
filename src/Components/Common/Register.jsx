// Employee Register - 3 column layout with compact spacing and dynamic dropdowns

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaVenusMars, FaMapMarkerAlt,
  FaCalendar, FaBuilding, FaBriefcase, FaClock, FaUserPlus,
  FaPhoneAlt, FaUsers, FaImage
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
  phone: yup.string().matches(/^\d{10}$/, "10 digit phone required").required(),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of Birth is required"),
  doj: yup.string().required("Date of Joining is required"),
  address: yup.string().required("Address is required"),
  departmentId: yup.string().required("Department is required"),
  designationId: yup.string().required("Designation is required"),
  shiftId: yup.string().required("Shift is required"),
  emergencyName: yup.string().required(),
  emergencyPhone: yup.string().matches(/^\d{10}$/, "10 digit required").required(),
  emergencyRelation: yup.string().required("Relation required"),
  profilePic: yup.mixed().required("Profile picture is required"),
});

const EmployeeRegister = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [genderOptions] = useState(["Male", "Female", "Other"]);
  const navigate=useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [d, ds, s] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/departments`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/designations`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`),
        ]);
        setDepartments(d.data.data || []);
        setDesignations(ds.data.data || []);
        setShifts(s.data.data || []);
      } catch (error) {
        Swal.fire("Error", "Dropdown fetch error", "error");
      }
    };
    fetchDropdowns();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("gender", data.gender);
      formData.append("dob", data.dob);
      formData.append("doj", data.doj);
      formData.append("address", data.address);
      formData.append("departmentId", data.departmentId);
      formData.append("designationId", data.designationId);
      formData.append("shiftId", data.shiftId);
      formData.append("emergencyContact", JSON.stringify({
        name: data.emergencyName,
        phone: data.emergencyPhone,
        relation: data.emergencyRelation,
      }));
      formData.append("profilePic", data.profilePic[0]);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, formData);
      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
        reset();
        navigate("/")

      } else {
        Swal.fire("Error", res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  const fields = [
    { label: "Name", icon: <FaUser />, name: "name" },
    { label: "Email", icon: <FaEnvelope />, name: "email" },
    { label: "Password", icon: <FaLock />, name: "password", type: "password" },
    { label: "Phone", icon: <FaPhone />, name: "phone" },
    { label: "Gender", icon: <FaVenusMars />, name: "gender", type: "select", options: genderOptions },
    { label: "Date of Birth", icon: <FaCalendar />, name: "dob", type: "date" },
    { label: "Date of Joining", icon: <FaCalendar />, name: "doj", type: "date" },
    { label: "Address", icon: <FaMapMarkerAlt />, name: "address" },
    { label: "Department", icon: <FaBuilding />, name: "departmentId", type: "select", options: departments },
    { label: "Designation", icon: <FaBriefcase />, name: "designationId", type: "select", options: designations },
    { label: "Shift", icon: <FaClock />, name: "shiftId", type: "select", options: shifts },
    { label: "Emergency Name", icon: <FaUserPlus />, name: "emergencyName" },
    { label: "Emergency Phone", icon: <FaPhoneAlt />, name: "emergencyPhone" },
    { label: "Emergency Relation", icon: <FaUsers />, name: "emergencyRelation" },
    { label: "Profile Picture", icon: <FaImage />, name: "profilePic", type: "file" },
  ];

  return (
    <div className="animated-bg" style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", paddingTop: 40 }}>
      <div className="container">
        <div className="row bg-white rounded shadow-lg overflow-hidden">
          <div className="col-md-4 d-none d-md-block text-white p-4" style={{ background: '#007bff' }}>
            <h2 className="fw-bold">Welcome</h2>
            <p className="text-light">Join the team and let's grow together.</p>
            <img src="https://static.vecteezy.com/system/resources/previews/003/689/228/non_2x/online-registration-or-sign-up-login-for-account-on-smartphone-app-user-interface-with-secure-password-mobile-application-for-ui-web-banner-access-cartoon-people-illustration-vector.jpg" alt="register" className="img-fluid rounded" />
          </div>

          <div className="col-md-8 p-4">
            <h4 className="text-center text-primary mb-4 fw-bold">Employee Registration</h4>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <div className="row g-3">
                {fields.map((field, index) => (
                  <div className="col-md-4" key={index}>
                    <label className="form-label d-flex align-items-center">
                      <span className="me-2">{field.icon}</span> {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select className="form-control" {...register(field.name)}>
                        <option value="">Select {field.label}</option>
                        {field.options.map((opt, i) => (
                          typeof opt === "string" ? (
                            <option key={i} value={opt}>{opt}</option>
                          ) : (
                            <option key={opt._id} value={opt._id}>{opt.name}</option>
                          )
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        className="form-control"
                        {...register(field.name)}
                      />
                    )}
                    <p className="text-danger small">{errors[field.name]?.message}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="btn btn-lg fw-bold"
                  style={{
                    background: "#0d6efd",
                    color: "white",
                    boxShadow: "0 0 10px #0d6efd, 0 0 20px #0d6efd",
                  }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegister;
