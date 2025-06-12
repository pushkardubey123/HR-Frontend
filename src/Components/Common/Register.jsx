import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [d, ds, s] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/departments`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/designations`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`)
        ]);
        setDepartments(d.data.data || []);
        setDesignations(ds.data.data || []);
        setShifts(s.data.data || []);
      } catch (error) {
        console.error("Dropdown fetch error", error);
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
        relation: data.emergencyRelation
      }));
      formData.append("profilePic", data.profilePic[0]);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, formData);
      console.log(res.data)
      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
        reset();
      } else {
        Swal.fire("Error", res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  return (
    <div className="container py-4">
      <div className="card p-4 shadow-lg" style={{ maxWidth: 700, margin: "auto" }}>
        <h4 className="text-center mb-4">Employee Registration</h4>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="row">
            <div className="col-md-6">
              <input className="form-control mb-2" placeholder="Name" {...register("name")} />
              <p className="text-danger">{errors.name?.message}</p>

              <input className="form-control mb-2" placeholder="Email" {...register("email")} />
              <p className="text-danger">{errors.email?.message}</p>

              <input className="form-control mb-2" placeholder="Password" type="password" {...register("password")} />
              <p className="text-danger">{errors.password?.message}</p>

              <input className="form-control mb-2" placeholder="Phone" {...register("phone")} />
              <p className="text-danger">{errors.phone?.message}</p>

              <select className="form-control mb-2" {...register("gender")}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <p className="text-danger">{errors.gender?.message}</p>

              <input type="date" className="form-control mb-2" {...register("dob")} />
              <p className="text-danger">{errors.dob?.message}</p>

              <input type="date" className="form-control mb-2" {...register("doj")} />
              <p className="text-danger">{errors.doj?.message}</p>

              <input className="form-control mb-2" placeholder="Address" {...register("address")} />
              <p className="text-danger">{errors.address?.message}</p>
            </div>

            <div className="col-md-6">
              <select className="form-control mb-2" {...register("departmentId")}>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <p className="text-danger">{errors.departmentId?.message}</p>

              <select className="form-control mb-2" {...register("designationId")}>
                <option value="">Select Designation</option>
                {designations.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <p className="text-danger">{errors.designationId?.message}</p>

              <select className="form-control mb-2" {...register("shiftId")}>
                <option value="">Select Shift</option>
                {shifts.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <p className="text-danger">{errors.shiftId?.message}</p>

              <input className="form-control mb-2" placeholder="Emergency Name" {...register("emergencyName")} />
              <p className="text-danger">{errors.emergencyName?.message}</p>

              <input className="form-control mb-2" placeholder="Emergency Phone" {...register("emergencyPhone")} />
              <p className="text-danger">{errors.emergencyPhone?.message}</p>

              <input className="form-control mb-2" placeholder="Relation" {...register("emergencyRelation")} />
              <p className="text-danger">{errors.emergencyRelation?.message}</p>

              <input className="form-control mb-2" type="file" {...register("profilePic")} />
              <p className="text-danger">{errors.profilePic?.message}</p>
            </div>
          </div>
          <button type="submit" className="btn btn-dark w-100 mt-3">Submit for Approval</button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegister;
