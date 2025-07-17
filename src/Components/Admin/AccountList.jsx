// src/components/Finance/AccountList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddAccountModal from "./AddAccountModal";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAccounts = async () => {
    const res = await axios.get("/api/finance/accounts");
    setAccounts(res.data.accounts || []);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">📘 Account List</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Add Account
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Account Name</th>
            <th>Type</th>
            <th>Balance (₹)</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length > 0 ? (
            accounts.map((acc, idx) => (
              <tr key={acc._id}>
                <td>{idx + 1}</td>
                <td>{acc.name}</td>
                <td>{acc.type}</td>
                <td>{acc.balance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      <AddAccountModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        fetchAccounts={fetchAccounts}
      />
    </div>
  );
};

export default AccountList;
