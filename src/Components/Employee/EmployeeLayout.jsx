import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BiExit,
  BiNotification,
  BiSolidDashboard
} from "react-icons/bi";
import { FcLeave } from "react-icons/fc";
import { VscGitStashApply } from "react-icons/vsc";
import { MdCoPresent, MdEvent } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { CgEditMask } from "react-icons/cg";
import { IoDocuments } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import EmployeeNavbar from "./EmployeeNavbar";

const EmployeeLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems = [
    { name: "Dashboard", to: "/employee/dashboard", icon: <BiSolidDashboard /> },
    {
      name: "Leave Panel",
      icon: <FcLeave />,
      submenu: [
        { name: "Apply Leave", to: "/employee/apply-leave" },
        { name: "My Leave List", to: "/employee/my-leaves" },
      ]
    },
    {
      name: "Attendance",
      icon: <MdCoPresent />,
      submenu: [
        { name: "Mark Attendance", to: "/employee/mark-attendence" },
        { name: "My Attendance List", to: "/employee/my-attendence-list" },
        { name: "My Timesheet", to: "/employee/timesheet" },
      ]
    },
    {
      name: "WHF",
      icon: <MdCoPresent />,
      submenu: [
        { name: "Apply Form", to: "/wfh/apply" },
        { name: "WHF Lists", to: "/wfh/mine" },
      ]
    },
    { name: "Salary List", to: "/employee/salary-slips", icon: <CiBoxList /> },
    { name: "Tasks", to: "/employee/tasks", icon: <CgEditMask /> },
    { name: "Documents", to: "/employee/my-documents", icon: <IoDocuments /> },
    { name: "Events", to: "/employee/events", icon: <MdEvent /> },
    { name: "Exit", to: "/employee/exit-request", icon: <BiExit /> },
    { name: "All Notification", to: "/employee/notification", icon: <BiNotification /> },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <EmployeeNavbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen} />
      <div className="layout-wrapper">
        <div className={`sidebar bg-dark text-white p-3 shadow ${sidebarOpen ? "show" : ""} ${isMobile ? "mobile" : ""}`}>
{navItems.map((item, index) => {
  const isActive =
    location.pathname === item.to ||
    item.submenu?.some(sub => location.pathname === sub.to);

  return (
    <div key={index}>
      <div
        onClick={() => {
          if (item.submenu) {
            toggleMenu(item.name);
          } else if (item.to) {
            navigate(item.to); // 👈 navigate if no submenu
            if (isMobile) setSidebarOpen(false); // 👈 close sidebar on mobile
          }
        }}
        className={`sidebar-link d-flex align-items-center justify-content-between ${isActive ? "active" : ""}`}
        style={{ cursor: "pointer" }}
      >
        <div className="d-flex align-items-center">
          <span className="icon fs-5">{item.icon}</span>
          <span className="label ps-2 text-white">{item.name}</span>
        </div>
        {item.submenu && (
          <span className="text-white">{openMenus[item.name] ? "▲" : "▼"}</span>
        )}
      </div>

      {item.submenu && openMenus[item.name] && (
        <div className="ps-4">
          {item.submenu.map((sub, i) => (
            <Link
              key={i}
              to={sub.to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`sidebar-link d-flex align-items-center ${location.pathname === sub.to ? "active" : ""}`}
            >
              <span className="label ps-2 text-white">• {sub.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
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
