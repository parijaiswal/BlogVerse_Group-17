import React, { useEffect, useState } from "react";
import "./AddBlogs.css";

const AddBlog = ({ editBlog, onSuccess, isClient }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.Title || "");
      setContent(editBlog.Content || "");
      setVisibility(editBlog.Visibility || "public");
      setExistingImage(editBlog.Image_path || null);
    }
  }, [editBlog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const url = editBlog
      ? `http://localhost:5000/api/admin/edit-blog/${editBlog.BlogId}`
      : isClient
      ? "http://localhost:5000/api/admin/add-blog"
      : "http://localhost:5000/api/admin/admin-add-blog";

    const method = editBlog ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("userId", 1); // admin user id from Users table
   // formData.append("userId", localStorage.getItem("userId"));

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage(data.message || "Success");

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>
        {editBlog
          ? "Edit Blog"
          : isClient
          ? "Submit Blog for Approval"
          : "Publish Blog"}
      </h2>

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Content</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required />

      <label>Visibility</label>
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      {/* Existing image preview */}
      {existingImage && (
        <div style={{ marginBottom: "15px" }}>
          <p className="current-image-label"><strong>Current Image:</strong></p>
          <img
  src={`http://localhost:5000${existingImage}`}
  alt="Blog"
  style={{ width: "200px", borderRadius: "8px" }}
/>

        </div>
      )}

      <label>{editBlog ? "Replace Image (optional)" : "Blog Image"}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      <button type="submit">
        {editBlog ? "Update Blog" : isClient ? "Submit for Approval" : "Publish Blog"}
      </button>
    </form>
  );
};
export default AddBlog;