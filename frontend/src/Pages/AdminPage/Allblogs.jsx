import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs/all")
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, []);

  return (
    <div className="admin-users">
      <h2>All Blogs</h2>

      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Visibility</th>
              <th>Date</th>
              <th>Written by</th>
               <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.BlogId}>
                <td>{blog.BlogId}</td>
                <td>{blog.Title}</td>
                <td>
                  <span className={`status-badge ${blog.Visibility.toLowerCase() === 'private' ? 'private' : 'public'}`}>
                    {blog.Visibility}
                  </span>
                </td>
                <td>{blog.Create_Date?.split("T")[0]}</td>
                <td>{blog.Username} <span style={{fontSize: "12px", color: "#666"}}>({blog.User_Role})</span></td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/blog/${blog.BlogId}`)}
                  >
                    View
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
export default AllBlogs;
