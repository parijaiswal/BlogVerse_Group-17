import React, { useEffect, useState } from "react";
import "../AdminPage/Admin.css";

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/admin/client-blogs/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blogs");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setBlogs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlogs([]);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="loading-spinner">Loading my blogs...</div>;

  return (
    <div className="admin-users">
      <h2>My Blogs</h2>

      {blogs.length === 0 ? (
        <p>You have not submitted any blogs yet.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.BlogId}>
                <td>{blog.BlogId}</td>
                <td>{blog.Title}</td>
                <td>
                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        blog.Status === "approved"
                          ? "green"
                          : blog.Status === "rejected"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {blog.Status}
                  </span>
                </td>
                <td>{blog.Update_Date?.split("T")[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default MyBlogs;

