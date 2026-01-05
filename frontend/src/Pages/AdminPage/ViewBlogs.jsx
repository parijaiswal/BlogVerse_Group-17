import React, { useEffect, useState } from "react";

const ViewBlogs = ({ onEdit }) => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-users">
      <h2>All Blogs</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Visibility</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {blogs.map(blog => (
            <tr key={blog.BlogId}>
              <td>{blog.BlogId}</td>
              <td>{blog.Title}</td>
              <td>{blog.Visibility}</td>
              <td>{blog.Create_Date?.split("T")[0]}</td>
              <td>
                <button className="logout-btn " onClick={() => onEdit(blog)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewBlogs;
