import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Admin/Loader/Loader";
import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";
import { FaPaperclip, FaTrashRestore, FaTrashAlt } from "react-icons/fa";
import { BsFileEarmarkPdfFill, BsFileEarmarkImage } from "react-icons/bs";

const Trash = () => {
  const [trashMails, setTrashMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mail/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashMails(res.data.data);
    } catch (err) {
      console.error("Trash fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mail/restore/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Restored", "Mail has been restored", "success");
      fetchTrash();
    } catch (err) {
      console.error("Restore error", err);
      Swal.fire("Error", "Could not restore mail", "error");
    }
  };

  const handleDeleteForever = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Permanently?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/mail/permanent-delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted", "Mail deleted permanently", "success");
        fetchTrash();
      } catch (err) {
        console.error("Permanent delete error", err);
        Swal.fire("Error", "Could not delete mail", "error");
      }
    }
  };

  return (
    <div className="mt-3">
      <h5 className="text-danger">🗑️ Trash</h5>

      {loading ? (
        <Loader />
      ) : trashMails.length === 0 ? (
        <p className="text-muted mt-4">No trashed mails found.</p>
      ) : (
        <div className="list-group mt-3">
          {trashMails.map((mail) => (
            <div
              key={mail._id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
              style={{ cursor: "pointer", borderLeft: "4px solid #dc3545" }}
              onClick={() => setSelectedMail(mail)}
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">
                  From: {mail.sender?.email || "N/A"}
                </div>
                <div className="text-dark fw-semibold">To: {mail.recipients.join(", ")}</div>
                <div className="text-muted small">{mail.subject}</div>

                {mail.attachments?.length > 0 && (
                  <div className="d-flex gap-2 mt-1 flex-wrap">
                    {mail.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="badge bg-light border text-dark d-flex align-items-center px-2"
                      >
                        {att.endsWith(".pdf") ? (
                          <BsFileEarmarkPdfFill className="text-danger me-1" />
                        ) : (
                          <BsFileEarmarkImage className="text-info me-1" />
                        )}
                        {att.length > 20 ? att.slice(0, 18) + "..." : att}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-muted small">
                {new Date(mail.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal show={!!selectedMail} onHide={() => setSelectedMail(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedMail?.subject}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>From:</strong> {selectedMail?.sender?.email}</p>
          <p><strong>To:</strong> {selectedMail?.recipients?.join(", ")}</p>
          <hr />
          <p>{selectedMail?.message || "No content available."}</p>

          {selectedMail?.attachments?.length > 0 && (
            <>
              <hr />
              <h6>Attachments:</h6>
              <ul>
                {selectedMail.attachments.map((att, i) => (
                  <li key={i}>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/mail/download/${att}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-decoration-none d-flex align-item-center"
                    >
                      <FaPaperclip className="me-1 mt-1 text-primary" />
                      {att}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            className="d-flex align-item-center"
            onClick={() => {
              handleRestore(selectedMail._id);
              setSelectedMail(null);
            }}
          >
            <FaTrashRestore className="me-1" />
            Restore
          </Button>
          <Button
            variant="danger"
            className="d-flex align-item-center"
            onClick={() => {
              handleDeleteForever(selectedMail._id);
              setSelectedMail(null);
            }}
          >
            <FaTrashAlt className="me-1" />
            Delete Forever
          </Button>
          <Button variant="secondary" onClick={() => setSelectedMail(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Trash;
