import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import "./EmployeeWFHForm.css";
import { FcHome } from "react-icons/fc";

const schema = yup.object().shape({
  fromDate: yup.date().required("From Date is required"),
  toDate: yup
    .date()
    .required("To Date is required")
    .min(yup.ref("fromDate"), "To Date must be after From Date"),
  reason: yup.string().required("Reason is required"),
});

const EmployeeWFHForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wfh/apply`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
        reset();
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <EmployeeLayout>
      <div className="wfh-container">
        <h2 className="wfh-title d-flex text-align-center justify-center ">
          <FcHome className="mt-1 me-2" /> Apply for Work From Home
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="wfh-form">
          <div className="form-group">
            <label>From Date</label>
            <input type="date" {...register("fromDate")} />
            {errors.fromDate && (
              <p className="error">{errors.fromDate.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>To Date</label>
            <input type="date" {...register("toDate")} />
            {errors.toDate && <p className="error">{errors.toDate.message}</p>}
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              rows="4"
              {...register("reason")}
              placeholder="Reason for WFH..."
            ></textarea>
            {errors.reason && <p className="error">{errors.reason.message}</p>}
          </div>

          <div className="form-actions">
            <button type="submit">Submit Request</button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeWFHForm;
