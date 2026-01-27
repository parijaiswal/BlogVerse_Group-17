import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Icons based on duration or index
  const getIcon = (duration, index) => {
    if (duration <= 1) return "📅";
    if (duration <= 6) return "📅";
    if (duration <= 12) return "📅";
    // Fallback icons for other durations
    const icons = ["📅", "⭐", "💎", "🚀", "🎯", "✨"];
    return icons[index % icons.length];
  };

  // Get color theme based on duration or index
  const getColorClass = (duration, index) => {
    if (duration <= 1) return "plan-blue";
    if (duration <= 6) return "plan-gold";
    if (duration <= 12) return "plan-green";
    // Fallback colors
    const colors = ["plan-blue", "plan-gold", "plan-green"];
    return colors[index % colors.length];
  };

  // Format duration text
  const getDurationText = (months) => {
    if (months === 1) return "1 Month";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/subscriptions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subscriptions");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter only active subscriptions and sort by duration
          const activePlans = data
            .filter((sub) => sub.Visibility === "active")
            .sort((a, b) => a.SubDuration - b.SubDuration);
          setPlans(activePlans);
        } else {
          setPlans([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load subscription plans");
        setLoading(false);
      });
  }, []);

  const handleBuyNow = (plan) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      // Redirect to login if not logged in
      navigate("/login");
      return;
    }
    // Navigate to payment page with plan details
    navigate("/payment", { state: { plan } });
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1 className="subscription-title">Choose Your Plan</h1>
        <p className="subscription-subtitle">
          Purchase a subscription plan and publish your ideas to the users.
        </p>
      </div>

      <div className="plans-container">
        {plans.length === 0 ? (
          <div className="no-plans">
            <p>No subscription plans available at the moment.</p>
          </div>
        ) : (
          plans.map((plan, index) => (
            <div
              key={plan.SubId}
              className={`plan-card ${getColorClass(plan.SubDuration, index)}`}
            >
              <div className="plan-icon">
                {getIcon(plan.SubDuration, index)}
              </div>
              <h2>{plan.SubName}</h2>
              <span className="plan-duration">
                {getDurationText(plan.SubDuration)}
              </span>
              <p className="price">
                ₹{plan.SubPrice}
                <span className="price-period">
                  /{plan.SubDuration === 12 ? "yr" : plan.SubDuration + "mo"}
                </span>
              </p>
              <ul>
                <li>Unlimited Blog Downloads</li>
                <li>Like & Comment</li>
                <li>Access All Blogs</li>
                {plan.SubDuration == 6 ? <li>Can Publish 10 blogs</li> : null}
                {plan.SubDuration == 12 ? <li>Can Publish 30 blogs</li> : null}
              </ul>
              <button className="plan-btn" onClick={() => handleBuyNow(plan)}>
                Get {plan.SubName}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscription;
