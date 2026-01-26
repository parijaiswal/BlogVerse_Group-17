import React, { useState, useEffect } from "react";
import "../AdminPage/Admin.css";
import "./Client.css";
import AddBlog from "../AdminPage/AddBlogs";
import EditProfile from "../../Components/EditProfile";
import ViewSub from "./ViewSubscription";
import MyBlogs from "./MyBlogs";
import hello_2 from "../../Images/hello_2.png";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

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
      .then((res) => {
        if(res.ok) return res.json();
        throw new Error('Stats fetch failed');
      })
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCardClick = (status) => {
    setFilterStatus(status);
    setActivePage("myBlogs");
  };

  const renderContent = () => {
    switch (activePage) {
      case "addBlog":
        return <AddBlog isClient={true} />;

      case "myBlogs":
        return <MyBlogs filterStatus={filterStatus} />;

      case "editProfile":
        return <EditProfile />;

      case "ViewSub":
        return <ViewSub />;

      default:
        return (
          <>
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

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div 
                className="stat-box" 
                onClick={() => handleCardClick("all")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.total}</h3>
                <p>Total Blogs</p>
              </div>

              <div 
                className="stat-box approved"
                onClick={() => handleCardClick("approved")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.approved}</h3>
                <p>Approved</p>
              </div>

              <div 
                className="stat-box pending"
                onClick={() => handleCardClick("pending")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>

              <div 
                className="stat-box rejected"
                onClick={() => handleCardClick("rejected")}
                style={{ cursor: "pointer" }}
              >
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
        <h2 className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>BlogVerse</h2>
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
          <h2 
            onClick={() => setActivePage("dashboard")} 
            style={{ cursor: "pointer" }}
          >
            Client Panel
          </h2>
          <ul>
            <li 
              className={activePage === "addBlog" ? "active" : ""}
              onClick={() => setActivePage("addBlog")}
            >
              Add Blog
            </li>
            <li 
              className={activePage === "myBlogs" ? "active" : ""}
              onClick={() => {
                setFilterStatus("all");
                setActivePage("myBlogs");
              }}
            >
              My Blogs
            </li>
            <li 
              className={activePage === "ViewSub" ? "active" : ""}
              onClick={() => setActivePage("ViewSub")}
            >
              View Subscription
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
export default ClientDashboard;