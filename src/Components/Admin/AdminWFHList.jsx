import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminLayout from "./AdminLayout";

const statusIcon = {
  pending: <MdPendingActions className="text-yellow-500 inline mr-1" />,
  approved: <FaCheckCircle className="text-green-600 inline mr-1" />,
  rejected: <FaTimesCircle className="text-red-600 inline mr-1" />,
};

const AdminWFHList = () => {
  const [wfhList, setWfhList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchWFH();
    fetchEmployees();
  }, []);

  const fetchWFH = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/wfh/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWfhList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching WFH data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}`},
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const handleAction = async (id, actionType) => {
    const { value: adminRemarks } = await Swal.fire({
      title: `${actionType === "approved" ? "Approve" : "Reject"} Request`,
      input: "text",
      inputLabel: "Admin Remarks (optional)",
      showCancelButton: true,
      confirmButtonText: actionType === "approved" ? "Approve" : "Reject",
      confirmButtonColor: actionType === "approved" ? "#16a34a" : "#dc2626",
    });
    if (adminRemarks !== undefined) {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/wfh/status/${id}`,
          { status: actionType, adminRemarks },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Updated", "Request status updated", "success");
        fetchWFH();
      } catch {
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  };

  const handleAssignWFH = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Assign WFH to Employee",
      html: `
        <select id="employee" class="swal2-input">
          ${employees.map(emp => `<option value="${emp._id}">${emp.name}</option>`).join("")}
        </select>
        <input type="date" id="fromDate" class="swal2-input" />
        <input type="date" id="toDate" class="swal2-input" />
        <input type="text" id="remarks" class="swal2-input" placeholder="Remarks (optional)" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const employee = document.getElementById("employee").value;
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;
        const remarks = document.getElementById("remarks").value;
        if (!employee || !fromDate || !toDate) {
          Swal.showValidationMessage("Please fill all required fields.");
        }
        return { employee, fromDate, toDate, remarks };
      },
      showCancelButton: true,
      confirmButtonText: "Assign",
    });

    if (formValues) {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token;
await axios.post(
  `${import.meta.env.VITE_API_URL}/api/admin/assign-wfh`,
  {
    employeeId: formValues.employee,
    fromDate: formValues.fromDate,
    toDate: formValues.toDate,
    remarks: formValues.remarks,
    reason: "WFH assigned by admin"
  },
  { headers: { Authorization: `Bearer ${token}` } }
);
        Swal.fire("Success", "WFH assigned successfully", "success");
        fetchWFH();
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Failed to assign", "error");
      }
    }
  };

  const filtered = wfhList
    .filter(item => filterStatus === "all" || item.status === filterStatus)
    .filter(item => {
      const fD = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const tD = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;
      const itemFrom = new Date(item.fromDate).getTime();
      return (!fD || itemFrom >= fD) && (!tD || itemFrom <= tD);
    });

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const displayItems = filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WFH");
    XLSX.writeFile(wb, "WFH_Requests.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("WFH Requests", 70, 17);
    autoTable(doc, {
      startY: 30,
      head: [["Employee", "From", "To", "Status", "Remarks"]],
      body: filtered.map(item => [
        item.userId?.name,
        new Date(item.fromDate).toLocaleDateString(),
        new Date(item.toDate).toLocaleDateString(),
        item.status,
        item.adminRemarks || "-",
      ]),
      styles: { fontSize: 10 },
    });
    doc.save("WFH_Requests.pdf");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto mt-8 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Work From Home Management</h2>
          <button
            onClick={handleAssignWFH}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          >
            <FaPlus /> Assign WFH
          </button>
        </div>

        {/* Filters + Exports */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {["all", "pending", "approved", "rejected"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1 rounded-full text-white ${filterStatus === s ? "bg-blue-600" : "bg-gray-400"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({filtered.filter(i => s === "all" ? true : i.status === s).length})
            </button>
          ))}
          <DatePicker selected={fromDate} onChange={d => setFromDate(d)} placeholderText="From Date" className="border px-3 py-1 rounded" />
          <DatePicker selected={toDate} onChange={d => setToDate(d)} placeholderText="To Date" className="border px-3 py-1 rounded" />
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-1 rounded">Export Excel</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-1 rounded">Export PDF</button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Employee</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remarks</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, i) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{currentPage * itemsPerPage + i + 1}</td>
                  <td className="p-2">{item.userId?.name}</td>
                  <td className="p-2">{new Date(item.fromDate).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(item.toDate).toLocaleDateString()}</td>
                  <td className="p-2 capitalize">
                    {statusIcon[item.status]} {item.status}
                  </td>
                  <td className="p-2">{item.adminRemarks || "-"}</td>
                  <td className="p-2 flex gap-2">
                    {item.status === "pending" && (
                      <>
                        <FaCheckCircle className="text-green-600 cursor-pointer" onClick={() => handleAction(item._id, "approved")} />
                        <FaTimesCircle className="text-red-600 cursor-pointer" onClick={() => handleAction(item._id, "rejected")} />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <ReactPaginate
            pageCount={pageCount}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName="flex gap-2 justify-center"
            pageLinkClassName="px-3 py-1 border rounded"
            activeLinkClassName="bg-blue-600 text-white"
            previousLabel="←"
            nextLabel="→"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWFHList;
