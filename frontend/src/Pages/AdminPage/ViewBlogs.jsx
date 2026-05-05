import React, { useEffect, useState } from "react";
import API_BASE from "../../config";

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);

  const openViewModal = async (id) => {
    setLoadingBlog(true);
    setIsModalOpen(true);
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${id}`);
      const data = await res.json();
      setSelectedBlog(data);
    } catch (err) {
      console.error("Error fetching blog details", err);
    }
    setLoadingBlog(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const loadBlogs = async () => {
    const res = await fetch(`${API_BASE}/api/admin/pending-blogs`);
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
    await fetch(`${API_BASE}/api/admin/${action}-blog/${id}`, {
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
                <td>
                  <span className={`status-badge ${blog.Status.toLowerCase()}`}>
                    {blog.Status}
                  </span>
                </td>
                <td>{blog.Update_Date?.split("T")[0]}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="view-btn"
                      onClick={() => openViewModal(blog.BlogId)}
                    >
                      View
                    </button>
                    <button
                      className="approve-btn"
                      onClick={() => updateStatus(blog.BlogId, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => updateStatus(blog.BlogId, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Read-Only View Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal} title="Close">&times;</button>
            {loadingBlog ? (
              <p>Loading blog details...</p>
            ) : selectedBlog ? (
              <div className="blog-preview">
                <h2>{selectedBlog.Title}</h2>
                <p className="blog-meta">
                  By {selectedBlog.Username} | Category: {selectedBlog.Category} | Date: {new Date(selectedBlog.Create_Date).toDateString()}
                </p>
                {selectedBlog.Image_path && (
                  <img 
                    src={`${API_BASE}${selectedBlog.Image_path}`} 
                    alt="Blog Cover" 
                    className="blog-preview-img" 
                  />
                )}
                <div className="blog-preview-content">
                  {selectedBlog.Content && selectedBlog.Content.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="button" style={{ backgroundColor: "#64748b" }} onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <p>Failed to load blog details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBlogs;
