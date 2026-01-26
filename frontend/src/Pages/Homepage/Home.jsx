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
    <h3>Where Ideas Meet Influence</h3>
    <p>
      Discover insightful content on branding, marketing, and digital trends. 
      Join our community of writers and brands sharing stories that matter.
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
  <h2>Why BlogVerse?</h2>
  <p className="features-subtitle">
    Everything you need to share your ideas with the world
  </p>
  
  <div className="features-grid">
    <div className="feature-card">
      <div className="feature-icon">✍️</div>
      <h4>Easy Publishing</h4>
      <p>Simple and intuitive editor to write and publish your blogs in minutes.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">🎯</div>
      <h4>Reach Your Audience</h4>
      <p>Get your content in front of readers interested in your niche.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">📊</div>
      <h4>Track Engagement</h4>
      <p>See likes, comments, and how your content performs over time.</p>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">🏢</div>
      <h4>Brand Friendly</h4>
      <p>Perfect for businesses to share case studies and brand stories.</p>
    </div>
  </div>
</section>
   
{/* LATEST BLOGS SECTION */}
<section className="latest-section" id="latest-cards">
  <h2>Latest from BlogVerse</h2>
  <p className="latest-subtitle">
    Recently published blogs on branding, media intelligence and marketing.
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
          <span className="blog-author">{blog.Username ? `By ${blog.Username}` : ""}</span>
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
      <h2>Want to publish your blog on BlogVerse?</h2>
      <p className="subtitle">
        Brand clients and registered members can publish blogs on BlogVerse.<br />
        Share sponsored articles, case studies or your own insights on media, branding and marketing.
      </p>
      <button className="learn-more-btn" onClick={handleCTAClick}>
        {isLoggedIn ? "Write a Blog" : "Register Now"}
      </button>
    </div>

    <div className="publish-right">
      <div className="step">
        <div className="step-number">1</div>
        <div>
          <h4>Register & log in</h4>
          <p>Create your account on BlogVerse and become our client.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number">2</div>
        <div>
          <h4>Choose subscription</h4>
          <p>Choose a subscription plan that fits your needs.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number">3</div>
        <div>
          <h4>Publish your blog</h4>
          <p>Write your ideas and share about your brand.</p>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
    
  );
}

export default Home;