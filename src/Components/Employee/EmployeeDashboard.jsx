import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Form } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#f0ad4e", "#5bc0de", "#5cb85c"]; // Pending, In Progress, Completed

const EmployeeDashboard = () => {
  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [latestLeaves, setLatestLeaves] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
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

        // 🔽 Fetch tasks
        const taskRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/projects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const allTasks = [];

        taskRes.data.data.forEach((project) => {
          project.tasks.forEach((task) => {
            const assignedArray = Array.isArray(task.assignedTo)
              ? task.assignedTo
              : [task.assignedTo];

            if (
              assignedArray.some((e) =>
                typeof e === "object"
                  ? e?._id === employeeId
                  : e === employeeId
              )
            ) {
              allTasks.push({
                ...task,
                projectName: project.name,
              });
            }
          });
        });

        setMyTasks(allTasks);
      } catch (error) {
        console.error("Error loading dashboard:", error.message);
      }
    };

    fetchData();
  }, []);

  const getChartData = () => {
    const statusCount = { pending: 0, "in-progress": 0, completed: 0 };
    myTasks.forEach((t) => {
      statusCount[t.status] += 1;
    });

    return [
      { name: "Pending", value: statusCount.pending },
      { name: "In Progress", value: statusCount["in-progress"] },
      { name: "Completed", value: statusCount.completed },
    ];
  };

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
      <div className="container mt-4 bg-light p-4 rounded shadow-sm" style={{ minHeight: "90vh" }}>
        <h4 className="text-center text-primary mb-4">
          Welcome {userName || "Employee"}
        </h4>

        {/* Leave Stats */}
        <div className="row">
          {["Total", "Pending", "Approved", "Rejected"].map((label, index) => {
            const count = leaveStats[label.toLowerCase()];
            const color = ["primary", "warning", "success", "danger"][index];

            return (
              <div className="col-md-3 mb-3" key={label}>
                <div className={`card border-${color}`}>
                  <div className={`card-body text-${color}`}>
                    <h6>{label} Leaves</h6>
                    <h3>{count}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Leaves */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h5 className="text-dark">Recent Leave Requests</h5>
          <div>
            <button className="btn btn-sm btn-outline-success me-2" onClick={exportToCSV}>
              Export CSV
            </button>
            <button className="btn btn-sm btn-outline-primary" onClick={exportToPDF}>
              Export PDF
            </button>
          </div>
        </div>

        <table className="table table-bordered table-sm mt-2 text-center">
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
            {latestLeaves.length === 0 ? (
              <tr>
                <td colSpan={5}>No leave records found.</td>
              </tr>
            ) : (
              latestLeaves.map((leave) => (
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
              ))
            )}
          </tbody>
        </table>

        {/* Task Pie Chart */}
        <div className="mt-5">
          <h5 className="text-dark mb-3">📊 Task Progress Overview</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {getChartData().map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* My Tasks */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <h5>My Assigned Tasks</h5>
            <Form.Select
              style={{ width: "200px" }}
              size="sm"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </div>

          <table className="table table-bordered table-sm mt-3 text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.length === 0 ? (
                <tr>
                  <td colSpan={5}>No tasks assigned yet.</td>
                </tr>
              ) : (
                myTasks
                  .filter((t) => taskFilter === "all" || t.status === taskFilter)
                  .map((task, idx) => (
                    <tr key={task._id}>
                      <td>{idx + 1}</td>
                      <td>{task.title}</td>
                      <td>{task.projectName}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            task.status === "completed"
                              ? "success"
                              : task.status === "in-progress"
                              ? "warning"
                              : "secondary"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
