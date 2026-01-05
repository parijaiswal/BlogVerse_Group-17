import React, { useEffect, useState } from "react";
import "./AddBlogs.css"; // reuse admin-form styling


const AddSubscription = ({ editSub, onSuccess }) => {
  const [subName, setSubName] = useState("");
  const [subDuration, setSubDuration] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("active");

  useEffect(() => {
    if (editSub) {
      setSubName(editSub.SubName);
      setSubDuration(editSub.SubDuration);
      setSubPrice(editSub.SubPrice);
      setDescription(editSub.Description || "");
      setVisibility(editSub.Visibility);
    }
  }, [editSub]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editSub
      ? `http://localhost:5000/api/admin/subscriptions/${editSub.SubId}`
      : "http://localhost:5000/api/admin/add-subscription";

    const method = editSub ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subName,
        subDuration,
        subPrice,
        description,
        visibility,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert(editSub ? "Subscription updated" : "Subscription added");
      onSuccess();
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>{editSub ? "Edit Subscription" : "Add Subscription"}</h2>

      <label>Subscription Name</label>
      <input value={subName} onChange={(e) => setSubName(e.target.value)} required />

      <label>Duration (months)</label>
      <input type="number" value={subDuration} onChange={(e) => setSubDuration(e.target.value)} required />

      <label>Price</label>
      <input type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} required />

      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <label>Status</label>
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button type="submit">
        {editSub ? "Update Subscription" : "Add Subscription"}
      </button>
    </form>
  );
};

export default AddSubscription;
