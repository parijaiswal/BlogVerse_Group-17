import React, { useState } from "react";
import "../AdminPage/Admin.css"; //here we are using admin css for client page also
import AddBlog from "../AdminPage/AddBlogs";
import EditProfile from "../../Components/EditProfile";
import ViewSub from "./ViewSubscription";

const ClientDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activePage) {
      case "addBlog":
        return <AddBlog />;

      case "myBlogs":
        return (
          <div className="admin-card">
            <h1>Welcome Client</h1>
  <p>Manage your blogs and profile.</p>

  <ul style={{ marginTop: "15px", lineHeight: "1.8" }}>
    <li>Add new blogs for admin approval</li>
    <li>Track blog status (Pending / Approved / Rejected)</li>
    <li>Edit your profile information</li>
  </ul>
          </div>
        );

      case "editProfile":
        return <EditProfile />;

      case "ViewSub":
        return <ViewSub />;

      default:
        return (
          <div className="admin-card">
            <h1>Welcome Client</h1>
            <p>Manage your blogs and profile.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-wrapper">
      {/* ===== TOP BAR ===== */}
      <div className="admin-topbar">
        <h2 className="admin-logo">BlogVerse</h2>
        <div className="topbar-actions">
          <button
            className="logout-btn"
            onClick={() => setActivePage("editProfile")}
          >
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* ===== SIDEBAR ===== */}
        <div className="admin-sidebar">
          <h2>Client Panel</h2>
          <ul>
            <li onClick={() => setActivePage("addBlog")}>Add Blog</li>
            <li onClick={() => setActivePage("myBlogs")}>My Blogs</li>
            <li onClick={() => setActivePage("ViewSub")}>View Subscription</li>
          </ul>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="admin-main">{renderContent()}</div>
      </div>
    </div>
  );
};
export default ClientDashboard;
