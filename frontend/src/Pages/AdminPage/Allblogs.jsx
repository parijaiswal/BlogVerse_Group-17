import React, { useEffect, useState } from "react";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default AllBlogs;
