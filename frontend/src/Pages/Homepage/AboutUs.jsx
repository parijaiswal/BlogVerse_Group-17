import React from 'react';
import './AboutUs.css'; 
import API_BASE from '../../config';

const AboutUs = () => {
  return (
    <div className="about-wrapper">
      {/* Header Section */}
      <div className="about-header">
        <h1>About BlogVerse</h1>
        <p>A Place where you can share your thoughts and ideas with the world.</p>
      </div>

      <div className="about-content">
        <section className="about-mission-container">
          <div className="about-mission-text">
            <h2>Our Mission</h2>
            <p>
              BlogVerse was built with a clear goal: to provide a platform where people can read engaging articles, and those who love to write can share their thoughts and ideas with the world. 
              Our aim is to create a community where people can easily share their knowledge and experiences, while others can read and gain valuable insights.
            </p>
          </div>
          <div className="about-mission-image">
            <img 
              src={`${API_BASE}/uploads/about%20us%20image.webp`} 
              alt="About BlogVerse Illustration" 
            />
          </div>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", color: "#475569", fontSize: "1.05rem", lineHeight: "1.8" }}>
            <li><strong>Write Blogs:</strong> Users can write blogs and manage their own content effortlessly.</li>
            <li><strong>Bookmark:</strong> Users can bookmark their favorite blogs and access them anytime.</li>
            <li><strong>Discover Content:</strong> Readers can explore a wide variety of topics shared by our growing community of writers.</li>
            <li><strong>Download PDF:</strong>Users can download blogs in PDF format.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
