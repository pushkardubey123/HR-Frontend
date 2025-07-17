import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Admin/Loader/Loader";
import { Modal } from "react-bootstrap";
import { FaPaperclip } from "react-icons/fa";
import { BsFileEarmarkPdfFill, BsFileEarmarkImage } from "react-icons/bs";

const SentMails = () => {
  const [sentMails, setSentMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const email = user?.email;

  const fetchSentMails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mail/my-mails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.data;
      const onlySent = all.filter((mail) => mail.sender?.email === email);
      setSentMails(onlySent);
    } catch (err) {
      console.error("Sent mails fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentMails();
  }, []);

  const openModal = (mail) => setPreview(mail);
  const closeModal = () => setPreview(null);

  return (
    <div className="mt-3">
      <h5 className="text-primary">📤 Sent Mails</h5>

      {loading ? (
        <Loader />
      ) : sentMails.length === 0 ? (
        <p className="text-muted mt-4">No sent mails found</p>
      ) : (
        <div className="list-group mt-3">
          {sentMails.map((mail) => (
            <div
              key={mail._id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
              style={{ cursor: "pointer", borderLeft: "4px solid #0d6efd" }}
              onClick={() => openModal(mail)}
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">
                  To: {mail.recipients?.join(", ")}
                </div>
                <div className="text-dark fw-semibold">{mail.subject}</div>
                <div className="text-muted small">
                  {mail.message?.slice(0, 80)}...
                </div>

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

      {/* Preview Modal */}
      <Modal show={!!preview} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{preview?.subject}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>To:</strong> {preview?.recipients?.join(", ")}
          </p>
          <p>
            <strong>Message:</strong>
            <br />
            {preview?.message}
          </p>

          {preview?.attachments?.length > 0 && (
            <>
              <h6>Attachments:</h6>
              <ul>
                {preview.attachments.map((att, i) => (
                  <li key={i}>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/mail/download/${att}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-decoration-none d-flex align-item-center"
                    >
                      <FaPaperclip className="me-2 mt-1 text-primary" />
                      {att}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SentMails;
