import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
import { FcLeave } from "react-icons/fc";
import { VscGitStashApply } from "react-icons/vsc";
import { MdCoPresent } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

const EmployeeLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const arr = [
    { name: "Dashboard", to: "/employee/dashboard", icon: <BiSolidDashboard /> },
    { name: "Apply Leave", to: "/employee/apply-leave", icon: <VscGitStashApply /> },
    { name: "My Leave List", to: "/employee/my-leaves", icon: <FcLeave /> },
    { name: "Attendence", to: "/employee/mark-attendence", icon: <MdCoPresent /> },
    { name: "Attendence List", to: "/employee/my-attendence-list", icon: <CiBoxList /> },
    { name: "Salary List", to: "/employee/salary-slips", icon: <CiBoxList /> },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // open on desktop, hidden on mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white p-3 shadow ${sidebarOpen ? "show" : ""} ${isMobile ? "mobile" : ""}`}>
        {isMobile && (
          <div className="d-flex justify-content-end mb-3">
            <RxCross2 onClick={() => setSidebarOpen(false)} size={24} style={{ cursor: "pointer" }} />
          </div>
        )}
        <h5 className="text-white mb-4">Employee Panel</h5>
        {arr.map((item, index) => {
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

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        {isMobile && (
          <div className="top-bar d-flex justify-content-between align-items-center p-2 bg-white shadow-sm">
            <RxHamburgerMenu onClick={() => setSidebarOpen(true)} size={24} style={{ cursor: "pointer" }} />
            <h5 className="m-auto">Employee Panel</h5>
          </div>
        )}

        <div className="p-3 bg-light min-vh-100">
          <div className="bg-white shadow-sm p-4 rounded">{children}</div>
        </div>
      </div>

      {/* CSS */}
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
          top: 0;
          left: -250px;
          width: 220px;
          height: 100vh;
          z-index: 1000;
        }

        .sidebar.mobile.show {
          left: 0;
          background-color: #212529;
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

        .top-bar {
          position: sticky;
          top: 0;
          z-index: 500;
        }

        .main-content {
          flex-grow: 1;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default EmployeeLayout;
