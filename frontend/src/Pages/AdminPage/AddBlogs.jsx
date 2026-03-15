import React, { useEffect, useState } from "react";
import "./AddBlogs.css";
import API_BASE from "../../config";

const AddBlog = ({ editBlog, onSuccess, isClient, editEndpoint }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [category, setCategory] = useState("Technology");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.Title || "");
      setContent(editBlog.Content || "");
      setVisibility(editBlog.Visibility || "public");
      setCategory(editBlog.Category || "Technology");
      setExistingImage(editBlog.Image_path || null);
    }
  }, [editBlog]);

  const handleSubmit = async (e, submitType) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const url = editEndpoint
      ? editEndpoint
      : editBlog
      ? `${API_BASE}/api/admin/edit-blog/${editBlog.BlogId}`
      : isClient
      ? `${API_BASE}/api/admin/add-blog`
      : `${API_BASE}/api/admin/admin-add-blog`;

    const method = editBlog ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("category", category);
    formData.append("userId", localStorage.getItem("userId"));
    if (submitType) {
        formData.append("status", submitType); // passes "draft" or "published"
    }

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

      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Technology">Technology</option>
        <option value="Education">Education</option>
        <option value="Lifestyle">Lifestyle</option>
        <option value="Health">Health</option>
        <option value="Business">Business</option>
        <option value="Entertainment">Entertainment</option>
        <option value="General">General</option>
      </select>

      {/* Existing image preview */}
      {existingImage && (
        <div style={{ marginBottom: "15px" }}>
          <p className="current-image-label"><strong>Current Image:</strong></p>
          <img
  src={`${API_BASE}${existingImage}`}
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

      <div className="button-group">
  <button
    type="submit"
    onClick={(e) => handleSubmit(e, "published")}
  >
    {editBlog
      ? "Update Blog"
      : isClient
      ? "Submit for Approval"
      : "Publish Blog"}
  </button>

  {!editBlog && (
    <button
      type="button"
      className="draft-btn"
      onClick={(e) => handleSubmit(e, "draft")}
    >
      Save as Draft
    </button>
  )}
</div>
    </form>
  );
};
export default AddBlog;