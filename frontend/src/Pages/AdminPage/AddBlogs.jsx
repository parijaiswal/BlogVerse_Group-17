import React, { useEffect, useState } from "react";
import "./AddBlogs.css";

const AddBlog = ({ editBlog, onSuccess, isClient }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.Title);
      setContent(editBlog.Content);
      setVisibility(editBlog.Visibility);
    }
  }, [editBlog]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isClient
  ? "http://localhost:5000/api/admin/add-blog"        // client blog (subscription + approval)
  : editBlog
  ? `http://localhost:5000/api/blogs/${editBlog.BlogId}` // admin edit
  : "http://localhost:5000/api/admin/admin-add-blog"; // admin new blog

    const method = editBlog ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        visibility,
        userId: localStorage.getItem("userId"),
      }),
    });
const data = await res.json();

if (res.status === 403) {
  alert(data.message);
  return;
}

if (data.success) {
  alert(data.message);
  setTitle("");
  setContent("");
  setVisibility("public");
  onSuccess && onSuccess();
} else {
  alert(data.message || "Something went wrong");
}
  };
  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>{editBlog ? "Edit Blog" : "Publish Blog"}</h2>

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Content</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required />

      <label>Visibility</label>
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      <button type="submit">
  {editBlog
    ? "Update Blog"
    : isClient
    ? "Submit for Approval"
    : "Publish Blog"}
</button>

    </form>
  );
};

export default AddBlog;

