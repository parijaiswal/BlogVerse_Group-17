import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SavedBlogs.css";
function SavedBlogs() {

  const [savedBlogs, setSavedBlogs] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const bookmarks =
      JSON.parse(localStorage.getItem(`bookmarks_${userId}`)) || [];

    axios.get("http://localhost:5000/api/blogs")
      .then(res => {
        const filtered = res.data.filter(blog =>
          bookmarks.includes(blog.BlogId)
        );

        setSavedBlogs(filtered);
      });

  }, []);

  return (
  <div className="saved-blogs-container">
    <h2 className="saved-title">Saved Blogs</h2>

    {savedBlogs.length === 0 ? (
      <p>No saved blogs yet.</p>
    ) : (
      <div className="saved-grid">
        {savedBlogs.map(blog => (
          <div
            key={blog.BlogId}
            className="saved-card"
            onClick={() => window.location.href = `/blog/${blog.BlogId}`}
          >
            {blog.Image_path && (
              <img
                src={`http://localhost:5000${blog.Image_path}`}
                alt={blog.Title}
                className="saved-img"
              />
            )}

            <div className="saved-content">
              <h3>{blog.Title}</h3>

              <p>
                {blog.Content.length > 90
                  ? blog.Content.slice(0, 90) + "..."
                  : blog.Content}
              </p>

              <span className="saved-author">
                By {blog.Username}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
export default SavedBlogs;