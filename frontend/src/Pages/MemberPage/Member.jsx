import React, { useState } from "react";
import "../AdminPage/Admin.css";
import "./Member.css";
import EditProfile from "../../Components/EditProfile";
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
            className="logout-btn"
            onClick={() => setActivePage("manageProfile")}
          >
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
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
          </ul>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button 
              onClick={() => navigate("/")} 
              style={{ 
                background: "rgba(255,255,255,0.1)", 
                border: "1px solid rgba(255,255,255,0.2)", 
                color: "white", 
                width: "100%", 
                padding: "12px", 
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: "500",
                transition: "0.2s"
              }}
            >
              &larr; Return to Website
            </button>
          </div>
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