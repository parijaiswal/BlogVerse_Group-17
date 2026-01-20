import React from 'react'
import HeroImage from "../../Images/heromain1.png";
import "./Home.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/blogs")
      .then((res) => {
      console.log("API response:", res.data); // check here
      setBlogs(res.data);
    })
      .catch((err) => console.error("API error:",err));
  }, []);

  return (
    <div>
     {/* Main section of the homepage */}
      <section className="hero">
  <div className="hero-left">
    <h1>BlogVerse</h1>  
    <h3>Explore Brands Insights, Stories & Marketing Perspectives</h3>
    <p>
      CultureX's blogging platform where brands and writers share
      content on media intelligence, marketing and digital trends.
   </p>

    <button className="read-more-btn">Browse Blogs</button>
  </div>

 <div className="hero-right">
  <img src={HeroImage} alt="Blogging" className="hero-img" />
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
      {/* <span className="search-icon"></span> */}
      <input type="text" placeholder="Search Latest blogs" />
      <button className="search-btn">Search</button>
    </div>

     <div className="latest-cards">
  {blogs.map((blog) => (
    <div
      className="blog-card"
      key={blog.BlogId}
      onClick={() => navigate(`/blog/${blog.BlogId}`)}
      style={{ cursor: "pointer" }}
    >
      <img
        src={require("../../Images/blog1.webp")}
        alt={blog.Title}
        className="blog-img"
      />
      <span className="blog-tag">#Blog</span>
      <h3>{blog.Title}</h3>
      <p>
        {blog.Content.length > 100
          ? blog.Content.slice(0, 100) + "..."
          : blog.Content}
      </p>
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
      <button className="learn-more-btn">Learn more</button>
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