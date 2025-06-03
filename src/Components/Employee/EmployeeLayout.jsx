import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { BiSolidDashboard } from "react-icons/bi";
import { FcLeave } from "react-icons/fc";
import { VscGitStashApply } from "react-icons/vsc";
import { MdCoPresent } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";

const EmployeeLayout = ({ children }) => {
  const [toggle, setToggle] = useState(true);
  const toggleFun = () => setToggle(!toggle);
  const location = useLocation();

  const arr = [
    {
      name: "Dashboard",
      to: "/employee/dashboard",
      icon: <BiSolidDashboard />,
    },
    {
      name: "Apply Leave",
      to: "/employee/apply-leave",
      icon: <VscGitStashApply />,
    },
    {
      name: "My Leave List",
      to: "/employee/my-leaves",
      icon: <FcLeave />,
    },
    {
      name: "Attendence",
      to: "/employee/mark-attendence",
      icon: <MdCoPresent />,
    },
    {
      name: "Attendence List",
      to: "/employee/my-attendence-list",
      icon: <CiBoxList />,
    },
    {
      name: "Salary List",
      to: "/employee/salary-slips",
      icon: <CiBoxList />,
    },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className={toggle ? "col-sm-2  bg-dark text-white p-3" : "col-sm-1  bg-dark text-white p-3"}>
        <div
          className="d-flex justify-content-between align-items-center mb-4"
          style={{ cursor: "pointer" }}
        >
          {toggle ? (
            <>
              <h4 className="m-0 ">Employee Panel</h4>
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
                    : { textAlign: "center", padding: "5px 0", justifyContent: "center" }
                }
              >
                <span className="fs-4">{item.icon}</span> {toggle ? item.name : ""}
              </h5>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className={toggle ? "col-sm-10 p-4 bg-light" : "col-sm-11 p-4 bg-light"}>
        <div className="bg-white shadow-sm p-4 rounded">{children}</div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
