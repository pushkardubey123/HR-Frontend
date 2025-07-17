// src/components/Finance/AddAccountModal.jsx
import React from "react";

const AddAccountModal = ({ fetchAccounts }) => {
  return (
    <div
      className="modal fade"
      id="add_account_modal"
      tabIndex="-1"
      aria-labelledby="addAccountLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="addAccountLabel">➕ Add New Account</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {/* Add your form here */}
            <form>
              <div className="mb-3">
                <label className="form-label">Account Name</label>
                <input type="text" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Account Number</label>
                <input type="text" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select className="form-select">
                  <option>Savings</option>
                  <option>Current</option>
                  <option>Cash</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Balance</label>
                <input type="number" className="form-control" />
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Account</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;
