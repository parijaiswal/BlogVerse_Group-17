import React, { useState, useEffect } from "react";
import "./EditProfile.css";
import API_BASE from "../config";

const EditProfile = () => {
  const userId = localStorage.getItem("userId");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Separate message states for each form
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.Username || "");
        setEmail(data.Email || "");
        setContact(data.ContactNo || "");
        setGender(data.Gender || "");
        setRole(data.User_Role || "");
      })
      .catch((err) => console.error(err));
  }, [userId]);

  /* ================= UPDATE PROFILE ================= */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    const res = await fetch(`${API_BASE}/api/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        contact,
        gender,
      }),
    });

    const data = await res.json();
    setProfileMessage(data.message);
  };

  /* ================= CHANGE PASSWORD ================= */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!oldPassword || !newPassword) {
      setPasswordError("Please fill in both fields");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/profile/change-password/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setPasswordMessage(data.message);
        setOldPassword("");
        setNewPassword("");
      } else {
        setPasswordError(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Something went wrong");
    }
  };

  return (
    <div className="profile-wrapper">
      {/* ===== EDIT PROFILE ===== */}
      <div className="profile-card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleProfileUpdate}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />

          <input value={email} disabled />

          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input value={role} disabled />
          {profileMessage && <p className="success-message">{profileMessage}</p>}
          <button type="submit">Save Profile</button>
        </form>
      </div>

      {/* ===== CHANGE PASSWORD ===== */}
      <div className="profile-card">
        <h2>Change Password</h2>

        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {passwordMessage && <p className="success-message">{passwordMessage}</p>}
          {passwordError && <p className="error-message">{passwordError}</p>}
          
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};
export default EditProfile;