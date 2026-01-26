import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminPage/Admin.css";

const ViewSubscription = () => {
  const userId = localStorage.getItem("userId");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/admin/client-subscription/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subscription");
        return res.json();
      })
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading details");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="loading-spinner">Loading subscription...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (!subscription || subscription.message) {
    // If no active subscription, show message and button to redirect
    return (
      <div className="admin-card">
        <h2 className="admin-card-title">My Subscription</h2>
        <p>No active subscription found.</p>
        <button 
          className="button"
          style={{ marginTop: '20px', cursor: 'pointer' }}
          onClick={() => navigate("/Subscription")}
        >
          View Subscription Plans
        </button>
      </div>
    );
  }

  return (
    <div className="client-sub-wrapper">
      <div className="client-sub-card">
        <div className="client-sub-header">
          <h3>Current Plan Details</h3>
          <span className={`status-badge ${subscription.Status === "Active" ? "active" : "expired"}`}>
            {subscription.Status}
          </span>
        </div>
        
        <div className="client-sub-body">
          <div className="sub-detail-item">
            <span className="sub-label">Plan Name</span>
            <span className="sub-value highlight">{subscription.SubName}</span>
          </div>
          
          <div className="sub-detail-item">
            <span className="sub-label">Price</span>
            <span className="sub-value">₹{subscription.SubPrice}</span>
          </div>

          <div className="sub-detail-item">
            <span className="sub-label">Duration</span>
            <span className="sub-value">{subscription.SubDuration} Months</span>
          </div>

          <div className="sub-detail-item">
            <span className="sub-label">Start Date</span>
            <span className="sub-value">{formatDate(subscription.Start_date)}</span>
          </div>

          <div className="sub-detail-item">
            <span className="sub-label">End Date</span>
            <span className="sub-value">{formatDate(subscription.End_date)}</span>
          </div>
        </div>

        <div className="client-sub-footer">
            <p className="renewal-text">Need to upgrade? Check out other plans.</p>
            <button className="upgrade-btn" onClick={() => navigate("/Subscription")}>
                View Plans
            </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSubscription;
