import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  phone: yup.string().matches(/\d{10}/, "Must be 10 digits").required("Phone is required"),
  gender: yup.string().oneOf(["Male", "Female", "Other"]).required("Gender is required"),
  dob: yup.string().required("DOB is required"),
  doj: yup.string().required("Date of joining is required"),
  address: yup.string().required("Address is required"),
  departmentId: yup.string().required("Department is required"),
  designationId: yup.string().required("Designation is required"),
  shiftId: yup.string().required("Shift is required"),
  emergencyName: yup.string().required("Emergency contact name is required"),
  emergencyPhone: yup.string().matches(/\d{10}/, "Must be 10 digits").required("Emergency phone is required"),
  emergencyRelation: yup.string().required("Relation is required"),
  profilePic: yup
    .mixed()
    .required("Profile picture is required")
    .test("fileSize", "File too large", (value) => value && value[0]?.size < 5 * 1024 * 1024)
});

const Register = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, ds, s] = await Promise.all([
          axios.get("http://localhost:3003/api/departments"),
          axios.get("http://localhost:3003/api/designations"),
        ]);
        setDepartments(d.data.data || []);
        setDesignations(ds.data.data || []);
      } catch (err) {
        console.error("Fetching dropdowns failed", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", "employee");
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
      if (data.profilePic && data.profilePic[0]) {
        formData.append("profilePic", data.profilePic[0]);
      }

      const res = await axios.post("http://localhost:3003/user/register", formData);
      console.log(res.data)
      if (res.data.success===true) {
        Swal.fire({
          icon:"success",
          title: "Register",
          text: res.data.message
        })
        reset()
      } else {
        Swal.fire({
          icon:"error",
          title: "Register",
          text: res.data.message
        })
      }
    } catch (err) {
      console.error("Registration failed", err);
          Swal.fire({
          icon:"error",
          title: "Register",
          text: res.data.message
        })
    }
  };

  return (
    <>
    <div className="container-fluid min-h-screen p-3 bg-secondary">
      <div style={{ maxWidth: 600, margin: "10px auto", border:"2px solid", borderRadius:"10%", padding:"30px",background:"white"}} >
      <h2 className="mb-2 text-center text-white py-3 shadow-sm bg-secondary rounded-circle">Register Employee</h2>
      <hr />
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data"> 
      <div className="row">
        <div className="col-sm-6">
          <input className="form-control mb-2" placeholder="Name" {...register("name")} /><br />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}

        <input className="form-control mb-2" placeholder="Email" {...register("email")} /><br />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}

        <input className="form-control mb-2" type="password" placeholder="Password" {...register("password")} /><br />
        {errors.password && <p className="text-danger">{errors.password.message}</p>}
        
        <input className="form-control mb-2" placeholder="Phone" {...register("phone")} /><br />
        {errors.phone && <p className="text-danger">{errors.phone.message}</p>}

        <select className="form-control mb-2" {...register("gender")}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select><br />
        {errors.gender && <p className="text-danger">{errors.gender.message}</p>}

        <input className="form-control mb-2" type="date" {...register("dob")} placeholder="DOB" /><br />
        {errors.dob && <p className="text-danger">{errors.dob.message}</p>}

        <input className="form-control mb-2" type="date" {...register("doj")} placeholder="Joining Date" /><br />
        {errors.doj && <p className="text-danger">{errors.doj.message}</p>}

        <input className="form-control mb-2" placeholder="Address" {...register("address")} /><br />
        {errors.address && <p className="text-danger">{errors.address.message}</p>}
        </div>
        <div className="col-sm-6">
          <select className="form-control mb-2" {...register("departmentId")}>
          <option value="">Select Department</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select><br />
        {errors.departmentId && <p className="text-danger">{errors.departmentId.message}</p>}

        <select className="form-control mb-2" {...register("designationId")}>
          <option value="">Select Designation</option>
          {designations.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select><br />
        {errors.designationId && <p className="text-danger">{errors.designationId.message}</p>}
        <select className="form-control mb-2" {...register("shiftId")}>
          <option value="">Select Shift</option>
          <option value="Day">Day</option>
          <option value="Night">Night</option>
          <option value="Full-time">Full-Time</option>
        </select><br />
        {errors.shiftId && <p className="text-danger">{errors.shiftId.message}</p>}

        <input className="form-control mb-2" placeholder="Emergency Name" {...register("emergencyName")} /><br />
        {errors.emergencyName && <p className="text-danger">{errors.emergencyName.message}</p>}

        <input className="form-control mb-2" placeholder="Emergency Phone" {...register("emergencyPhone")} /><br />
        {errors.emergencyPhone && <p className="text-danger">{errors.emergencyPhone.message}</p>}

        <input className="form-control mb-2" placeholder="Relation" {...register("emergencyRelation")} /><br />
        {errors.emergencyRelation && <p className="text-danger">{errors.emergencyRelation.message}</p>}

        <input className="form-control mb-2" type="file" {...register("profilePic")} /><br />
        {errors.profilePic && <p className="text-danger">{errors.profilePic.message}</p>}
        </div>
      </div>
        <button type="submit" className="form-control mb-2 btn btn-dark">Register</button>
      </form>
    </div>
    </div>
    </>
    
  );
};

export default Register;