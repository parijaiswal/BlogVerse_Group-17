import React from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { FaUserCircle } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideAuthButtons = location.pathname.startsWith("/Client");
  
  // Check for login status
  const role = localStorage.getItem("role");
  const validRoles = ["admin", "client", "member"];
  const isLoggedIn = role && validRoles.includes(role.toLowerCase());

   if (location.pathname.startsWith("/Admin")) {

    return null;
  }
  
  const handleProfileClick = () => {
    if (role) {
      navigate(`/${role.toLowerCase()}`);
    }
  };

  // Show subscription link for client and admin only (not for member)
  const showSubscriptionLink = isLoggedIn && role && (role.toLowerCase() === "client" || role.toLowerCase() === "admin");

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="nav-logo">BlogVerse</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <a href="/#latest-cards">Blogs</a>
        <a href="/#publish-cta">Start Writing</a>
        <Link to="/contact">Contact</Link>
        <Link to="/about">About Us</Link>
        {showSubscriptionLink && (
          <Link to="/subscription">Subscription</Link>
        )}
      </div>

      {!hideAuthButtons && (
        <div className="nav-right">
          {isLoggedIn ? (
             <div 
               className="profile-icon" 
               onClick={handleProfileClick} 
               style={{ cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: "5px" }}
               title="Go to Dashboard"
             >
               <FaUserCircle size={32} />
             </div>
          ) : (
            <>
              <button className="btn-primary" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="btn-primary" onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

