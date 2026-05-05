import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../../config";
import "./AuthorProfile.css";

const AuthorProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/author/${userId}`),
      axios.get(`${API_BASE}/api/author/${userId}/blogs`)
    ]).then(([authorRes, blogsRes]) => {
      setAuthor(authorRes.data);
      setBlogs(blogsRes.data);
    }).catch(err => {
      console.error("Error loading author profile:", err);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="author-profile-loading">Loading profile...</div>;
  if (!author) return <div className="author-profile-loading">Author not found.</div>;

  const initials = author.Username
    ? author.Username.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
    
  const loggedInUserId = localStorage.getItem("userId");
  const isOwnProfile = String(loggedInUserId) === String(userId);

  return (
    <div className="author-profile-page">
      <div className="author-hero-card">
        <div className="author-avatar-circle">{initials}</div>
        <div className="author-hero-info">
          <h1 className="author-name">{author.Username}</h1>
          {author.Bio ? (
            <p className="author-bio">{author.Bio}</p>
          ) : isOwnProfile ? (
            <p className="author-bio" style={{ fontStyle: "italic", color: "#64748b" }}>
              You haven't added a bio yet. Update your profile settings to tell readers about yourself.
            </p>
          ) : (
            <p className="author-bio" style={{ display: "none" }}></p>
          )}
          <div className="author-stats">
            <div className="stat-block">
              <span className="stat-number">{blogs.length}</span>
              <span className="stat-label">Published Blogs</span>
            </div>
            <div className="stat-block">
              <span className="stat-number">{blogs.reduce((s, b) => s + (b.Like_count || 0), 0)}</span>
              <span className="stat-label">Total Likes</span>
            </div>
            <div className="stat-block">
              <span className="stat-number">{blogs.reduce((s, b) => s + (b.Comment_count || 0), 0)}</span>
              <span className="stat-label">Total Comments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="author-blogs-section">
        <h2 className="author-blogs-heading">Blogs by {author.Username}</h2>
        {blogs.length === 0 ? (
          <p className="no-blogs-msg">This author has no published blogs yet.</p>
        ) : (
          <div className="author-blog-grid">
            {blogs.map(blog => (
              <div
                key={blog.BlogId}
                className="author-blog-card"
                onClick={() => navigate(`/blog/${blog.BlogId}`)}
              >
                <div className="author-blog-img-wrapper">
                  <img
                    src={blog.Image_path ? `${API_BASE}${blog.Image_path}` : require("../../Images/blog1.webp")}
                    alt={blog.Title}
                    className="author-blog-img"
                  />
                  <span className="author-blog-category">{blog.Category || "General"}</span>
                </div>
                <div className="author-blog-body">
                  <h3 className="author-blog-title">{blog.Title}</h3>
                  <p className="author-blog-snippet">
                    {blog.Content?.length > 100 ? blog.Content.slice(0, 100) + "..." : blog.Content}
                  </p>
                  <div className="author-blog-footer">
                    <span>{blog.Like_count || 0} Likes</span>
                    <span>{blog.Comment_count || 0} Comments</span>
                    <span className="author-blog-date">
                      {new Date(blog.Create_Date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
