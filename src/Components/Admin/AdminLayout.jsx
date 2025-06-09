import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaAddressCard, FaUsers } from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineDesignServices } from "react-icons/md";
import { FcLeave } from "react-icons/fc";
import { IoListCircle } from "react-icons/io5";
import { BsFillShiftFill } from "react-icons/bs";
import { TbCalendarDollar } from "react-icons/tb";

const AdminLayout = ({ children }) => {
  const [toggle, setToggle] = useState(true);
  const toggleFun = () => setToggle(!toggle);
  const location = useLocation();

  const arr = [
    {
      name: "Dashboard",
      to: "/admin/dashboard",
      icon: <BiSolidDashboard />,
    },
    {
      name: "Employee",
      to: "/admin/employee-management",
      icon: <FaUsers />,
    },
    {
      name: "Department",
      to: "/admin/department",
      icon: <FaAddressCard />,
    },
    {
      name: "Designation",
      to: "/admin/designations",
      icon: <MdOutlineDesignServices />,
    },
    {
      name: "Leave Panel",
      to: "/admin/leaves",
      icon: <FcLeave />,
    },
    {
      name: "Employee Att. Lists",
      to: "/admin/employee-attendence-lists",
      icon: <IoListCircle />,
    },
    {
      name: "Shifts",
      to: "/admin/shifts",
      icon: <BsFillShiftFill />,
    },
    {
      name: "Payrolls",
      to: "/admin/payroll",
      icon: <TbCalendarDollar />,
    },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div
        className={
          toggle
            ? "col-sm-2 men bg-dark text-white p-3"
            : "col-sm-1 men bg-dark text-white p-3"
        }
      >
        <div
          className="d-flex justify-content-between align-items-center mb-4"
          style={{ cursor: "pointer" }}
        >
          {toggle ? (
            <>
              <h4 className="m-0 ">Admin Panel</h4>
              <FiArrowLeft onClick={toggleFun} />
            </>
          ) : (
            <div className="w-100 text-center">
              <FiArrowRight onClick={toggleFun} />
            </div>
          )}
        </div>

        {arr.map((item, index) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={index} style={{ textDecoration: "none" }} to={item.to}>
              <h5
                className={`d-flex align-items-center gap-2 btn ${
                  isActive ? "text-danger" : "text-white"
                }`}
                style={
                  toggle
                    ? { padding: "5px 0" }
                    : {
                        textAlign: "center",
                        padding: "5px 0",
                        justifyContent: "center",
                      }
                }
              >
                <span className="fs-4">{item.icon}</span>{" "}
                {toggle ? item.name : ""}
              </h5>
            </Link>
          );
        })}
      </div>
      <div
        className={toggle ? "col-sm-10 p-4 bg-light" : "col-sm-11 p-4 bg-light"}
      >
        <div className="bg-white shadow-sm p-4 rounded">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
