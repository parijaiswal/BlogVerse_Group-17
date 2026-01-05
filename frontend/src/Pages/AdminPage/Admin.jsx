import React, { useState } from "react";
import "./Admin.css";
import ViewSub from "./ViewSub";
import AddBlog from "./AddBlogs";
import ViewUsers from "./Viewusers";
import AddSubscription from "./AddSub";
import ViewBlogs from "./ViewBlogs";
import { useNavigate } from "react-router-dom";
import EditProfile from "../../Components/EditProfile";
const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [editBlog, setEditBlog] = useState(null);
  const [editSub, setEditSub] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
        return <ViewBlogs onEdit={handleEditBlog} />;

      case "viewUsers":
        return <ViewUsers  />;

      case "addSubscription":
        return <AddSubscription editSub={editSub} onSuccess={resetSubForm} />;

      case "viewSubscriptions":
        return <ViewSub onEdit={handleEditSub} />;

      case "editProfile":
        return <EditProfile />;
      default:
        return (
          <>
            <h1>Welcome Back, Admin</h1>
            <p>Use the sidebar to manage blogs, users and subscriptions.</p>
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

            <li onClick={() => setActivePage("viewBlogs")}>
              View Blogs
            </li>

            <li onClick={() => setActivePage("viewUsers")}>
              View Users
            </li>

            <li onClick={() => setActivePage("addSubscription")}>
              Add Subscription
            </li>
            <li onClick={() => setActivePage("viewSubscriptions")} >
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
