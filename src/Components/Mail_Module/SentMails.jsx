import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Admin/Loader/Loader";
import Swal from "sweetalert2";

const SentMails = () => {
  const [sentMails, setSentMails] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const email = user?.email;

  const fetchSentMails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mail/my-mails`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allMails = res.data.data;
      const onlySent = allMails.filter(mail => mail.sender?.email === email);
      setSentMails(onlySent);
    } catch (err) {
      console.error("Sent mails fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
const moveToTrash = async (id) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/mail/trash/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    Swal.fire("Moved", "Mail moved to trash", "success");
    fetchSentMails();
  } catch (err) {
    Swal.fire("Error", "Failed to move to trash", "error");
  }
};

  useEffect(() => {
    fetchSentMails();
  }, []);

  return (
    <div>
      <h5 className="text-primary mb-3">📤 Sent Mails</h5>

      {loading ? (
        <Loader />
      ) : sentMails.length === 0 ? (
        <p className="text-muted">No sent mails found.</p>
      ) : (
        <div className="table-responsive mt-2">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>To</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Attachments</th>
                <th>Sent At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sentMails.map((mail, i) => (
                <tr key={mail._id}>
                  <td>{i + 1}</td>
                  <td>{mail.recipients.join(", ")}</td>
                  <td className="fw-semibold text-success">{mail.subject}</td>
                  <td>{mail.message.slice(0, 80)}...</td>
                  <td>
                    {mail.attachments.length > 0 ? (
                      mail.attachments.map((att, j) => (
                        <div key={j}>
                          <a
                            href={`${import.meta.env.VITE_API_URL}/mail/download/${att}`}
                            className="btn btn-sm btn-outline-secondary my-1"
                            download
                          >
                            {att}
                          </a>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>{new Date(mail.createdAt).toLocaleString()}</td>
                  <td>
  <button
    className="btn btn-sm btn-outline-danger"
    onClick={() => moveToTrash(mail._id)}
  >
    🗑️ Trash
  </button>
</td>y
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SentMails;
