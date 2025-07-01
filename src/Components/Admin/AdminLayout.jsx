// src/components/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import {
  BiSolidDashboard,
  BiExit
} from "react-icons/bi";
import {
  FaUsers,
  FaQuestionCircle,
  FaAddressCard,
  FaRegHandPointRight
} from "react-icons/fa";
import { MdOutlineDesignServices } from "react-icons/md";
import { FcLeave } from "react-icons/fc";
import { IoListCircle, IoDocuments } from "react-icons/io5";
import { BsFillShiftFill } from "react-icons/bs";
import { TbCalendarDollar, TbDeviceProjector } from "react-icons/tb";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", to: "/admin/dashboard", icon: <BiSolidDashboard /> },
    { name: "Employee Approvals", to: "/pending-employee", icon: <FaQuestionCircle /> },
    { name: "Employee", to: "/admin/employee-management", icon: <FaUsers /> },
    { name: "Department", to: "/admin/department", icon: <FaAddressCard /> },
    { name: "Designation", to: "/admin/designations", icon: <MdOutlineDesignServices /> },
    { name: "Leave Panel", to: "/admin/leaves", icon: <FcLeave /> },
    { name: "Employee Att. Lists", to: "/admin/employee-attendence-lists", icon: <IoListCircle /> },
    { name: "Shifts", to: "/admin/shifts", icon: <BsFillShiftFill /> },
    { name: "Payrolls", to: "/admin/payroll", icon: <TbCalendarDollar /> },
    { name: "Project", to: "/admin/project-management", icon: <TbDeviceProjector /> },
    { name: "Documents", to: "/admin/documents", icon: <IoDocuments /> },
    { name: "Employee Exit Lists", to: "/admin/employee-exit-lists", icon: <BiExit /> },
    { name: "Reports", to: "/admin/employee-reports", icon: <FaRegHandPointRight /> },
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
      <AdminNavbar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="layout-wrapper">
        <div className={`sidebar bg-dark text-white p-3 shadow ${sidebarOpen ? "show" : ""} ${isMobile ? "mobile" : ""}`}>
          {isMobile && (
            <div className="d-flex justify-content-end mb-3">
              {/* Close button handled in navbar */}
            </div>
          )}

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
          top: 0;
          left: -250px;
          height: 100vh;
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
          .sidebar.mobile {
  position: fixed;
  top: 56px; /* height of navbar */
  left: -250px;
  width: 220px;
  height: calc(100vh - 56px); /* rest of the screen height */
  z-index: 1000;
}

.sidebar.mobile.show {
  left: 0;
}

      `}</style>
    </>
  );
};

export default AdminLayout;
