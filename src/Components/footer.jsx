// src/components/Footer/Footer.jsx
import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* 1. Brand / About */}
        <div className="footer-column">
          <h3 className="footer-logo">BlogVerse</h3>
          <p>
            BlogVerse is CultureX's blogging platform where brands and writers
            share insights on media intelligence, branding and digital marketing.
          </p>
        </div>

        {/* 2. Quick Links */}
            <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#blogs">Blogs</a></li>
            <li><a href="#categories">Categories</a></li>
            <li><a href="#for-brands">For Brands</a></li>
          </ul>
        </div>

        {/* 3. Contact us*/}

        <div className="footer-column">
            <h4>Contact Us</h4>
            <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Linkedin</a></li>
            <li><a href="#">Gmail</a></li>
            </ul>
        </div>
        
        
       
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} BlogVerse · A CultureX initiative
      </div>
    </footer>
  );
};

export default Footer;
