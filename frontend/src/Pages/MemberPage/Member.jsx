import React, { useState, useEffect } from "react";
import "../AdminPage/Admin.css";
import "./Member.css";
import EditProfile from "../../Components/EditProfile";
import SavedBlogs from "../../Components/SavedBlogs";
import { useNavigate } from "react-router-dom";
import hello_2 from "../../Images/hello_2.png";
import { FaUser, FaBookmark, FaCompass, FaRegBookmark } from "react-icons/fa";
import axios from "axios";
import API_BASE from "../../config";

const MemberDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [savedCount, setSavedCount] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`)) || [];
      setSavedCount(bookmarks.length);
    }

    // Fetch latest blogs for dashboard preview
    axios.get(`${API_BASE}/api/blogs?sort=latest`)
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => console.error("API error:", err));
  }, [activePage]);

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
          <>
            <div className="admin-card" style={{ marginBottom: "35px", width: "100%", position: "relative", overflow: "hidden" }}>
              <h1 style={{ fontSize: "32px", color: "#1e293b", marginBottom: "12px", fontFamily: "'Poppins', sans-serif" }}>
                Welcome, {localStorage.getItem("username") || "Member"}
                <img
                  src={hello_2}
                  alt="welcome"
                  style={{ width: "38px", height: "38px", paddingLeft: "10px", verticalAlign: "bottom" }}
                />
              </h1>
              <p style={{ fontSize: "16px", color: "#64748b", margin: "0" }}>Discover new ideas, learn, and grow with our latest community blogs.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
               <h3 style={{ color: "#1e293b", margin: 0, fontSize: "24px" }}>Latest Blogs</h3>
            </div>
            
            <div className="latest-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px", marginBottom: "35px" }}>
              {blogs.slice(0, 6).map((blog) => (
                <div
                  key={blog.BlogId}
                  onClick={() => navigate(`/blog/${blog.BlogId}`)}
                  style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", cursor: "pointer", transition: "transform 0.2s", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0" }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)"; }}
                >
                  <div style={{ width: "100%", height: "160px", overflow: "hidden", background: "#f1f5f9" }}>
                    <img
                      src={blog.Image_path ? `${API_BASE}${blog.Image_path}` : require("../../Images/blog1.webp")}
                      alt={blog.Title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "16px", flex: "1", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.Title}</h4>
                    </div>
                    <span style={{ fontSize: "11px", backgroundColor: "#e0e7ff", color: "#4f46e5", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold", width: "fit-content", marginBottom: "10px" }}>
                      {blog.Category || "General"}
                    </span>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: "1" }}>
                        {blog.Content}
                    </p>
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                      <span>{blog.Username ? `By ${blog.Username === "Admin user" ? "Admin" : blog.Username}` : ""}</span>
                      <span>{new Date(blog.Create_Date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
               <button 
                 onClick={() => navigate("/")}
                 style={{ padding: "14px 28px", background: "#2563eb", border: "none", borderRadius: "8px", cursor: "pointer", color: "white", fontWeight: "600", fontSize: "16px", transition: "background 0.2s", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 6px -1px rgb(37 99 235 / 0.4)" }}
                 onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; }}
               >
                 Explore More Blogs <FaCompass />
               </button>
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
              <FaUser style={{ marginRight: "10px" }} /> Manage Profile
            </li>
            <li
              className={activePage === "savedBlogs" ? "active" : ""}
              onClick={() => setActivePage("savedBlogs")}
            >
              <FaBookmark style={{ marginRight: "10px" }} /> Saved Blogs
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