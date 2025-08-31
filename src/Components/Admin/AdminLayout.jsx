import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { BiSolidDashboard, BiExit, BiNotification } from "react-icons/bi";
import {
  FaUsers,
  FaQuestionCircle,
  FaAddressCard,
  FaRegHandPointRight,
  FaMoneyCheckAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import {
  MdEvent,
  MdMeetingRoom,
  MdOutlineAddHome,
  MdOutlineDesignServices,
} from "react-icons/md";
import { FcLeave } from "react-icons/fc";
import { IoListCircle, IoDocuments } from "react-icons/io5";
import { BsFillShiftFill } from "react-icons/bs";
import {
  TbCalendarDollar,
  TbDeviceProjector,
  TbFilter,
  TbJoinBevel,
} from "react-icons/tb";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems = [
    { name: "Dashboard", to: "/admin/dashboard", icon: <BiSolidDashboard /> },
    {
      name: "Reports",
      icon: <FaRegHandPointRight />,
      submenu: [
        { name: "Generate reports", to: "/admin/employee-reports" },
        { name: "Monthly Attendance", to: "/admin/MonthlyAttendance" },
        { name: "Leave", to: "/admin/leave-report" },
        { name: "Payroll", to: "/admin/payroll-report" },
      ],
    },
    {
      name: "Staff",
      icon: <FaUsers />,
      submenu: [
        { name: "Employee Approvals", to: "/pending-employee" },
        { name: "Employee", to: "/admin/employee-management" },
      ],
    },
    {
      name: "Attendance",
      icon: <IoListCircle />,
      submenu: [
        { name: "Employee Att. Lists", to: "/admin/employee-attendence-lists" },
        { name: "Office Timing", to: "/admin/office-timming" },
        { name: "Time Sheets", to: "/admin/time-sheets" },
        { name: "Bulk Attendance", to: "/admin/bulk-attendance" },
      ],
    },
    {
      name: "Leave Panel",
      icon: <FcLeave />,
      submenu: [{ name: "Leave Applications", to: "/admin/leaves" }],
    },
    {
      name: "Notification",
      icon: <BiNotification />,
      submenu: [
        { name: "Notification Template", to: "/admin/send-notification" },
        { name: "Notification History", to: "/admin/notification-history" },
      ],
    },
    {
      name: "Payroll",
      icon: <TbCalendarDollar />,
      submenu: [
        { name: "Set Salary", to: "/admin/payroll" },
        { name: "Full & Final", to: "/admin/fullandfinal" },
      ],
    },
    {
      name: "Meeting",
      icon: <MdMeetingRoom />,
      submenu: [
        { name: "Create Meeting", to: "/admin/meeting-form" },
        { name: "Meeting lists", to: "/admin/meeting-calender" },
      ],
    },
    {
      name: "Recruitment",
      icon: <TbJoinBevel />,
      submenu: [
        { name: "Create job", to: "/admin/jobcreate" },
        { name: "Job Lists", to: "/admin/joblist" },
        { name: "Job Candidates", to: "/jobs/candidates" },
        { name: "Interview Schedule", to: "/jobs/interview" },
      ],
    },
    { name: "Department", to: "/admin/department", icon: <FaAddressCard /> },
    {
      name: "Birthday/Anniversary",
      to: "/admin/bday-anniversary",
      icon: <FaBirthdayCake />,
    },
    { name: "Designations", to: "/admin/designations", icon: <TbFilter /> },
    {
      name: "WFH Requests",
      to: "/admin/wfh/requests",
      icon: <MdOutlineAddHome />,
    },
    { name: "Event", to: "/admin/events", icon: <MdEvent /> },
    { name: "Shifts", to: "/admin/shifts", icon: <BsFillShiftFill /> },
    {
      name: "Project",
      to: "/admin/project-management",
      icon: <TbDeviceProjector />,
    },
    { name: "Documents", to: "/admin/documents", icon: <IoDocuments /> },
    {
      name: "Employee Exit Lists",
      to: "/admin/employee-exit-lists",
      icon: <BiExit />,
    },
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
        <div
          className={`sidebar bg-dark text-white shadow ${
            sidebarOpen ? "show" : ""
          } ${isMobile ? "mobile" : ""}`}
        >
          <div className="p-3">
            {navItems.map((item, index) => {
              const isActive =
                location.pathname === item.to ||
                item.submenu?.some((sub) => location.pathname === sub.to);

              if (!item.submenu) {
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
              }

              return (
                <div key={index}>
                  <div
                    onClick={() => toggleMenu(item.name)}
                    className={`sidebar-link d-flex align-items-center justify-content-between ${
                      isActive ? "active" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="icon fs-5 text-white">{item.icon}</span>
                      <span className="label ps-2 text-white">{item.name}</span>
                    </div>
                    <span className="text-white">
                      {openMenus[item.name] ? "▲" : "▼"}
                    </span>
                  </div>

                  {openMenus[item.name] && (
                    <div className="ps-3">
                      {item.submenu.map((sub, i) => (
                        <Link
                          key={i}
                          to={sub.to}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={`sidebar-link d-flex align-items-center submenu-item ${
                            location.pathname === sub.to ? "active" : ""
                          }`}
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
          <div className="p-3 bg-light content-area">{children}</div>
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

        .sidebar::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 10px;
}
.sidebar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2); /* subtle scrollbar on hover */
}

/* Hide scrollbar for Firefox */
.sidebar {
  scrollbar-width: none;  /* Firefox */
}
.sidebar:hover {         /* Show slim scrollbar on hover */
  scrollbar-color: rgba(0,0,0,0) transparent;
}
.sidebar {
  scroll-behavior: smooth;
}

      `}</style>
    </>
  );
};

export default AdminLayout;
