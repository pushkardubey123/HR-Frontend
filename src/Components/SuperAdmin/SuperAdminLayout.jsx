import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
import { FaUserCheck } from "react-icons/fa";
import SuperAdminNavbar from "./SuperAdminNavbar";

const SuperAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", to: "/superadmin/dashboard", icon: <BiSolidDashboard /> },
    { name: "Approve Pending Admin", to: "/superadmin/approve-pending-admin", icon: <FaUserCheck /> },
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
      <SuperAdminNavbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="layout-wrapper">
        {/* Sidebar */}
        <div
          className={`sidebar bg-dark text-white shadow ${
            sidebarOpen ? "show" : ""
          } ${isMobile ? "mobile" : ""}`}
        >
          <div className="p-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={index}
                  to={item.to}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`sidebar-link d-flex align-items-center ${
                    isActive ? "active" : ""
                  }`}
                >
                  <span className="icon fs-5 text-white">{item.icon}</span>
                  <span className="label ps-2 text-white">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="p-3 bg-light content-area">{children}</div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .layout-wrapper {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .sidebar {
          width: 260px;
          background-color: #212529;
          flex-shrink: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #888 transparent;
          transition: all 0.3s ease;
          position: relative;
        }

        .sidebar.mobile {
          position: fixed;
          top: 56px;
          left: -260px;
          z-index: 1000;
          height: calc(100vh - 56px);
        }

        .sidebar.mobile.show {
          left: 0;
        }

        .sidebar-link {
          padding: 10px;
          color: white;
          text-decoration: none;
          margin-bottom: 8px;
          border-radius: 5px;
          width: 100%;
          transition: background 0.3s;
        }

        .sidebar-link:hover {
          background-color: #495057;
        }

        .sidebar-link.active {
          background-color: #dc3545;
        }

        .main-content {
          flex-grow: 1;
          overflow-y: auto;
          height: 100vh;
        }

        .content-area {
          min-height: 100%;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
        }
        .sidebar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .sidebar {
          scrollbar-width: none;
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};

export default SuperAdminLayout;
