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
  return (
    <footer className="footer-section bg-dark text-white pt-5">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-md-3 mb-4">
            <h5 className="fw-bold text-uppercase mb-3">Hareetech Development Pvt. Ltd.</h5>
            <p className="footer-text">
              As Hareetech Development, we pride ourselves on being one of the top development companies in the industry. Our team of expert developers and engineers are dedicated to delivering innovative solutions.
            </p>
          </div>

          {/* Products */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-semibold text-uppercase mb-3">Products</h6>
            <ul className="list-unstyled">
              <li><a className="footer-link" href="#">Dashboard</a></li>
              <li><a className="footer-link" href="#">Employees</a></li>
              <li><a className="footer-link" href="#">Payrolls</a></li>
              <li><a className="footer-link" href="#">Attendance</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-semibold text-uppercase mb-3">Contact</h6>
            <p><i className="fas fa-home"></i>203-2nd floor OM Plaza Apartment Indire Nagar Lucknow Uttar Pradesh 226016</p>
            <p><i className="fas fa-envelope"></i> info@hareetech.com
</p>
            <p><i className="fas fa-phone"></i> +91 6394181905
</p>
          </div>

          {/* Social Media */}
          <div className="col-md-3 mb-4 text-center">
            <h6 className="fw-semibold text-uppercase mb-3">Follow Us</h6>
            <div className="d-flex justify-content-center flex-wrap">
              <a href="#" className="social-icon" style={{ backgroundColor: "#3b5998" }} title="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon" style={{ backgroundColor: "#55acee" }} title="Twitter">
                <AiFillTwitterCircle />
              </a>
              <a href="#" className="social-icon" style={{ backgroundColor: "#dd4b39" }} title="Google">
                <FaGoogle />
              </a>
              <a href="#" className="social-icon" style={{ backgroundColor: "#ac2bac" }} title="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon" style={{ backgroundColor: "#0082ca" }} title="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="#" className="social-icon" style={{ backgroundColor: "#333" }} title="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-3 mt-3 copyright">
        © {new Date().getFullYear()} All rights reserved | Designed by Hareetech Development Pvt. Ltd.
      </div>

      {/* Style */}
      <style>{`
        .footer-section {
          font-size: 14px;
        }

        .footer-text {
          font-size: 15px;
          opacity: 0.8;
        }

        .footer-link {
          color: white;
          text-decoration: none;
          display: block;
          margin-bottom: 6px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 5px;
          font-size: 20px;
          transition: all 0.3s ease-in-out;
        }

        .social-icon:hover {
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
        }

        .copyright {
          background-color: rgba(0, 0, 0, 0.2);
          font-size: 14px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
