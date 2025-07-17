import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import AddAccountModal from "./AddAccountModal"; // ✅ Step 1
import AdminLayout from "./AdminLayout";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/finance/accounts`);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Swal.fire("Error", "Failed to fetch accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/finance/accounts/${id}`);
        setAccounts((prev) => prev.filter((acc) => acc._id !== id));
        Swal.fire("Deleted!", "Account has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire("Error", "Failed to delete account", "error");
      }
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <>
    <AdminLayout>
        <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📘 Account List</h1>

{/* Button to trigger modal using Bootstrap's data attributes */}
<button
  className="btn btn-primary"
  data-bs-toggle="modal"
  data-bs-target="#add_account_modal"
>
  ➕ Add Account
</button>

      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading accounts...</div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="w-full table-auto text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(accounts) && accounts.length > 0 ? (
                accounts.map((acc, index) => (
                  <tr key={acc._id} className="border-t">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{acc.accountName}</td>
                    <td className="px-4 py-3">{acc.accountType}</td>
                    <td className="px-4 py-3">₹{acc.balance.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          acc.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button className="text-blue-500 hover:text-blue-700">
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(acc._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      
{/* Include modal at bottom of JSX */}
<AddAccountModal fetchAccounts={fetchAccounts} />
    </div>
    </AdminLayout>
    </>
  );
};

export default AccountList;
