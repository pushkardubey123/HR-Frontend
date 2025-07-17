import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import {
  BiSolidDashboard, BiExit
} from "react-icons/bi";
import {
  FaUsers, FaQuestionCircle, FaAddressCard, FaRegHandPointRight,
  FaMoneyCheckAlt
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
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

const navItems = [
  { name: "Dashboard", to: "/admin/dashboard", icon: <BiSolidDashboard /> },
  {
    name: "Reports", icon: <FaRegHandPointRight />,
    submenu: [
      { name: "Generate reports", to: "/admin/employee-reports" },
      { name: "Monthly Attendance", to: "/admin/MonthlyAttendance" },
      { name: "Leave", to: "/admin/leave-report" },
      { name: "Payroll", to: "/admin/payroll-report" },
    ]
  },
  {
    name: "Staff", icon: <FaUsers />,
    submenu: [
      { name: "Employee Approvals", to: "/pending-employee" },
      { name: "Employee", to: "/admin/employee-management" }
    ]
  },
  {
    name: "Attendance", icon: <IoListCircle />,
    submenu: [
      { name: "Employee Att. Lists", to: "/admin/employee-attendence-lists" },
      { name: "Office Timing", to: "/admin/office-timming" },
      { name: "Time Sheets", to: "/admin/time-sheets" },
      { name: "Bulk Attendance", to: "/admin/bulk-attendance" },
    ]
  },
  {
    name: "Leave Panel", icon: <FcLeave />,
    submenu: [{ name: "Leave Applications", to: "/admin/leaves" }]
  },
  {
    name: "Payroll", icon: <TbCalendarDollar />,
    submenu: [
      { name: "Set Salary", to: "/admin/payroll" },
      { name: "Full & Final", to: "/admin/fullandfinal" },
    ]
  },
  {
    name: "Finance", icon: <FaMoneyCheckAlt />,
    submenu: [
      { name: "Account List", to: "/admin/AccountList" },
      { name: "Account Balance", to: "/admin/finance/balance" },
      { name: "Payees", to: "/admin/finance/payees" },
      { name: "Payers", to: "/admin/finance/payers" },
      { name: "Deposit", to: "/admin/finance/deposit" },
      { name: "Company Expense", to: "/admin/finance/company-expense" },
      { name: "Transfer Balance", to: "/admin/finance/transfer" },
      { name: "Employee Expense", to: "/admin/finance/employee-expense" },
    ]
  },
  { name: "Department", to: "/admin/department", icon: <FaAddressCard /> },
  { name: "Designation", to: "/admin/designations", icon: <MdOutlineDesignServices /> },
  { name: "Shifts", to: "/admin/shifts", icon: <BsFillShiftFill /> },
  { name: "Project", to: "/admin/project-management", icon: <TbDeviceProjector /> },
  { name: "Documents", to: "/admin/documents", icon: <IoDocuments /> },
  { name: "Employee Exit Lists", to: "/admin/employee-exit-lists", icon: <BiExit /> },
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
      <AdminNavbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="layout-wrapper">
        <div className={`sidebar bg-dark text-white shadow ${sidebarOpen ? "show" : ""} ${isMobile ? "mobile" : ""}`}>
          <div className="p-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.to || (item.submenu?.some(sub => location.pathname === sub.to));

              if (!item.submenu) {
                return (
                  <Link
                    key={index}
                    to={item.to}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`sidebar-link d-flex align-items-center ${isActive ? "active" : ""}`}
                  >
                    <span className="icon fs-5 text-white">{item.icon}</span>
                    <span className="label ps-2 text-white">{item.name}</span>
                  </Link>
                );
              }

              return (
                <div key={index}>
                  <div
                    onClick={() => toggleMenu(item.name)}
                    className={`sidebar-link d-flex align-items-center justify-content-between ${isActive ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="icon fs-5 text-white">{item.icon}</span>
                      <span className="label ps-2 text-white">{item.name}</span>
                    </div>
                    <span className="text-white">{openMenus[item.name] ? "▲" : "▼"}</span>
                  </div>

                  {openMenus[item.name] && (
                    <div className="ps-3">
                      {item.submenu.map((sub, i) => (
                        <Link
                          key={i}
                          to={sub.to}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={`sidebar-link d-flex align-items-center submenu-item ${location.pathname === sub.to ? "active" : ""}`}
                        >
                          <span className="ps-4 text-white">• {sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="main-content">
          <div className="p-3 bg-light content-area">
            <div className="bg-white shadow-sm p-4 rounded">
              {children}
            </div>
          </div>
        </div>
      </div>

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
          overflow: hidden;
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
        }

        .sidebar-link:hover {
          background-color: #495057;
        }

        .sidebar-link.active {
          background-color: #dc3545;
        }

        .submenu-item {
          font-size: 0.95rem;
        }

        .main-content {
          flex-grow: 1;
          overflow-y: auto;
          height: 100vh;
        }

        .content-area {
          min-height: 100%;
        }
      `}</style>
    </>
  );
};

export default AdminLayout;
