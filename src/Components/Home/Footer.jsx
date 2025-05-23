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
    width: "35px",
    height: "35px",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "5px",
    fontSize: "18px",
    textDecoration: "none",
  };

  return (
    <>
      <div className="mx-0">
        <footer
          className="text-center text-lg-start text-white"
          style={{ backgroundColor: "#929fba" }}
        >
          <div className="container p-4 pb-0">
            <section>
              <div className="row">
                {/* Company Info */}
                <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                  <h6 className="text-uppercase mb-4 font-weight-bold">
                    Company name
                  </h6>
                  <p>
                    Here you can use rows and columns to organize your footer
                    content. Lorem ipsum dolor sit amet, consectetur
                    adipisicing elit.
                  </p>
                </div>

                <hr className="w-100 clearfix d-md-none" />

                {/* Products */}
                <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                  <h6 className="text-uppercase mb-4 font-weight-bold">
                    Products
                  </h6>
                  <p><a className="text-white">MDBootstrap</a></p>
                  <p><a className="text-white">MDWordPress</a></p>
                  <p><a className="text-white">BrandFlow</a></p>
                  <p><a className="text-white">Bootstrap Angular</a></p>
                </div>

                <hr className="w-100 clearfix d-md-none" />

                {/* Contact */}
                <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                  <h6 className="text-uppercase mb-4 font-weight-bold">Contact</h6>
                  <p><i className="fas fa-home mr-3" /> New York, NY 10012, US</p>
                  <p><i className="fas fa-envelope mr-3" /> info@gmail.com</p>
                  <p><i className="fas fa-phone mr-3" /> + 01 234 567 88</p>
                  <p><i className="fas fa-print mr-3" /> + 01 234 567 89</p>
                </div>

                {/* Social Icons */}
                <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3 text-center">
                  <h6 className="text-uppercase mb-4 font-weight-bold">
                    Follow us
                  </h6>

                  {/* Row 1 */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#3b5998" }}>
                      <FaFacebookF />
                    </a>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#55acee" }}>
                      <AiFillTwitterCircle />
                    </a>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#dd4b39" }}>
                      <FaGoogle />
                    </a>
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#ac2bac" }}>
                      <FaInstagram />
                    </a>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#0082ca" }}>
                      <FaLinkedinIn />
                    </a>
                    <a href="#!" style={{ ...iconStyle, backgroundColor: "#333333" }}>
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Copyright */}
          <div
            className="text-center p-3"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          >
            <p>
              Copyright © {new Date().getFullYear()} - All rights reserved by
              ACME Industries Ltd
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Footer;
