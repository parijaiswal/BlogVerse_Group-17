import React from 'react'
import HeroImage from "../../Images/heromain1.png";
import Footer from '../../Components/footer';
import "./Home.css";

function Home() {
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

    {/* <div className="hero-search">
      <span className="search-icon">🔍</span>
      <input type="text" placeholder="Search What you want to read" />
    </div> */}

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
    {/* Card 1 */}
    <div className="blog-card">
      <img
        src={require("../../Images/blog1.webp")}
        alt="Blog 1"
        className="blog-img"
      />
      <span className="blog-tag">#Branding</span>
      <h3>Building a Strong Digital Brand</h3>
      <p>
        How brands create a consistent identity across websites, social media
        and online campaigns.
      </p>
    </div>

    {/* Card 2 */}
    <div className="blog-card">
      <img
        src={require("../../Images/blog2.webp")}
        alt="Blog 2"
        className="blog-img"
      />
      <span className="blog-tag">#MediaIntelligence</span>
      <h3>Tracking Online Conversations</h3>
      <p>
        Learn how media intelligence tools help companies monitor trends and
        understand audience behaviour.
      </p>
    </div>

    {/* Card 3 */}
    <div className="blog-card">
      <img
        src={require("../../Images/blog3.webp")}
        alt="Blog 3"
        className="blog-img"
      />
      <span className="blog-tag">#Analytics</span>
      <h3>Using Data to Improve Campaigns</h3>
      <p>
        A simple guide on using analytics to measure performance and improve
        marketing results.
      </p>
    </div>
    {/* Card 4 */}
  <div className="blog-card">
    <img src={require("../../Images/blog3.webp")}  alt="Blog 4" className="blog-img" />
    <span className="blog-tag">#SocialMedia</span>
    <h3>Engaging Audiences on Social Platforms</h3>
    <p>Simple tips to create posts that people actually interact with.</p>
  </div>

  {/* Card 5 */}
  <div className="blog-card">
    <img src={require("../../Images/blog1.webp")}  alt="Blog 5" className="blog-img" />
    <span className="blog-tag">#Campaigns</span>
    <h3>Designing Effective Ad Campaigns</h3>
    <p>How to structure a campaign from idea to final performance report.</p>
  </div>

  {/* Card 6 */}
  <div className="blog-card">
    <img src={require("../../Images/blog2.webp")}  alt="Blog 6" className="blog-img" />
    <span className="blog-tag">#Trends</span>
    <h3>Top Digital Trends to Watch</h3>
    <p>Key changes in digital media that marketers should keep an eye on.</p>
  </div>
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
<Footer/>

    </div>
  );
}

export default Home