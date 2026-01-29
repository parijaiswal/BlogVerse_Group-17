// src/components/Footer/Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* 1. Brand / About */}
        <div className="footer-column">
          <h3 className="footer-logo">BlogVerse</h3>
          <p>
            A simple blogging platform for sharing insights and stories.
          </p>
        </div>

        {/* 2. Quick Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        {/* 3. Contact us*/}
        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul>
            <li><a href="mailto:blogverse@email.com">Email Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} BlogVerse
      </div>
    </footer>
  );
};

export default Footer;
