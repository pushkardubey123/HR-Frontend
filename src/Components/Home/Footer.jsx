import React from "react";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa";
import { AiFillTwitterCircle } from "react-icons/ai";

const Footer = () => {
  const iconStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    margin: "5px",
    fontSize: "20px",
    transition: "all 0.3s ease-in-out",
  };

  const hoverStyle = {
    boxShadow: "0 0 12px rgba(255, 255, 255, 0.6)",
    transform: "scale(1.1)",
  };

  return (
    <footer
      className="text-white pt-5 bg-dark"
    >
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Company Info */}
          <div className="col-md-3 mb-4">
            <h5 className="fw-bold text-uppercase mb-3">ACME Industries</h5>
            <p style={{ fontSize: "15px", opacity: 0.8 }}>
              Building smart digital solutions with creativity and innovation. We
              bring your ideas to life.
            </p>
          </div>

          {/* Products */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-semibold text-uppercase mb-3">Products</h6>
            <ul className="list-unstyled">
              <li><a className="text-white text-decoration-none" href="#">Dashboard</a></li>
              <li><a className="text-white text-decoration-none" href="#">Analytics</a></li>
              <li><a className="text-white text-decoration-none" href="#">HR Tools</a></li>
              <li><a className="text-white text-decoration-none" href="#">Attendance</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-semibold text-uppercase mb-3">Contact</h6>
            <p><i className="fas fa-home me-2"></i> 123 Main St, NY 10012, USA</p>
            <p><i className="fas fa-envelope me-2"></i> info@acme.com</p>
            <p><i className="fas fa-phone me-2"></i> +1 234 567 890</p>
          </div>

          {/* Social Media */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-semibold text-uppercase mb-3 text-center">Follow Us</h6>
            <div className="d-flex justify-content-center flex-wrap">
              <a href="#" style={{ ...iconStyle, backgroundColor: "#3b5998" }} className="social-icon" title="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" style={{ ...iconStyle, backgroundColor: "#55acee" }} className="social-icon" title="Twitter">
                <AiFillTwitterCircle />
              </a>
              <a href="#" style={{ ...iconStyle, backgroundColor: "#dd4b39" }} className="social-icon" title="Google">
                <FaGoogle />
              </a>
              <a href="#" style={{ ...iconStyle, backgroundColor: "#ac2bac" }} className="social-icon" title="Instagram">
                <FaInstagram />
              </a>
              <a href="#" style={{ ...iconStyle, backgroundColor: "#0082ca" }} className="social-icon" title="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="#" style={{ ...iconStyle, backgroundColor: "#333" }} className="social-icon" title="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        className="text-center py-3 mt-3"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", fontSize: "14px" }}
      >
        © {new Date().getFullYear()} All rights reserved | Designed by ACME Industries
      </div>

      {/* Inline hover effect */}
      <style>{`
        .social-icon:hover {
          box-shadow: ${hoverStyle.boxShadow};
          transform: ${hoverStyle.transform};
        }
      `}</style>
    </footer>
  );
};

export default Footer;
