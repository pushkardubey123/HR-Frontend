import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaAddressCard,
  FaQuestionCircle,
  FaUsers,
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineDesignServices } from "react-icons/md";
import { FcLeave } from "react-icons/fc";
import { IoListCircle } from "react-icons/io5";
import { BsFillShiftFill } from "react-icons/bs";
import { TbCalendarDollar } from "react-icons/tb";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const arr = [
    { name: "Dashboard", to: "/admin/dashboard", icon: <BiSolidDashboard /> },
    { name: "Employee Approvals", to: "/pending-employee", icon: <FaQuestionCircle /> },
    { name: "Employee", to: "/admin/employee-management", icon: <FaUsers /> },
    { name: "Department", to: "/admin/department", icon: <FaAddressCard /> },
    { name: "Designation", to: "/admin/designations", icon: <MdOutlineDesignServices /> },
    { name: "Leave Panel", to: "/admin/leaves", icon: <FcLeave /> },
    { name: "Employee Att. Lists", to: "/admin/employee-attendence-lists", icon: <IoListCircle /> },
    { name: "Shifts", to: "/admin/shifts", icon: <BsFillShiftFill /> },
    { name: "Payrolls", to: "/admin/payroll", icon: <TbCalendarDollar /> },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Desktop: open, Mobile: hidden
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
        {/* Top Bar with Hamburger */}
        {isMobile && (
          <div className="top-bar d-flex justify-content-between align-items-center p-2 bg-white shadow-sm">
            <RxHamburgerMenu onClick={() => setSidebarOpen(true)} size={24} style={{ cursor: "pointer" }} />
            <h5 className="m-auto">Admin Panel</h5>
          </div>
        )}

        {/* Actual Page Content */}
        <div className="p-3 bg-light min-vh-100">
          <div className="bg-white shadow-sm p-4 rounded">{children}</div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .layout-wrapper {
          display: flex;
          min-height: 40vh;
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

export default AdminLayout;
