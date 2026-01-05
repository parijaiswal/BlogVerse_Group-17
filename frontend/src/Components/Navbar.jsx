import React from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideAuthButtons = location.pathname.startsWith("/Client");
   if (location.pathname.startsWith("/Admin")) {

    return null;
  }


  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="nav-logo">BlogVerse</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <a href="#latest-cards">Blogs</a>
        <Link to="/about">About Us</Link>
        <a href="#publish-cta">For Brands</a>
      </div>

      {!hideAuthButtons && (
        <div className="nav-right">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

