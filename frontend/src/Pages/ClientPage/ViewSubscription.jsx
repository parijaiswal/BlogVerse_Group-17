import React, { useEffect, useState } from "react";
import "../AdminPage/Admin.css";
const ViewSubscription = () => {
  const userId = localStorage.getItem("userId");
  const [subscription, setSubscription] = useState(null);
  const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/admin/client-subscription/${userId}`)
      .then((res) => res.json())
      .then((data) => setSubscription(data))
      .catch((err) => console.error(err));
  }, [userId]);

  if (!subscription) {
    return <p>Loading subscription...</p>;
  }

  if (subscription.message) {
    return (
      <div className="subscription-card">
        <h2>My Subscription</h2>
        <p>No active subscription found.</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">My Subscription</h2>

      <p><strong>Plan:</strong> {subscription.SubName}</p>
      <p><strong>Duration:</strong> {subscription.SubDuration} Months</p>
      <p><strong>Price:</strong> ₹{subscription.SubPrice}</p>
      <p><strong>Status:</strong> {subscription.Status}</p>
      <p><strong>Start Date:</strong> {formatDate(subscription.Start_date)}</p>
      <p><strong>End Date:</strong> {formatDate(subscription.End_date)}</p>
    </div>
  );
};

export default ViewSubscription;
