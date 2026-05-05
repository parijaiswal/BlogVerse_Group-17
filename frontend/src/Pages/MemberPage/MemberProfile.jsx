import React from "react";
import { useNavigate } from "react-router-dom";
import EditProfile from "../../Components/EditProfile";
import "./Member.css";

const MemberProfile = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Member";

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="member-profile-page">
      <div className="member-profile-header">
        <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          BlogVerse
        </h2>
        <div className="member-profile-actions">
          <button onClick={() => navigate("/")}>Back to Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="member-profile-content">
        <h2>My Profile</h2>
        <EditProfile />
      </div>
    </div>
  );
};

export default MemberProfile;
