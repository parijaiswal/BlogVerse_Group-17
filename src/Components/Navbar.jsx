import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 className="nav-logo">BlogVerse</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/brands">For Brands</Link>
      </div>

      <div className="nav-right">
        <button className="btn-outline" >Login</button>
        <Link to="/register">
        <button className="btn-primary">Register</button>
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;
