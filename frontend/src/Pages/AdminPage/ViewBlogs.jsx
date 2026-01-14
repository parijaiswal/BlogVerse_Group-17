import React, { useEffect, useState } from "react";

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);

  const loadBlogs = async () => {
    const res = await fetch("http://localhost:5000/api/admin/pending-blogs");
    const data = await res.json();

    //This is used to handle case when there are no pending blogs
    if (Array.isArray(data)) {
      setBlogs(data);
    } else {
      setBlogs([]); // no pending blogs
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const updateStatus = async (id, action) => {
    await fetch(`http://localhost:5000/api/admin/${action}-blog/${id}`, {
      method: "PUT",
    });
    loadBlogs();
  };

  return (
    <div className="admin-users">
      <h2>Blog Approval</h2>

      {blogs.length === 0 ? (
        <p>No pending blogs.</p>
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
                <td>{blog.Status}</td>
                <td>{blog.Update_Date?.split("T")[0]}</td>
                <td>
                  <button
                    className="logout-btn"
                    onClick={() => updateStatus(blog.BlogId, "approve")}
                  >
                    Approve
                  </button>
                  &nbsp;
                  <button
                    className="logout-btn"
                    onClick={() => updateStatus(blog.BlogId, "reject")}
                  >
                    Reject
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

export default ViewBlogs;
