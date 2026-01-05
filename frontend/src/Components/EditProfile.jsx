import React, { useState,useEffect } from "react";
import "./EditProfile.css";
const EditProfile = () => {
  // const userId = localStorage.getItem(1); 
  const userId = 1;
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  useEffect(() => {
  if (!userId) {
    console.log("No userId in localStorage");
    return;
  }

  fetch(`http://localhost:5000/api/admin/profile/${userId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Profile fetch failed");
      return res.json();
    })
    .then((data) => {
      setUsername(data.Username || "");
      setContact(data.ContactNo || "");
      setGender(data.Gender || "");
    })
    .catch((err) => {
      console.error("Profile fetch error:", err.message);
    });
}, [userId]);

/*This is for the editing the profile*/
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/admin/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        username,
        contact,
        gender,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

 /*This is for changing the password*/
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/admin/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        oldPassword,
        newPassword,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="profile-wrapper">

      {/* ===== EDIT PROFILE CARD ===== */}
      <div className="profile-card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleProfileUpdate}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <button type="submit">Save Profile</button>
        </form>
      </div>

      {/* ===== CHANGE PASSWORD CARD ===== */}
      <div className="profile-card">
        <h2>Change Password</h2>

        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};
export default EditProfile;