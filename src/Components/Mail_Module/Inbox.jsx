import React, { useState } from "react";
import { Modal, Button, ListGroup, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Inbox = () => {
  const dummyMails = [
    {
      id: 1,
      sender: "admin@company.com",
      subject: "Welcome",
      message: "Welcome to the team!",
      recipients: ["employee@company.com"],
      attachments: ["welcome.pdf"],
    },
    {
      id: 2,
      sender: "hr@company.com",
      subject: "Holiday Notice",
      message: "Office will be closed on 15th Aug.",
      recipients: ["all@company.com"],
      attachments: [],
    },
  ];

  const [selectedMail, setSelectedMail] = useState(null);
  const [show, setShow] = useState(false);

  const openModal = (mail) => {
    setSelectedMail(mail);
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setSelectedMail(null);
  };

  return (
    <Container className="mt-5">
      <h3>📥 Inbox</h3>
      <ListGroup className="mt-4">
        {dummyMails.map((mail) => (
          <ListGroup.Item
            key={mail.id}
            action
            onClick={() => openModal(mail)}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{mail.subject}</strong> —{" "}
              <span className="text-muted">{mail.message.slice(0, 40)}...</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* ✅ React-Bootstrap Modal */}
      <Modal show={show} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMail?.sender}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{selectedMail?.subject}</h5>
          <p>
            <strong>To:</strong> {selectedMail?.recipients.join(", ")}
          </p>
          <p>{selectedMail?.message}</p>
          <hr />
          <h6>Attachments:</h6>
          {selectedMail?.attachments.length ? (
            selectedMail.attachments.map((file, idx) => (
              <div key={idx}>
                <a href="#!" download>{file}</a>
              </div>
            ))
          ) : (
            <p className="text-muted">No attachments</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inbox;
