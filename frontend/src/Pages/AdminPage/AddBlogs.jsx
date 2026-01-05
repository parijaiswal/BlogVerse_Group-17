import React, { useEffect, useState } from "react";
import "./AddBlogs.css";

const AddBlog = ({ editBlog, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Prefill when editing
  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.Title);
      setContent(editBlog.Content);
      setVisibility(editBlog.Visibility);
    }
  }, [editBlog]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editBlog
      ? `http://localhost:5000/api/blogs/${editBlog.BlogId}`
      : "http://localhost:5000/api/blogs/add-blog";

    const method = editBlog ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        visibility,
        userId: 1, // only used for add
      }),
    });

    const data = await res.json();

    if (data.success || data.message) {
      alert(editBlog ? "Blog updated" : "Blog added");
      setTitle("");
      setContent("");
      setVisibility("public");
      onSuccess();
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>{editBlog ? "Edit Blog" : "Add Blog"}</h2>

      <label>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <label>Visibility</label>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      <button type="submit">
        {editBlog ? "Update Blog" : "Publish Blog"}
      </button>
    </form>
  );
};

export default AddBlog;
