// src/Components/Mail_Module/Inbox.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Loader from "../Admin/Loader/Loader";
import {
  FaTrashAlt,
  FaPaperclip,
  FaRegEnvelope,
  FaUser,
} from "react-icons/fa";

import {
  Container,
  ListGroup,
  Modal,
  Button,
  Badge,
} from "react-bootstrap";

const Inbox = () => {
  // ─────────────────────────────── state ────────────────────────────────
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────── auth details ─────────────────────────────
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { token, role } = user;

  // ────────────────────────── fetch inbox ───────────────────────────────
  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/mail/${
          role === "admin" ? "" : "my-mails"
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMails(res.data.data);
    } catch (err) {
      console.error("❌ Inbox load error", err);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────── move to trash ─────────────────────────────
  const moveToTrash = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mail/trash/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Moved", "Mail moved to trash", "success");
      fetchInbox();
    } catch (err) {
      Swal.fire("Error", "Failed to move to trash", "error");
    }
  };

  // ────────────────────────── open preview ──────────────────────────────
  const openModal = (mail) => {
    setSelectedMail(mail);
    setShowPreview(true);
  };

  // ─────────────────────────── on mount ─────────────────────────────────
  useEffect(() => {
    fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────── render ───────────────────────────────────
  return (
    <Container className="my-3">
      <h5 className="text-success fw-bold">📥 Inbox</h5>

      {loading ? (
        <Loader />
      ) : mails.length === 0 ? (
        <p className="text-muted mt-4">No mails found</p>
      ) : (
        <ListGroup className="mt-3 shadow-sm">
          {mails.map((mail) => (
            <ListGroup.Item
              key={mail._id}
              className="d-flex justify-content-between align-items-center"
              action
              onClick={() => openModal(mail)}
            >
              <div className="d-flex align-items-center gap-3">
                <FaRegEnvelope className="text-primary" />
                <div>
                  <div className="fw-semibold">
                    {mail.sender?.email || "Unknown"}
                  </div>
                  <div className="text-muted small">
                    <strong>{mail.subject}</strong> —{" "}
                    {mail.message.slice(0, 60)}...
                  </div>
                </div>
              </div>

              <div className="text-end">
                <div className="text-muted small">
                  {new Date(mail.createdAt).toLocaleDateString()}
                </div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveToTrash(mail._id);
                  }}
                >
                  <FaTrashAlt />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* ──────────────────────── Preview Modal ─────────────────────────── */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaUser className="text-primary" />
            {selectedMail?.sender?.email}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "#f5f7fa" }}>
          {selectedMail ? (
            <>
              <div
                className="p-3 rounded shadow-sm mb-3 bg-white"
                style={{ borderLeft: "4px solid #0d6efd" }}
              >
                <h5 className="text-dark">{selectedMail.subject}</h5>
                <p className="text-muted small mb-1">
                  <strong>To:</strong>{" "}
                  {selectedMail.recipients?.join(", ")}
                </p>
                <div
                  className="p-3 bg-light rounded"
                  style={{
                    fontFamily: "Segoe UI, sans-serif",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedMail.message}
                </div>
              </div>

              <div className="mt-3">
                <h6 className="text-muted d-flex align-items-center gap-2">
                  <FaPaperclip />
                  Attachments:
                </h6>
                {selectedMail.attachments?.length ? (
                  <div className="d-flex gap-2 flex-wrap mt-2">
                    {selectedMail.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={`${import.meta.env.VITE_API_URL}/mail/download/${att}`}
                        className="btn btn-sm btn-outline-secondary"
                        download
                      >
                        {att}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No attachments</p>
                )}
              </div>
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inbox;
