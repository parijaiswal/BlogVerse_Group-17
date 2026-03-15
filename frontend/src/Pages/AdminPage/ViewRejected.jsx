import React, { useEffect, useState } from "react";
import API_BASE from "../../config";

const ViewRejected = () => {
  const [blogs, setBlogs] = useState([]);

  const loadBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/rejected-blogs`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching rejected blogs:", error);
      setBlogs([]);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const updateStatus = async (id, action) => {
    // Optionally allow re-approving a rejected blog
    await fetch(`${API_BASE}/api/admin/${action}-blog/${id}`, {
      method: "PUT",
    });
    loadBlogs();
  };

  return (
    <div className="admin-users">
      <h2>Rejected Blogs</h2>

      {blogs.length === 0 ? (
        <p>No rejected blogs found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.BlogId}>
                <td>{blog.BlogId}</td>
                <td>{blog.Title}</td>
                <td>
                  <span className={`status-badge ${blog.Status.toLowerCase()}`}>
                    {blog.Status}
                  </span>
                </td>
                <td>{blog.Update_Date?.split("T")[0]}</td>
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => updateStatus(blog.BlogId, "approve")}
                  >
                    Approve
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

export default ViewRejected;
