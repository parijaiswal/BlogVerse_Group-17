import React, { useState } from "react";
import "./auth.css";

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
    <div className="reset-page">
      <div className="reset-box">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="reset-btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
