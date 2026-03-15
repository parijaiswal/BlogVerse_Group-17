import React, { useState, useEffect } from "react";
import "../AdminPage/Admin.css";
import "./Client.css";
import AddBlog from "../AdminPage/AddBlogs";
import EditProfile from "../../Components/EditProfile";
import ViewSub from "./ViewSubscription";
import MyBlogs from "./MyBlogs";
import SavedBlogs from "../../Components/SavedBlogs";
import hello_2 from "../../Images/hello_2.png";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaRegEdit, FaPlus, FaMoneyCheckAlt } from "react-icons/fa";
import API_BASE from "../../config";

const ClientDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editBlog, setEditBlog] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    drafts: 0,
  });

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/admin/client-blog-stats/${userId}`)
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
    setEditBlog(null);
    setActivePage("myBlogs");
  };

  const handleEdit = (blog) => {
    setEditBlog(blog);
    setActivePage("editBlog");
  };

  const renderContent = () => {
    switch (activePage) {
      case "addBlog":
        return <AddBlog isClient={true} />;

      case "editBlog":
        return (
          <AddBlog
            editBlog={editBlog}
            isClient={true}
            editEndpoint={`${API_BASE}/api/admin/client-edit-blog/${editBlog?.BlogId}`}
            onSuccess={() => {
              setEditBlog(null);
              setFilterStatus("all");
              setActivePage("myBlogs");
            }}
          />
        );

      case "myBlogs":
        return <MyBlogs filterStatus={filterStatus} onEdit={handleEdit} />;

      case "editProfile":
        return <EditProfile />;

      case "ViewSub":
        return <ViewSub />;

      case "savedBlogs":
       return <SavedBlogs />;

      default:
        return (
          <>
            <div className="admin-card" style={{ marginBottom: "25px", width: "100%", position: "relative", overflow: "hidden" }}>
              <h1 style={{ fontSize: "32px", color: "#1e293b", marginBottom: "12px", fontFamily: "'Poppins', sans-serif" }}>
                Welcome, {localStorage.getItem("username")} 
                <img
                  src={hello_2}
                  alt="welcome"
                  style={{ width: "38px", height: "38px", paddingLeft: "10px", verticalAlign: "bottom" }}
                />
              </h1>
              <p style={{ fontSize: "16px", color: "#64748b", margin: "0" }}>Here's a quick overview of your blogs.</p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div 
                className="stat-box" 
                onClick={() => handleCardClick("all")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.total}</h3>
                <p><FaFileAlt style={{ color: "#3b82f6" }} /> Total Blogs</p>
              </div>

              <div 
                className="stat-box approved"
                onClick={() => handleCardClick("approved")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.approved}</h3>
                <p><FaCheckCircle style={{ color: "#2ecc71" }} /> Approved</p>
              </div>

              <div 
                className="stat-box pending"
                onClick={() => handleCardClick("pending")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.pending}</h3>
                <p><FaHourglassHalf style={{ color: "#f39c12" }} /> Pending</p>
              </div>

              <div 
                className="stat-box rejected"
                onClick={() => handleCardClick("rejected")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.rejected}</h3>
                <p><FaTimesCircle style={{ color: "#e74c3c" }} /> Rejected</p>
              </div>

              <div 
                className="stat-box draft"
                onClick={() => handleCardClick("draft")}
                style={{ cursor: "pointer" }}
              >
                <h3>{stats.drafts || 0}</h3>
                <p><FaRegEdit style={{ color: "#8e44ad" }} /> Drafts</p>
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
            className="topbar-profile-btn"
            onClick={() => setActivePage("editProfile")}
          >
            Profile
          </button>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
          >
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
              <FaPlus style={{ marginRight: "10px" }} /> Add Blog
            </li>
            <li 
              className={activePage === "myBlogs" && filterStatus === "all" ? "active" : ""}
              onClick={() => {
                setFilterStatus("all");
                setActivePage("myBlogs");
              }}
            >
              <FaFileAlt style={{ marginRight: "10px" }} /> My Blogs
            </li>
            <li 
              className={activePage === "myBlogs" && filterStatus === "draft" ? "active" : ""}
              onClick={() => {
                setFilterStatus("draft");
                setActivePage("myBlogs");
              }}
            >
              <FaRegEdit style={{ marginRight: "10px" }} /> View Drafts
            </li>
            <li 
              className={activePage === "ViewSub" ? "active" : ""}
              onClick={() => setActivePage("ViewSub")}
            >
              <FaMoneyCheckAlt style={{ marginRight: "10px" }} /> View Subscription
            </li>
            <li
              className={activePage === "savedBlogs" ? "active" : ""}
              onClick={() => setActivePage("savedBlogs")}>
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
export default ClientDashboard;