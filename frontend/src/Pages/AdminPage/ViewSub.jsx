import React, { useEffect, useState } from 'react'
import "./AddBlogs.css"; // reuse admin-form styling

const ViewSub = ({ onEdit }) => {
 const [subs, setSubs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/subscriptions")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch subscriptions");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setSubs(data);
        } else {
          setSubs([]);
          console.error("API did not return an array:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error loading subscriptions");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-users">
      <h2>All Subscriptions</h2>

      {subs.length === 0 ? (
        <p>No subscriptions found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Duration (months)</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {subs.map(sub => (
              <tr key={sub.SubId}>
                <td>{sub.SubId}</td>
                <td>{sub.SubName}</td>
                <td>{sub.SubDuration}</td>
                <td>{sub.SubPrice}</td>
                <td className="status" style={{ color: sub.Visibility === 'inactive' ? 'red' : 'green', fontWeight: 600 }}>{sub.Visibility}</td>
                <td>
                  <button onClick={() => onEdit(sub)} className="logout-btn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ViewSub