import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "../Admin/AdminLayout";
import styles from "./CreateJob.module.css"; 
import { CgFileDocument } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  title: yup.string().required("Job Title is required"),
  departmentId: yup.string().required("Department is required"),
  designationId: yup.string().required("Designation is required"),
  positions: yup.number().min(1, "At least 1 position required").required(),
  status: yup.string().oneOf(["Active", "Inactive"]).required(),
  startDate: yup.date().required("Start Date is required"),
  endDate: yup
    .date()
    .required("End Date is required")
    .min(yup.ref("startDate"), "End Date must be after Start Date"),
  description: yup.string().required("Description is required"),
  requirement: yup.string().required("Requirement is required"),
});

const CreateJob = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      departmentId: "",
      designationId: "",
      positions: 1,
      status: "Active",
      startDate: "",
      endDate: "",
      skills: "",
      description: "",
      requirement: "",
      askGender: false,
      askDob: false,
      askAddress: false,
      showProfileImage: false,
      showResume: false,
      showCoverLetter: false,
      showTerms: false,
    },
  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/departments`).then((res) =>
      setDepartments(res.data.data || [])
    );
    axios.get(`${import.meta.env.VITE_API_URL}/api/designations`).then((res) =>
      setAllDesignations(res.data.data || [])
    );
  }, []);

  const selectedDepartment = watch("departmentId");
  useEffect(() => {
    if (selectedDepartment) {
      const filtered = allDesignations.filter(
        (d) => d.departmentId === selectedDepartment
      );
      setDesignations(filtered);
    } else {
      setDesignations([]);
    }
  }, [selectedDepartment, allDesignations]);

  const onSubmit = async (data) => {
    try {
      const body = { ...data };
      body.skills = data.skills
        ? data.skills.split(",").map((s) => s.trim())
        : [];

      await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, body);

      Swal.fire("Success", "Job created successfully!", "success");
      reset();
      navigate("/admin/joblist")
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>
          <CgFileDocument className="mt-1 me-2" />
          Create Job
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.column}>
            <label>Job Title*</label>
            <input type="text" {...register("title")} />
            <p className={styles.error}>{errors.title?.message}</p>

            <label>Department*</label>
            <select {...register("departmentId")}>
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className={styles.error}>{errors.departmentId?.message}</p>

            <label>Designation*</label>
            <select {...register("designationId")}>
              <option value="">-- Select Designation --</option>
              {allDesignations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className={styles.error}>{errors.designationId?.message}</p>

            <div className={styles.row}>
              <div>
                <label>Positions*</label>
                <input type="number" {...register("positions")} min="1" />
                <p className={styles.error}>{errors.positions?.message}</p>
              </div>
              <div>
                <label>Status*</label>
                <select {...register("status")}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <p className={styles.error}>{errors.status?.message}</p>
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label>Start Date*</label>
                <input type="date" {...register("startDate")} />
                <p className={styles.error}>{errors.startDate?.message}</p>
              </div>
              <div>
                <label>End Date*</label>
                <input type="date" {...register("endDate")} />
                <p className={styles.error}>{errors.endDate?.message}</p>
              </div>
            </div>

            <label>Skills (comma separated)</label>
            <input type="text" {...register("skills")} />
          </div>

          <div className={styles.column}>
            <label>Job Description*</label>
            <textarea {...register("description")} rows="3"></textarea>
            <p className={styles.error}>{errors.description?.message}</p>

            <label>Job Requirement*</label>
            <textarea {...register("requirement")} rows="3"></textarea>
            <p className={styles.error}>{errors.requirement?.message}</p>

            <h3 className={styles.subtitle}>Need to Ask?</h3>
            <div className={styles.checkboxGrid}>
              <label>
                <input type="checkbox" {...register("askGender")} /> Gender
              </label>
              <label>
                <input type="checkbox" {...register("askDob")} /> Date of Birth
              </label>
              <label>
                <input type="checkbox" {...register("askAddress")} /> Address
              </label>
            </div>

            <h3 className={styles.subtitle}>Need to Show Option?</h3>
            <div className={styles.checkboxGrid}>
              <label>
                <input type="checkbox" {...register("showProfileImage")} /> Profile Image
              </label>
              <label>
                <input type="checkbox" {...register("showResume")} /> Resume
              </label>
              <label>
                <input type="checkbox" {...register("showCoverLetter")} /> Cover Letter
              </label>
              <label>
                <input type="checkbox" {...register("showTerms")} /> Terms & Conditions
              </label>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn}>
              Create Job
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateJob;
