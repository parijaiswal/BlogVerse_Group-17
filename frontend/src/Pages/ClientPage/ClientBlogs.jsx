import React, { useEffect, useState } from "react";
import API_BASE from "../../config";

const ClientBlogs = () => {
  const userId = 1; // TEMP (replace with login later)
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/blogs/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setBlogs(data));
  }, []);

  return (
    <div>
      <h2>My Blogs</h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.BlogId}>
              <td>{blog.Title}</td>
              <td>{blog.Status}</td>
              <td>{blog.Visibility}</td>
              <td>{blog.Create_Date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ClientBlogs;
