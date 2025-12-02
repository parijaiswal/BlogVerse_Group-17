import React from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot your password?</h2>
        <p>No worries, we’ll send reset instructions.</p>

        <label>Email</label>
        <input type="email" placeholder="Enter your registered email" />

        <button className="reset-btn">Send Reset Link</button>

        <p className="back-text">
          Go back to the <Link to="/login">Login</Link> page.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
