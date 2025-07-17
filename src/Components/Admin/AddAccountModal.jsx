import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";


const AddAccountModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    accountType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Account Added:", formData);
    handleClose(); // Close modal after submission
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add New Account</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Account Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter account name"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter account number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter bank name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Account Type</Form.Label>
            <Form.Select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Type --</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Account
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAccountModal;
