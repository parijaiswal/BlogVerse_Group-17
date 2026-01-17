import React, { useState,useEffect } from "react";
import "./Admin.css";
import ViewSub from "./ViewSub";
import AddBlog from "./AddBlogs";
import ViewUsers from "./Viewusers";
import AddSubscription from "./AddSub";
import ViewBlogs from "./ViewBlogs";
import { useNavigate } from "react-router-dom";
import EditProfile from "../../Components/EditProfile";
import AllBlogs from "./Allblogs";
import hello_2 from "../../Images/hello_2.png";
import EditMyBlogs from "./EditMyblogs";
const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [editBlog, setEditBlog] = useState(null);
  const [editSub, setEditSub] = useState(null);
  

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  /* ============================
     FETCH ADMIN BLOG STATS
  ============================ */
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/admin-blog-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  // When Edit is clicked from ViewBlogs
  const handleEditBlog = (blog) => {
  setEditBlog(blog);
  setActivePage("addBlog");
};

  // After Add / Update success
  const resetBlogForm = () => {
    setEditBlog(null);
    setActivePage("viewBlogs");
  };
  

const handleEditSub = (sub) => {
  setEditSub(sub);
  setActivePage("addSubscription");
};

const resetSubForm = () => {
  setEditSub(null);
  setActivePage("viewSubscriptions");
};


  const renderContent = () => {
    switch (activePage) {
      case "addBlog":
        return (
          <AddBlog
            editBlog={editBlog}
            onSuccess={resetBlogForm}
          />
        );

      case "viewBlogs":
        return <AllBlogs onEdit={handleEditBlog} />;
      case "blogApproval":
       return <ViewBlogs />;

      case "viewUsers":
        return <ViewUsers  />;

      case "addSubscription":
        return <AddSubscription editSub={editSub} onSuccess={resetSubForm} />;

      case "viewSubscriptions":
        return <ViewSub onEdit={handleEditSub} />;

      case "editProfile":
        return <EditProfile />;
      case "myBlogs":
      return <EditMyBlogs onEdit={handleEditBlog} />;
      default:
        return (
          <>
            <div className="admin-card" style={{ marginBottom: "25px", width: "100%"}}>
            <h1>Welcome Back, Admin 
              <img src={hello_2} alt="welcome" style={{ width: "45px", height: "45px", paddingLeft: "8px" }} />
            </h1>
            <p>Use the sidebar to manage blogs, users and subscriptions.</p>
            <p>Below shows the information about the blogs.</p>
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
      {/* Top Bar */}
      <div className="admin-topbar">
        <h2 className="admin-logo">BlogVerse</h2>
        <div className="topbar-actions">
    <button
      className="logout-btn"
      onClick={() => setActivePage("editProfile")}> Profile
    </button>
    <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
    </div>
        

      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <h2>Admin Panel</h2>

          <ul>
          <li
            onClick={() => {
              setEditBlog(null);
              setActivePage("addBlog");
            }}
          >
            Add Blog
          </li>
          <li onClick={() => setActivePage("blogApproval")}>
            Blog Approvals
          </li>
          <li onClick={() => setActivePage("viewBlogs")}>
            All Blogs
          </li>
          <li onClick={() => setActivePage("myBlogs")}>My Blogs</li>
          <li onClick={() => setActivePage("viewUsers")}>
            View Users
          </li>
          <li onClick={() => setActivePage("addSubscription")}>
            Add Subscription
          </li>
          <li onClick={() => setActivePage("viewSubscriptions")}>
            View Subscriptions
          </li>
        </ul>

        </div>

        {/* Main Content */}
        <div className="admin-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
