import React, { useEffect, useState } from "react";

const EditMyBlogs = ({ onEdit, filterStatus = "all" }) => {
  const adminId = localStorage.getItem("userId");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/my-blogs/${adminId}`)
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, [adminId]);

  const filteredBlogs =
    filterStatus === "all"
      ? blogs
      : blogs.filter((b) => b.Status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="admin-users">
      <h2>My Blogs {filterStatus !== "all" && `(${filterStatus})`}</h2>

      {filteredBlogs.length === 0 ? (
        <p>No {filterStatus !== "all" ? filterStatus : ""} blogs found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBlogs.map(blog => (
              <tr key={blog.BlogId}>
                <td>{blog.Title}</td>
                <td>
                  <span className={`status-badge ${blog.Status.toLowerCase()}`}>
                    {blog.Status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${blog.Visibility.toLowerCase() === 'private' ? 'private' : 'public'}`}>
                    {blog.Visibility}
                  </span>
                </td>
                
                <td>{new Date(blog.Update_Date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(blog)}
                  >
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

export default EditMyBlogs;
