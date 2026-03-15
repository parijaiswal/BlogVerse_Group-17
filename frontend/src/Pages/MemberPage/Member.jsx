import React, { useState } from "react";
import "../AdminPage/Admin.css";
import "./Member.css";
import EditProfile from "../../Components/EditProfile";
import SavedBlogs from "../../Components/SavedBlogs";
import { useNavigate } from "react-router-dom";
import hello_2 from "../../Images/hello_2.png";

const MemberDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderContent = () => {
    switch (activePage) {
      case "manageProfile":
        return <EditProfile />;
      case "savedBlogs":
         return <SavedBlogs />;

      default:
        return (
          <div className="admin-card" style={{ marginBottom: "25px", width: "100%" }}>
            <h1>Welcome {localStorage.getItem("username") || "Member"}
              <img
                src={hello_2}
                alt="welcome"
                style={{ width: "45px", height: "45px", paddingLeft: "8px" }}
              />
            </h1>
            <p>Welcome to your Member dashboard. Manage your profile settings from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-wrapper">
      {/* TOP BAR */}
      <div className="admin-topbar">
        <h2 className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>BlogVerse</h2>
        <div className="topbar-actions">
          <button
            className="topbar-profile-btn"
            onClick={() => setActivePage("manageProfile")}
          >
            Profile
          </button>
          <button className="topbar-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* SIDEBAR */}
        <div className="admin-sidebar">
          <h2 
            onClick={() => setActivePage("dashboard")} 
            style={{ cursor: "pointer" }}
          >
            Member Panel
          </h2>
          <ul>
            <li 
              className={activePage === "manageProfile" ? "active" : ""}
              onClick={() => setActivePage("manageProfile")}
            >
              Manage Profile
            </li>
            <li
              className={activePage === "savedBlogs" ? "active" : ""}
              onClick={() => setActivePage("savedBlogs")}
            >
              Saved Blogs
            </li> 
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="admin-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
export default MemberDashboard;