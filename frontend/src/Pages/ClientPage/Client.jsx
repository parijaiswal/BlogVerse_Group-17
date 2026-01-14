import React, { useState, useEffect } from "react";
import "../AdminPage/Admin.css";
import AddBlog from "../AdminPage/AddBlogs";
import EditProfile from "../../Components/EditProfile";
import ViewSub from "./ViewSubscription";
import MyBlogs from "./MyBlogs";
import hello_2 from "../../Images/hello_2.png";

const ClientDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const userId = localStorage.getItem("userId");

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/admin/client-blog-stats/${userId}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // 🔹 THIS decides WHAT appears in the center area
  const renderContent = () => {
    switch (activePage) {
      case "addBlog":
        return <AddBlog isClient={true} />;

      case "myBlogs":
        return <MyBlogs />;

      case "editProfile":
        return <EditProfile />;

      case "ViewSub":
        return <ViewSub />;

      // DASHBOARD (DEFAULT)
      default:
        return (
          <>
            {/* Welcome Card */}
            <div className="admin-card" style={{ marginBottom: "25px", width: "100%"}}>
              <h1>Welcome {localStorage.getItem("username")} 
                <img
                  src={hello_2}
                  alt="welcome"
                  style={{ width: "45px", height: "45px", paddingLeft: "8px" }}
                />
              </h1>
              <p>Here's a quick overview of your blogs.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div className="stat-box">
                <h3>{stats.total}</h3>
                <p>Total Blogs</p>
              </div>

              <div className="stat-box approved">
                <h3>{stats.approved}</h3>
                <p>Approved</p>
              </div>

              <div className="stat-box pending">
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>

              <div className="stat-box rejected">
                <h3>{stats.rejected}</h3>
                <p>Rejected</p>
              </div>
            </div>
          </>
        );
    }
  };
  return (
    <div className="admin-wrapper">
      {/* TOP BAR */}
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
        {/* SIDEBAR */}
        <div className="admin-sidebar">
          <h2>Client Panel</h2>
          <ul>
            <li onClick={() => setActivePage("addBlog")}>Add Blog</li>
            <li onClick={() => setActivePage("myBlogs")}>My Blogs</li>
            <li onClick={() => setActivePage("ViewSub")}>
              View Subscription
            </li>
          </ul>
        </div>
        {/* MAIN CONTENT */}
        <div className="admin-main">{renderContent()}</div>
      </div>
    </div>
  );
};
export default ClientDashboard;