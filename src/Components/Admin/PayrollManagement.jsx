import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import Loader from "./Loader/Loader";

const schema = yup.object().shape({
  employeeId: yup.string().required("Employee is required"),
  month: yup.string().required("Month is required"),
  basicSalary: yup
    .number()
    .typeError("Basic salary must be a number")
    .required("Basic salary is required")
    .min(0, "Basic salary cannot be negative"),
});

const PayrollManagement = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editable, setEditable] = useState(false);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const selectedEmployeeId = watch("employeeId");

  useEffect(() => {
    if (selectedEmployeeId && !editingId) {
      const emp = employees.find((e) => e._id === selectedEmployeeId);
      if (emp?.basicSalary) {
        setValue("basicSalary", emp.basicSalary);
        setEditable(false);
      }
    }
  }, [selectedEmployeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/payrolls`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log(payRes)
      const employeeList = empRes.data.data.filter((e) => e.role === "employee");
      setEmployees(employeeList);
      setPayrolls(payRes.data.data.reverse());
    } catch {
      Swal.fire("Error", "Failed to fetch payroll data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateNet = (basicSalary) => {
    const basic = parseFloat(basicSalary || 0);
    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    return basic + totalAllowances - totalDeductions;
  };

  const addItem = (type) => {
    const title = prompt(`Enter ${type} Title`);
    const amount = parseFloat(prompt(`Enter ${type} Amount`));
    if (title && !isNaN(amount)) {
      const newItem = { title, amount };
      if (type === "allowances") setAllowances([...allowances, newItem]);
      else setDeductions([...deductions, newItem]);
    }
  };

  const removeItem = (type, index) => {
    if (type === "allowances") setAllowances(allowances.filter((_, i) => i !== index));
    else setDeductions(deductions.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      allowances,
      deductions,
      netSalary: calculateNet(data.basicSalary),
    };

    try {
      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/payrolls/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Updated", "Payroll updated", "success");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/payrolls`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Created", "Payroll created", "success");
      }
      reset();
      setAllowances([]);
      setDeductions([]);
      setEditingId(null);
      setEditable(false);
      fetchData();
    } catch {
      Swal.fire("Error", "Failed to save payroll", "error");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    reset({
      employeeId: p.employeeId._id,
      month: p.month,
      basicSalary: p.basicSalary,
    });
    setAllowances(p.allowances);
    setDeductions(p.deductions);
    setEditable(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete payroll record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/payrolls/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      Swal.fire("Deleted", "Payroll deleted", "success");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Report", 14, 10);
    autoTable(doc, {
      head: [["#","Employee", "Month", "Basic", "Allowances", "Deductions", "Net"]],
      body: filteredPayrolls.map((p, i) => [
        i + 1,
        p.employeeId?.name,
        p.month,
        p.basicSalary,
        p.allowances?.map((a) => `${a.title}: ₹${a.amount}`).join("\n") || "-",
        p.deductions?.map((d) => `${d.title}: ₹${d.amount}`).join("\n") || "-",
        p.netSalary,
      ]),
    });
    doc.save("payroll_report.pdf");
  };

  const exportToCSV = () => {
    const csvData = filteredPayrolls.map((p, i) => ({
      S_No: i + 1,
      Employee: p.employeeId?.name,
      Month: p.month,
      Basic: p.basicSalary,
      Allowances: p.allowances?.map((a) => `${a.title}: ₹${a.amount}`).join(", ") || "-",
    Deductions: p.deductions?.map((d) => `${d.title}: ₹${d.amount}`).join(", ") || "-",
      Net: p.netSalary,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "payroll_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayrolls = payrolls.filter((p) =>
    p.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h3 className="text-center">Payroll Management</h3>

        {/* --- Form --- */}
<form className="mt-3" onSubmit={handleSubmit(onSubmit)}>
  <div className="row align-items-end">
    {/* Employee */}
    <div className="col-md-4 mb-2">
      <label className="form-label mb-1">Employee</label>
      <select
        className={`form-select form-select-sm ${errors.employeeId ? "is-invalid" : ""}`}
        {...register("employeeId")}
      >
        <option value="">Select Employee</option>
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.name} ({emp.email})
          </option>
        ))}
      </select>
      <div className="invalid-feedback">{errors.employeeId?.message}</div>
    </div>

    {/* Month */}
    <div className="col-md-4 mb-2">
      <label className="form-label mb-1">Month</label>
      <input
        type="month"
        className={`form-control form-control-sm ${errors.month ? "is-invalid" : ""}`}
        {...register("month")}
      />
      <div className="invalid-feedback">{errors.month?.message}</div>
    </div>

    {/* Basic Salary + Toggle */}
    <div className="col-md-4 mb-2">
      <div className="d-flex justify-content-between align-items-center">
        <label className="form-label mb-1">Basic Salary</label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={editable}
            onChange={(e) => setEditable(e.target.checked)}
          />
          <label className="form-check-label small">Edit?</label>
        </div>
      </div>
      <input
        type="number"
        className={`form-control form-control-sm ${errors.basicSalary ? "is-invalid" : ""}`}
        {...register("basicSalary")}
        disabled={!editable}
      />
      <div className="invalid-feedback">{errors.basicSalary?.message}</div>
    </div>
  </div>

  {/* Allowances */}
  <div className="row mt-3">
    <div className="col-md-6">
      <h6>Allowances</h6>
      <ul className="ps-3">
        {allowances.map((item, i) => (
          <li key={i}>
            {item.title}: ₹{item.amount}
            <button
              type="button"
              className="btn btn-sm btn-danger ms-2"
              onClick={() => removeItem("allowances", i)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-sm btn-outline-success"
        onClick={() => addItem("allowances")}
      >
        + Add Allowance
      </button>
    </div>

    {/* Deductions */}
    <div className="col-md-6">
      <h6>Deductions</h6>
      <ul className="ps-3">
        {deductions.map((item, i) => (
          <li key={i}>
            {item.title}: ₹{item.amount}
            <button
              type="button"
              className="btn btn-sm btn-danger ms-2"
              onClick={() => removeItem("deductions", i)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-sm btn-outline-warning"
        onClick={() => addItem("deductions")}
      >
        + Add Deduction
      </button>
    </div>
  </div>

  {/* Submit */}
  <div className="col-12 mt-3">
    <button type="submit" className="btn btn-secondary w-100">
      {editingId ? "Update Payroll" : "Add Payroll"} (Net ₹
      {calculateNet(watch("basicSalary"))})
    </button>
  </div>
</form>


        <hr className="my-4" />

        {/* Filters + Export */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            placeholder="Search by employee name"
            className="form-control w-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <button
              className="btn btn-sm btn-outline-success me-2"
              onClick={exportToCSV}
            >
              Export CSV
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={exportToPDF}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <h5 className="text-center">All Payroll Records</h5>
        <table className="table table-bordered mt-3 text-center">
          <thead className="table-dark">
            <tr>
              <th>S No.</th>
              <th>Employee</th>
              <th>Month</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Deduction</th>
              <th>Net</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-4 text-center">
                  <Loader />
                </td>
              </tr>
            ) : filteredPayrolls.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-muted">No payroll records found.</td>
              </tr>
            ) : (
              filteredPayrolls.map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td>{p.employeeId?.name}</td>
                  <td>{p.month}</td>
                  <td>₹{p.basicSalary}</td>
                          <td>
          {p.allowances?.map((a, idx) => (
            <div key={idx}>
              {a.title}: ₹{a.amount}
            </div>
          ))}
        </td>
        <td>
          {p.deductions?.map((d, idx) => (
            <div key={idx}>
              {d.title}: ₹{d.amount}
            </div>
          ))}
        </td>
                  <td>₹{p.netSalary}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default PayrollManagement;
