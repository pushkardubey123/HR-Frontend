import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import Papa from "papaparse";

const EmployeeDashboard = () => {
  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [latestLeaves, setLatestLeaves] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      const employeeId = user?.id;
      const username = user?.username;
      try {
        setUserName(username);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/leaves/employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const myLeaves = res.data.data.filter(
          (leave) =>
            leave.employeeId === employeeId ||
            leave.employeeId?._id === employeeId
        );

        const stats = {
          total: myLeaves.length,
          pending: myLeaves.filter((l) => l.status === "Pending").length,
          approved: myLeaves.filter((l) => l.status === "Approved").length,
          rejected: myLeaves.filter((l) => l.status === "Rejected").length,
        };
        setLeaveStats(stats);
        setLatestLeaves(myLeaves.slice(-5).reverse());
      } catch (error) {
        .error("Error loading employee dashboard:", error.message);
      }
    };

    fetchData();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Recent Leave Requests", 14, 10);
    const tableData = latestLeaves.map((leave) => [
      leave.leaveType,
      new Date(leave.startDate).toLocaleDateString(),
      new Date(leave.endDate).toLocaleDateString(),
      leave.status,
      leave.reason,
    ]);
    autoTable(doc, {
      head: [["Type", "From", "To", "Status", "Reason"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [123, 123, 255],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        cellPadding: 3,
        font: "helvetica",
        fontSize: 11,
      },
    });

    doc.save("leaves.pdf");
  };

  const exportToCSV = () => {
    const csvData = latestLeaves.map((leave) => ({
      Type: leave.leaveType,
      From: new Date(leave.startDate).toLocaleDateString(),
      To: new Date(leave.endDate).toLocaleDateString(),
      Status: leave.status,
      Reason: leave.reason,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "leaves.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <EmployeeLayout>
      <div
        className="container mt-4 bg-secondary p-4 rounded"
        style={{ minHeight: "80vh" }}
      >
        <h4
          className="text-center"
          style={{
            textShadow: "2px 2px 5px rgba(0,0,0,0.7)",
            fontFamily: "cursive",
            color: "orange",
          }}
        >
          <span style={{ fontSize: "50px" }}>W</span>elcome{" "}
          {userName || "Employee"},
        </h4>

        <div className="row mt-4">
          {["Total", "Pending", "Approved", "Rejected"].map((label, index) => {
            const count = leaveStats[label.toLowerCase()];
            const color = ["primary", "warning", "success", "danger"][index];

            return (
              <div className="col-md-3 mb-3" key={label}>
                <div className={`card border-${color}`}>
                  <div className={`card-body text-${color}`}>
                    <h5>{label} Leaves</h5>
                    <h3>{count}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h5 className="mt-4 d-flex justify-content-between align-items-center">
          Recent Leave Requests
          <div>
            <button className="btn btn-sm btn-light me-2" onClick={exportToCSV}>
              Export CSV
            </button>
            <button className="btn btn-sm btn-light" onClick={exportToPDF}>
              Export PDF
            </button>
          </div>
        </h5>

        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {latestLeaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.leaveType}</td>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`badge bg-${
                      leave.status === "Approved"
                        ? "success"
                        : leave.status === "Rejected"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td>{leave.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
