import React, { useEffect, useState } from "react";

const EditMyBlogs = ({ onEdit }) => {
  const adminId = localStorage.getItem("userId");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/my-blogs/${adminId}`)
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, [adminId]);

  return (
    <div className="admin-users">
      <h2>My Blogs</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Visibility</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {blogs.map(blog => (
            <tr key={blog.BlogId}>
              <td>{blog.Title}</td>
              <td className="status" style={{ color: blog.Visibility === 'private' ? 'red' : 'green', fontWeight: 600 }}>{blog.Visibility}</td>
              
              <td>{new Date(blog.Update_Date).toLocaleDateString()}</td>
              <td>
                <button
                  className="logout-btn"
                  onClick={() => onEdit(blog)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditMyBlogs;
