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
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx"; // NEW ICONS

const AdminLayout = ({ children }) => {
  const [toggle, setToggle] = useState(true);
  const location = useLocation();

  // Collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      setToggle(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div className="d-flex" style={{ minHeight: "100vh", overflow: "hidden" }}>
      <div
        className={`bg-dark text-white p-3 sidebar ${
          toggle ? "expanded" : "collapsed"
        }`}
      >
        <div className="d-flex justify-content-end toggle-header">
          {toggle ? (
            <>
            <RxCross2
              onClick={() => setToggle(false)}
              size={24}
              style={{ cursor: "pointer" }}
            />
            </>
          ) : (
            <RxHamburgerMenu
              onClick={() => setToggle(true)}
              size={24}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>

        {arr.map((item, index) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={index}
              to={item.to}
              style={{ textDecoration: "none" }}
              className={`sidebar-link d-flex align-items-center ${
                toggle ? "justify-content-start" : "justify-content-center"
              } ${isActive ? "active" : ""}`}
            >
              <span className="icon fs-5">{item.icon}</span>
              {toggle && <span className="label ps-1">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 bg-light">
        <div className="bg-white shadow-sm p-4 rounded">{children}</div>
      </div>

      {/* CSS */}
      <style>{`
        .sidebar {
          transition: width 0.3s ease;
        }
        .sidebar.expanded {
          width: 220px;
        }
        .sidebar.collapsed {
          width: 70px;
        }
        .sidebar-link {
          padding: 10px 15px;
          color: white;
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.2s ease-in-out;
        }
        .sidebar-link:hover {
          background-color: #495057;
        }
        .sidebar-link.active {
          background-color: #dc3545;
          color: white;
        }
        .sidebar-link .icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-link .label {
          font-size: 16px;
        }
        .toggle-header {
          height: 40px;
          padding: 0 5px;
        }
        @media (max-width: 768px) {
          .sidebar.expanded {
            width: 170px;
          }
          .sidebar-link .label {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
