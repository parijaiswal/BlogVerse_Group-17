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
import ViewRejected from "./ViewRejected";
import AdminReport from "./AdminReport";
import { 
  FaChevronDown, FaChevronUp, FaFileAlt, FaCheckCircle, 
  FaHourglassHalf, FaTimesCircle, FaRegEdit,
  FaPlus, FaUsers, FaMoneyCheckAlt, FaPlusSquare, FaListUl, FaChartBar
} from "react-icons/fa";
import API_BASE from "../../config";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [editBlog, setEditBlog] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  

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
    drafts: 0,
  });
  /* ============================
     FETCH ADMIN BLOG STATS
  ============================ */
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/admin-blog-stats`)
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
      
      case "viewRejected":
        return <ViewRejected />;

      case "viewUsers":
        return <ViewUsers  />;

      case "addSubscription":
        return <AddSubscription editSub={editSub} onSuccess={resetSubForm} />;

      case "viewSubscriptions":
        return <ViewSub onEdit={handleEditSub} />;

      case "editProfile":
        return <EditProfile />;
      case "myBlogs":
      return <EditMyBlogs onEdit={handleEditBlog} filterStatus="all" />;
      case "viewDrafts":
      return <EditMyBlogs onEdit={handleEditBlog} filterStatus="draft" />;
      case "viewReports":
        return <AdminReport />;
      default:
        return (
          <>
            <div className="admin-card" style={{ marginBottom: "25px", width: "100%", position: "relative", overflow: "hidden" }}>
            <h1 style={{ fontSize: "32px", color: "#1e293b", marginBottom: "12px", fontFamily: "'Poppins', sans-serif" }}>
              Welcome Back, Admin 
              <img src={hello_2} alt="welcome" style={{ width: "38px", height: "38px", paddingLeft: "10px", verticalAlign: "bottom" }} />
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", margin: "0" }}>Use the sidebar to manage blogs, users and subscriptions.</p>
            </div>
             {/* Stats Cards */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div className="stat-box" onClick={() => setActivePage("viewBlogs")} style={{ cursor: "pointer" }}>
                <h3>{stats.total}</h3>
                <p><FaFileAlt style={{ color: "#3b82f6" }} /> Total Blogs</p>
              </div>

              <div className="stat-box approved" onClick={() => setActivePage("viewBlogs")} style={{ cursor: "pointer" }}>
                <h3>{stats.approved}</h3>
                <p><FaCheckCircle style={{ color: "#2ecc71" }} /> Approved</p>
              </div>

              <div className="stat-box pending" onClick={() => setActivePage("blogApproval")} style={{ cursor: "pointer" }}>
                <h3>{stats.pending}</h3>
                <p><FaHourglassHalf style={{ color: "#f39c12" }} /> Pending</p>
              </div>

              <div className="stat-box rejected" onClick={() => setActivePage("viewRejected")} style={{ cursor: "pointer" }}>
                <h3>{stats.rejected}</h3>
                <p><FaTimesCircle style={{ color: "#e74c3c" }} /> Rejected</p>
              </div>

              <div className="stat-box draft" onClick={() => setActivePage("viewDrafts")} style={{ cursor: "pointer" }}>
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
      {/* Top Bar */}
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
            className="topbar-logout-btn" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        

      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <h2 onClick={() => setActivePage("dashboard")} 
            style={{ cursor: "pointer" }}>Admin Panel</h2>
          


          <ul>
          <li
            className={activePage === "addBlog" ? "active" : ""}
            onClick={() => {
              setEditBlog(null);
              setActivePage("addBlog");
            }}
          >
            <FaPlus style={{ marginRight: "10px" }} /> Add Blog
          </li>
          <li 
            className={activePage === "blogApproval" ? "active" : ""}
            onClick={() => setActivePage("blogApproval")}
          >
            <FaCheckCircle style={{ marginRight: "10px" }} /> Blog Approvals
          </li>
          <li 
            className={activePage === "viewBlogs" ? "active" : ""}
            onClick={() => setActivePage("viewBlogs")}
          >
            <FaFileAlt style={{ marginRight: "10px" }} /> All Blogs
          </li>
          <li 
            className={activePage === "myBlogs" ? "active" : ""}
            onClick={() => setActivePage("myBlogs")}
          >
            <FaRegEdit style={{ marginRight: "10px" }} /> My Blogs
          </li>
          <li 
            className={activePage === "viewUsers" ? "active" : ""}
            onClick={() => setActivePage("viewUsers")}
          >
            <FaUsers style={{ marginRight: "10px" }} /> View Users
          </li>
          <li 
            className={activePage === "viewDrafts" ? "active" : ""}
            onClick={() => setActivePage("viewDrafts")}
          >
            <FaRegEdit style={{ marginRight: "10px" }} /> View Drafts
          </li>
          <li 
            className={activePage === "viewReports" ? "active" : ""}
            onClick={() => setActivePage("viewReports")}
          >
            <FaChartBar style={{ marginRight: "10px" }} /> Reports
          </li>
          
          <li 
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          >
            <span><FaMoneyCheckAlt style={{ marginRight: "10px" }} /> Manage Subscription</span>
            <span>{isSubMenuOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</span>
          </li>
          {isSubMenuOpen && (
            <ul style={{ paddingLeft: "15px", marginTop: "5px", marginBottom: "5px", borderLeft: "2px solid rgba(255,255,255,0.2)" }}>
              <li 
                className={activePage === "addSubscription" ? "active" : ""}
                onClick={() => setActivePage("addSubscription")}
              >
                <FaPlusSquare style={{ marginRight: "10px" }} /> Add Subscription
              </li>
              <li 
                className={activePage === "viewSubscriptions" ? "active" : ""}
                onClick={() => setActivePage("viewSubscriptions")}
              >
                <FaListUl style={{ marginRight: "10px" }} /> View Subscriptions
              </li>
            </ul>
          )}
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
