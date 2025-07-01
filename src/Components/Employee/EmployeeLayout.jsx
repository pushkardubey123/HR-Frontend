import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BiExit,
  BiSolidDashboard
} from "react-icons/bi";
import { FcLeave } from "react-icons/fc";
import { VscGitStashApply } from "react-icons/vsc";
import { MdCoPresent } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { CgEditMask } from "react-icons/cg";
import { IoDocuments } from "react-icons/io5";
import EmployeeNavbar from "./EmployeeNavbar";

const EmployeeLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", to: "/employee/dashboard", icon: <BiSolidDashboard /> },
    { name: "Apply Leave", to: "/employee/apply-leave", icon: <VscGitStashApply /> },
    { name: "My Leave List", to: "/employee/my-leaves", icon: <FcLeave /> },
    { name: "Attendence", to: "/employee/mark-attendence", icon: <MdCoPresent /> },
    { name: "Attendence List", to: "/employee/my-attendence-list", icon: <CiBoxList /> },
    { name: "Salary List", to: "/employee/salary-slips", icon: <CiBoxList /> },
    { name: "Tasks", to: "/employee/tasks", icon: <CgEditMask /> },
    { name: "Documents", to: "/employee/my-documents", icon: <IoDocuments /> },
    { name: "Exit", to: "/employee/exit-request", icon: <BiExit /> },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // open by default on desktop
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <>
      <EmployeeNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="layout-wrapper">
        <div
          className={`sidebar bg-dark text-white p-3 shadow ${sidebarOpen ? "show" : ""} ${isMobile ? "mobile" : ""}`}
        >
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={index}
                to={item.to}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`sidebar-link d-flex align-items-center ${isActive ? "active" : ""}`}
              >
                <span className="icon fs-5">{item.icon}</span>
                <span className="label ps-2 text-white">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="main-content flex-grow-1">
          <div className="p-3 bg-light min-vh-100">
            <div className="bg-white shadow-sm p-4 rounded">{children}</div>
          </div>
        </div>
      </div>

      <style>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .sidebar {
          width: 220px;
          transition: all 0.3s ease-in-out;
        }

        .sidebar.mobile {
          position: fixed;
          top: 56px;
          left: -250px;
          height: calc(100vh - 56px);
          z-index: 1000;
        }

        .sidebar.mobile.show {
          left: 0;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 10px;
          color: white;
          text-decoration: none;
          margin-bottom: 8px;
          border-radius: 5px;
        }

        .sidebar-link:hover {
          background-color: #495057;
        }

        .sidebar-link.active {
          background-color: #dc3545;
        }

        .main-content {
          flex-grow: 1;
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default EmployeeLayout;
