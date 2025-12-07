import React, { useState } from "react";
import "./Authentication.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    alert("Password reset successful!");
    window.location.href = "/login";
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password" className="auth-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password" className="auth-input"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
