import React from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
function Navbar() {
  const navigate = useNavigate();
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

      <div className="nav-right">
        <button className="btn-outline" onClick={() => navigate("/login")}>
          Login
        </button>

        <button className="btn-primary" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>

    </nav>
  );
}

export default Navbar;
