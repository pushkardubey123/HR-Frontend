import React from "react";
import toast from "react-hot-toast";

const LOgout = () => {
  const handleLogout = () => {
    try {
      localStorage.removeItem("User");
      toast.success("Logout Successfully");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div>
      <button
        className="px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default LOgout;
