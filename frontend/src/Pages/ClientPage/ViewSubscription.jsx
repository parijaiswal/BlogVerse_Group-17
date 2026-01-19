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
    <div className="admin-card">
      <h2 className="admin-card-title">My Subscription</h2>

      <p><strong>Plan:</strong> {subscription.SubName}</p>
      <p><strong>Duration:</strong> {subscription.SubDuration} Months</p>
      <p><strong>Price:</strong> ₹{subscription.SubPrice}</p>
      <p><strong>Status:</strong> <span style={{color: 'green', fontWeight: 'bold'}}>{subscription.Status}</span></p>
      <p><strong>Start Date:</strong> {formatDate(subscription.Start_date)}</p>
      <p><strong>End Date:</strong> {formatDate(subscription.End_date)}</p>
    </div>
  );
};

export default ViewSubscription;
