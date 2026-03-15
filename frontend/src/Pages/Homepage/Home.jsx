import React from 'react'
import HeroImage from "../../Images/heromain1.png";
import "./Home.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPenNib, FaBookOpen, FaRegComments, FaFileDownload } from "react-icons/fa";



function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Check login status
  const role = localStorage.getItem("role");
  const validRoles = ["admin", "client", "member"];
  const isLoggedIn = role && validRoles.includes(role.toLowerCase());

  useEffect(() => {
    axios.get(`http://localhost:5000/api/blogs?sort=${sortOrder}`)
      .then((res) => {
      console.log("API response:", res.data); // check here
      setBlogs(res.data);
    })
      .catch((err) => console.error("API error:",err));
  }, [sortOrder]);

  // Filter blogs based on search query AND category
  const filteredBlogs = blogs.filter((blog) => {
    const queryMatch =
      blog.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.Content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.Username?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const categoryMatch = selectedCategory === "All Categories" || blog.Category === selectedCategory;

    return queryMatch && categoryMatch;
  })
  .sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.Create_Date) - new Date(a.Create_Date);
    } else {
      return new Date(a.Create_Date) - new Date(b.Create_Date);
    }
  });

  const handleCTAClick = () => {
    if (isLoggedIn) {
      navigate(`/${role.toLowerCase()}`);
    } else {
      navigate("/register");
    }
  };
  const handleSort = () => {
  setSortOrder(prev => prev === "latest" ? "oldest" : "latest");
};
const toggleBookmark = (blogId) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login to bookmark blogs");
    return;
  }

  const key = `bookmarks_${userId}`;
  let bookmarks = JSON.parse(localStorage.getItem(key)) || [];

  if (bookmarks.includes(blogId)) {
    bookmarks = bookmarks.filter(id => id !== blogId);
  } else {
    bookmarks.push(blogId);
  }

  localStorage.setItem(key, JSON.stringify(bookmarks));
};

  return (
    <div>
     {/* Main section of the homepage */}
      <section className="hero">
  <div className="hero-left">
    <h1>BlogVerse</h1>  
    <h3>Share Your Ideas and Insightful thoughts</h3>
    <p>
      A platform where you can read and write blogs. 
      Create an account and start sharing your thoughts and ideas.
   </p>

    <button className="read-more-btn" onClick={() => document.getElementById('latest-cards').scrollIntoView({ behavior: 'smooth' })}>
      Explore Blogs
    </button>
  </div>

 <div className="hero-right">
  <img src={HeroImage} alt="Blogging" className="hero-img" />
</div>
</section>

{/* WHY BLOGVERSE SECTION */}
<section className="features-section">
  <h2>Features BlogVerse Provides</h2>
  <p className="features-subtitle">
    What you can do on BlogVerse
  </p>
  
  <div className="features-grid">
    <div className="feature-card">
      <div className="feature-icon" style={{ color: "#2563eb" }}>
        <FaPenNib />
      </div>
      <h4>Write Blogs</h4>
      <p>Create and publish your own blog posts easily.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon" style={{ color: "#2563eb" }}>
        <FaBookOpen />
      </div>
      <h4>Read Content</h4>
      <p>Browse blogs from different authors.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon" style={{ color: "#2563eb" }}>
        <FaRegComments />
      </div>
      <h4>Comment</h4>
      <p>Share your thoughts on blog posts.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon" style={{ color: "#2563eb" }}>
        <FaFileDownload />
      </div>
      <h4>Download PDF</h4>
      <p>Save blogs as PDFs for offline reading.</p>
    </div>
  </div>
</section>
   
{/* LATEST BLOGS SECTION */}
<section className="latest-section" id="latest-cards">
  <h2>Explore the latest Blogs on our website</h2>
  <p className="latest-subtitle">
    Check out the latest posts
  </p>
  {/* search bar */}
   <div className="search-wrapper">
  
  {/* Capsule Search */}
  <div className="hero-search">
    <input 
      type="text" 
      placeholder="Search Latest blogs"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />

    <button 
      className="action-btn">
      Search
    </button>
  </div>
{/* Sort Dropdown Outside Capsule */}
<select
  className="action-btn sort-dropdown"
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
>
  <option value="latest">Latest</option>
  <option value="oldest">Oldest</option>
</select>

{/* Category Filter Dropdown */}
<select
  className="action-btn category-dropdown"
  style={{ marginLeft: "10px" }}
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
>
  <option value="All Categories">All Categories</option>
  <option value="Technology">Technology</option>
  <option value="Education">Education</option>
  <option value="Lifestyle">Lifestyle</option>
  <option value="Health">Health</option>
  <option value="Business">Business</option>
  <option value="Entertainment">Entertainment</option>
  <option value="General">General</option>
</select>
</div>

      <div className="latest-cards">
  {filteredBlogs.slice(0, 6).map((blog) => (
    <div
      className="blog-card"
      key={blog.BlogId}
      onClick={() => navigate(`/blog/${blog.BlogId}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="blog-img-container">
        <img
          src={blog.Image_path ? `http://localhost:5000${blog.Image_path}` : require("../../Images/blog1.webp")}
          alt={blog.Title}
          className="blog-img"
        />
      </div>
      
      <div className="blog-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>{blog.Title}</h3>
          <span style={{
            fontSize: "0.75rem",
            backgroundColor: "#e0e7ff",
            color: "#4f46e5",
            padding: "3px 8px",
            borderRadius: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}>
            {blog.Category || "General"}
          </span>
        </div>
        <p className="blog-snippet">
          {blog.Content.length > 80
            ? blog.Content.slice(0, 80) + "..."
            : blog.Content}
        </p>
        
        <div className="blog-meta">
          <span className="blog-author">{blog.Username ? `By ${blog.Username === "Admin user" ? "Admin" : blog.Username}` : ""}</span>
          <span className="blog-date">{new Date(blog.Create_Date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  ))}
</div>

  </section>


{/* Want to publish section */}
<section className="publish-cta-section" id="publish-cta">
  <div className="publish-container">
    <div className="publish-left">
      <h2>Want to Write a Blog?</h2>
      <p className="subtitle">
        Register as a Client to publish your own blogs on BlogVerse.
      </p>
      <button className="learn-more-btn" onClick={handleCTAClick}>
        {isLoggedIn ? "Go to Dashboard" : "Register Now"}
      </button>
    </div>

    <div className="publish-right">
      <div className="step">
        <div className="step-number">1</div>
        <div>
          <h4>Register</h4>
          <p>Create your account as a Client.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number">2</div>
        <div>
          <h4>Login</h4>
          <p>Access your dashboard.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number">3</div>
        <div>
          <h4>Write</h4>
          <p>Create and publish your blog.</p>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
    
  );
}

export default Home;