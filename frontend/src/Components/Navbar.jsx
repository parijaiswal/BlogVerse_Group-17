import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 className="nav-logo">BlogVerse</h2>
      </div>

      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Blogs</a>
        <a href="#">Categories</a>
        <a href="#">For Brands</a>
      </div>

      <div className="nav-right">
        <button className="btn-outline" >Login</button>
        <button className="btn-primary">Register</button>
      </div>

    </nav>
  );
}

export default Navbar;
