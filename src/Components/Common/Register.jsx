import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaVenusMars,
  FaMapMarkerAlt,
  FaCalendar,
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaUserPlus,
  FaPhoneAlt,
  FaUsers,
  FaImage,
  FaUniversity,
  FaIdCard,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// -------------------- Validation Schema --------------------
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "10 digit phone required")
    .required(),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of Birth is required"),
  doj: yup.string().required("Date of Joining is required"),
  address: yup.string().required("Address is required"),
  companyId: yup.string().required("Company is required"),
  departmentId: yup.string().required("Department is required"),
  designationId: yup.string().required("Designation is required"),
  shiftId: yup.string().required("Shift is required"),
  emergencyName: yup.string().required("Emergency Name is required"),
  emergencyPhone: yup
    .string()
    .matches(/^\d{10}$/, "10 digit required")
    .required(),
  emergencyRelation: yup.string().required("Relation required"),
  profilePic: yup.mixed().required("Profile picture is required"),
  pan: yup.string().required("PAN is required"),
  bankAccount: yup.string().required("Bank A/C is required"),
});

const EmployeeRegister = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [genderOptions] = useState(["Male", "Female", "Other"]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // watch fields
  const selectedCompanyId = watch("companyId");
  const selectedDepartmentId = watch("departmentId");

  // -------------------- Fetch Companies --------------------
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/`);
        const companyList = Array.isArray(res.data.data) ? res.data.data : [];
        setCompanies(companyList);
      } catch (error) {
        Swal.fire("Error", "Failed to load companies", "error");
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCompanyId) return;

      try {
        const [depRes, desRes, shiftRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/departments/${selectedCompanyId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/designations/${selectedCompanyId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/shifts/${selectedCompanyId}`),
        ]);
        
        setDepartments(depRes.data.data || []);
        setDesignations(desRes.data.data || []);
        setShifts(shiftRes.data.data || []);
        console.log(desRes)
       
      } catch (err) {
        Swal.fire("Error", "Failed to fetch company-specific data", "error");
      }
    };
     
    fetchData();
  }, [selectedCompanyId]);

const filteredDesignations = selectedDepartmentId
  ? designations.filter((d) => d.departmentId === selectedDepartmentId)
  : [];


  // -------------------- Form Submit --------------------
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
      formData.append("companyId", data.companyId);
      formData.append("departmentId", data.departmentId);
      formData.append("designationId", data.designationId);
      formData.append("shiftId", data.shiftId);
      formData.append(
        "emergencyContact",
        JSON.stringify({
          name: data.emergencyName,
          phone: data.emergencyPhone,
          relation: data.emergencyRelation,
        })
      );
      formData.append("profilePic", data.profilePic[0]);
      formData.append("pan", data.pan);
      formData.append("bankAccount", data.bankAccount);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        formData
      );

      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
        reset();
        navigate("/");
      } else {
        Swal.fire("Error", res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  // -------------------- Fields --------------------
  const fields = [
    { label: "Name", icon: <FaUser />, name: "name" },
    { label: "Email", icon: <FaEnvelope />, name: "email" },
    { label: "Password", icon: <FaLock />, name: "password", type: "password" },
    { label: "Phone", icon: <FaPhone />, name: "phone" },
    { label: "Gender", icon: <FaVenusMars />, name: "gender", type: "select", options: genderOptions },
    { label: "Date of Birth", icon: <FaCalendar />, name: "dob", type: "date" },
    { label: "Date of Joining", icon: <FaCalendar />, name: "doj", type: "date" },
    { label: "PAN Number", icon: <FaIdCard />, name: "pan" },
    { label: "Bank A/C Number", icon: <FaUniversity />, name: "bankAccount" },
    { label: "Address", icon: <FaMapMarkerAlt />, name: "address" },
    { label: "Company", icon: <FaBuilding />, name: "companyId", type: "select", options: companies },
    { label: "Department", icon: <FaBuilding />, name: "departmentId", type: "select", options: departments },
    { label: "Designation", icon: <FaBriefcase />, name: "designationId", type: "select", options: filteredDesignations },
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
          <div className="col-md-4 d-none d-md-block text-white p-4" style={{ background: "#007bff" }}>
            <h2 className="fw-bold">Welcome</h2>
            <p className="text-light">Join the team and let's grow together.</p>
            <img
              src="https://static.vecteezy.com/system/resources/previews/003/689/228/non_2x/online-registration-or-sign-up-login-for-account-on-smartphone-app-user-interface-with-secure-password-mobile-application-for-ui-web-banner-access-cartoon-people-illustration-vector.jpg"
              alt="register"
              className="img-fluid rounded"
            />
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
                        {Array.isArray(field.options) &&
                          field.options.map((opt) =>
                            typeof opt === "string" ? (
                              <option key={opt} value={opt}>{opt}</option>
                            ) : (
                              <option key={opt._id} value={opt._id}>{opt.name}</option>
                            )
                          )}
                      </select>
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
