import React from 'react'
import HeroImage from "../../Images/heromain1.png";
import "./Home.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Check login status
  const role = localStorage.getItem("role");
  const validRoles = ["admin", "client", "member"];
  const isLoggedIn = role && validRoles.includes(role.toLowerCase());

  useEffect(() => {
    axios.get("http://localhost:5000/api/blogs")
      .then((res) => {
      console.log("API response:", res.data); // check here
      setBlogs(res.data);
    })
      .catch((err) => console.error("API error:",err));
  }, []);

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase();
    return (
      blog.Title?.toLowerCase().includes(query) ||
      blog.Content?.toLowerCase().includes(query) ||
      blog.Username?.toLowerCase().includes(query)
    );
  });

  const handleCTAClick = () => {
    if (isLoggedIn) {
      navigate(`/${role.toLowerCase()}`);
    } else {
      navigate("/register");
    }
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
      <div className="feature-icon">✍️</div>
      <h4>Write Blogs</h4>
      <p>Create and publish your own blog posts easily.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">📖</div>
      <h4>Read Content</h4>
      <p>Browse blogs from different authors.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">💬</div>
      <h4>Comment</h4>
      <p>Share your thoughts on blog posts.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">📥</div>
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
   <div className="hero-search">
      <input 
        type="text" 
        placeholder="Search Latest blogs" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="search-btn">Search</button>
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
        <h3>{blog.Title}</h3>
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