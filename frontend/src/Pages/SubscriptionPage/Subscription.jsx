import React from "react";
import "./Subscription.css";

const Subscription = () => {
  return (
    <div className="subscription-page">
      <h1 className="subscription-title">Choose Your Plan</h1>
      <p className="subscription-subtitle">
            Upgrade your experience and enjoy unlimited access
      </p>

 
      <div className="plans-container">
        {/* 1 Month */}
        <div className="plan-card plan-1">
          <h2>1 Month</h2>
          <p className="price">₹199</p>
          <ul>
            <li>Unlimited Blog Downloads</li>
            <li>Like & Comment</li>
            <li>Access All Blogs</li>
            <li>Email Support</li>
          </ul>
          <button className="plan-btn">Buy Now</button>
        </div>

        {/* 6 Month */}
        <div className="plan-card plan-6 popular">
          <span className="badge">Most Popular</span>
          <h2>6 Months</h2>
          <p className="price">₹999</p>
          <ul>
            <li>Everything in 1 Month</li>
            <li>Unlimited Downloads</li>
            <li>Priority Support</li>
            <li>Save More Money</li>
          </ul>
          <button className="plan-btn primary">Buy Now</button>
        </div>

        {/* 1 Year */}
        <div className="plan-card plan-12">
          <h2>1 Year</h2>
          <p className="price">₹1799</p>
          <ul>
            <li>All 6 Month Benefits</li>
            <li>Best Value Plan</li>
            <li>Premium Badge</li>
            <li>24/7 Support</li>
          </ul>
          <button className="plan-btn">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
