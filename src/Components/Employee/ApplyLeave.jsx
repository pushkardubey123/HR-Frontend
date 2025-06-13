import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import EmployeeLayout from "./EmployeeLayout";
import { MdSick } from "react-icons/md";
import { FaHourglassEnd, FaHourglassStart } from "react-icons/fa";
import { VscGitStashApply } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  leaveType: yup.string().required("Leave type is required"),
  startDate: yup.date().required("From date is required"),
  endDate: yup.date().required("To date is required"),
  reason: yup.string().required("Reason is required"),
});

const ApplyLeave = () => {

  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const employeeId = user?.id;
      const token = user?.token;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/leaves`,
        { ...data, employeeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Swal.fire("Success", response.data.message, "success");
        reset();
        navigate("/employee/my-leaves")
      } else {
        Swal.fire("Error", response.data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <EmployeeLayout>
      <div className="container mt-4 h-50 w-50 border-2 rounded p-3 bg-dark shadow-lg">
        <h4 className="py-3 d-flex justify-content-center text-warning">
          <span className="mt-1 mx-2">
            <VscGitStashApply />
          </span>
          Apply Leave
        </h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <div className="input-group mb-3">
              <span className="input-group-text">
                <MdSick />
              </span>
              <select className="form-control" {...register("leaveType")}>
                <option value="">Leave Type</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Earned">Earned</option>
              </select>
            </div>
            <p className="text-danger">{errors.leaveType?.message}</p>
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaHourglassStart />
            </span>
            <input
              type="date"
              className="form-control"
              {...register("startDate")}
            />
            <p className="text-danger">{errors.startDate?.message}</p>
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaHourglassEnd />
            </span>
            <input
              type="date"
              className="form-control"
              {...register("endDate")}
            />
            <p className="text-danger">{errors.endDate?.message}</p>
          </div>

          <div className="mb-3">
            <textarea
              placeholder="Reason..."
              className="form-control"
              rows="3"
              {...register("reason")}
            ></textarea>
            <p className="text-danger">{errors.reason?.message}</p>
          </div>

          <button type="submit" className="btn btn-warning form-control mb-2">
            Submit Leave
          </button>
        </form>
      </div>
    </EmployeeLayout>
  );
};

export default ApplyLeave;
