import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
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
                <td className="status" style={{ color: blog.Visibility === 'private' ? 'red' : 'green', fontWeight: 600 }}>{blog.Visibility}</td>
                <td>{blog.Create_Date?.split("T")[0]}</td>
                <td>{blog.User_Role}</td>
                <td>
                   <span
                      onClick={() =>
                      navigate(`/blog/${blog.BlogId}`)}
                style={{
                  color: "#1a73e8",
                  cursor: "pointer",
                  fontWeight: 500,
               }}
              >
                  View
                </span>
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
