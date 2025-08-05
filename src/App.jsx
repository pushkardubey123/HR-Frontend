import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
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
import ProjectManagement from "./Components/Admin/ProjectManagement";
import EmployeePanel from "./Components/Employee/EmployeePanel";
import Document from "./Components/Admin/Document";
import EmployeeDocument from "./Components/Employee/EmployeeDocument";
import EmployeeExit from "./Components/Employee/EmployeeExit";
import AdminExit from "./Components/Admin/AdminExit";
import AdminReport from "./Components/Admin/AdminReports";
import MailLayout from "./Components/Mail_Module/MailLayout";
import ComposeMail from "./Components/Mail_Module/ComposeMail";
import Inbox from "./Components/Mail_Module/Inbox";
import SentMails from "./Components/Mail_Module/SentMails";
import Trash from "./Components/Mail_Module/Trash";
import OfficeTiming from "./Components/Admin/OfficeTimmings";
import Timesheet from "./Components/Admin/Attendence/Timesheet";
import EmployeeTimesheet from "./Components/Employee/Attendence/TimeSheetEmployee";
import BulkAttendancePanel from "./Components/Admin/BulkAttendance";
import MonthlyAttendance from "./Components/Admin/MonthlyAttendance";
import LeaveReport from "./Components/Admin/LeaveReport";
import PayrollReport from "./Components/Admin/PayrollReport";
import FullAndFinalSalary from "./Components/Admin/FullAndFinalSalary";
import ApplyWFHForm from "./Components/Employee/ApplyWFHForm";
import MyWFHRequests from "./Components/Employee/MyWFHRequests";
import AdminWFHList from "./Components/Admin/AdminWFHList";
import SendNotification from "./Components/Admin/SendNotification";
import NotificationHistory from "./Components/Admin/NotificationHistory";
import EmployeeNotifications from "./Components/Employee/EmployeeNotifications";
import EventManagement from "./Components/Admin/EventManagement";
import EmployeeEvents from "./Components/Employee/EmployeeEvents";
import CreateMeetingForm from "./Components/Admin/CreateMeetingForm";
import MeetingCalendar from "./Components/Admin/MeetingCalendar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mail" element={<MailLayout/>}>
  <Route path="compose" element={<ComposeMail />} />
  <Route path="inbox" element={<Inbox />} />
  <Route path="sent" element={<SentMails />} />
  <Route path="trash" element={<Trash/>} />
</Route>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/pending-employee" element={<AdminApproveEmployees/>}/>
          <Route path="admin/leave-report" element={<LeaveReport/>}/>
          <Route path="admin/payroll-report" element={<PayrollReport/>}/>
          <Route path="/admin/department" element={<Department />} />
          <Route path="/admin/department/:id" element={<Department />} />
          <Route path="/admin/employee-exit-lists" element={<AdminExit />} />
          <Route path="/admin/employee-reports" element={<AdminReport/>} />
          <Route
            path="/admin/designations"
            element={<DesignationManagement />}
          />
          <Route path="/admin/shifts" element={<ShiftManagement />} />
          <Route path="/admin/leaves" element={<AdminLeavePanel />} />
          <Route path="/admin/office-timming" element={<OfficeTiming />} />
          <Route path="/wfh/apply" element={<ApplyWFHForm/>} />
          <Route path="/wfh/mine" element={<MyWFHRequests />} />
          <Route path="/admin/wfh/requests" element={<AdminWFHList />} />
          <Route path="/admin/MonthlyAttendance" element={<MonthlyAttendance />} />
          <Route path="/admin/fullandfinal" element={<FullAndFinalSalary/>} />
          <Route path="/admin/send-notification" element={<SendNotification/>} />
          <Route path="/admin/notification-history" element={<NotificationHistory/>} />
          <Route path="/admin/events" element={<EventManagement/>} />
          <Route path="/admin/meeting-form" element={<CreateMeetingForm/>} />
          <Route path="/admin/meeting-calender" element={<MeetingCalendar/>} />
          <Route
            path="/admin/employee-attendence-lists"
            element={<AdminAttendancePanel />}
          />
          <Route path="/admin/payroll" element={<PayrollManagement />} />
          <Route
            path="/admin/employee-management"
            element={<AdminEmployeeManagement />}
          />
          <Route
            path="/admin/project-management"
            element={<ProjectManagement />}
          />
          <Route
            path="/admin/documents"
            element={<Document />}
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
          <Route
            path="/employee/my-documents"
            element={<EmployeeDocument />}
          />
          
          <Route path="/employee/salary-slips" element={<MySalarySlips />} />
          <Route path="/employee/exit-request" element={<EmployeeExit/>} />
          <Route path="/employee/notification" element={<EmployeeNotifications/>} />
          <Route path="/employee/tasks" element={<EmployeePanel />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/employee/timesheet" element={<EmployeeTimesheet />} />
          <Route path="/admin/bulk-attendance" element={<BulkAttendancePanel />} />
          <Route path="/employee/events" element={<EmployeeEvents/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
