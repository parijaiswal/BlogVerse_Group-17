import React, { useEffect, useState } from "react";
import "./Admin.css";
import API_BASE from "../../config";

const ViewAllDrafts = ({ onEdit }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/all-drafts`)
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching drafts:", err);
        setLoading(false);
      });
  };

  return (
    <div className="admin-users">
      <h2>All System Drafts</h2>

      {loading ? (
        <p>Loading drafts...</p>
      ) : blogs.length === 0 ? (
        <p style={{ color: '#64748b', fontStyle: 'italic', marginTop: '20px' }}>No drafts found in the system.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Visibility</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map(blog => (
              <tr key={blog.BlogId}>
                <td>{blog.Title}</td>
                <td>
                  <strong>{blog.Username}</strong>
                  <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>({blog.User_Role})</span>
                </td>
                <td>
                  <span className={`status-badge ${blog.Visibility.toLowerCase() === 'private' ? 'draft' : 'approved'}`}>
                    {blog.Visibility}
                  </span>
                </td>
                <td>{new Date(blog.Update_Date).toLocaleDateString()}</td>
                <td>
                  <button className="approve-btn" onClick={() => onEdit(blog)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAllDrafts;
