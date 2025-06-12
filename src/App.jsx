import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import Navbar from "./Components/Common/Navbar";
import Home from "./Components/Home/Home";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import EmployeeDashboard from "./Components/Employee/EmployeeDashboard";
import Register from "./Components/Common/Register";
import Login from "./Components/Common/Login";
import Department from "./Components/Admin/Department";
import DesignationManagement from "./Components/Admin/Designation";
import AdminLeavePanel from "./Components/Admin/AdminLeavePanel";
import ApplyLeave from "./Components/Employee/ApplyLeave";
import MyLeaveList from "./Components/Employee/MyLeaveList";
import MarkAttendance from "./Components/Employee/MarkAttendance";
import Footer from "./Components/Home/Footer";
import MyAttendanceList from "./Components/Employee/MyAttendanceList";
import AdminAttendancePanel from "./Components/Admin/AdminAttendencePanel";
import ShiftManagement from "./Components/Admin/ShiftManagement";
import PayrollManagement from "./Components/Admin/PayrollManagement";
import MySalarySlips from "./Components/Employee/MySalarySlip";
import AdminEmployeeManagement from "./Components/Admin/AdminEmployeeManagement";
import ForgotPassword from "./Components/Common/ForgotPassword";
import VerifyOtp from "./Components/Common/VerifyOtp";
import ResetPassword from "./Components/Common/ResetPassword";
import AdminApproveEmployees from "./Components/Admin/AdminApproveEmployees";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/pending-employee" element={<AdminApproveEmployees/>}/>
          <Route path="/admin/department" element={<Department />} />
          <Route path="/admin/department/:id" element={<Department />} />
          <Route
            path="/admin/designations"
            element={<DesignationManagement />}
          />
          <Route path="/admin/shifts" element={<ShiftManagement />} />
          <Route path="/admin/leaves" element={<AdminLeavePanel />} />
          <Route
            path="/admin/employee-attendence-lists"
            element={<AdminAttendancePanel />}
          />
          <Route path="/admin/payroll" element={<PayrollManagement />} />
          <Route
            path="/admin/employee-management"
            element={<AdminEmployeeManagement />}
          />

          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/apply-leave" element={<ApplyLeave />} />
          <Route path="/employee/my-leaves" element={<MyLeaveList />} />
          <Route
            path="/employee/mark-attendence"
            element={<MarkAttendance />}
          />
          <Route
            path="/employee/my-attendence-list"
            element={<MyAttendanceList />}
          />
          
          <Route path="/employee/salary-slips" element={<MySalarySlips />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
