import React from "react";
import { Link } from "react-router-dom";
import "./auth.css";

const ForgotPassword = () => {
  return (
    <div className="auth-page login-body">
      <div className="auth-card">
        <h2 className="auth-title">Forgot your password?</h2>
        <p>No worries you can change your password here</p>

        <label className="auth-label">Email</label>
        <input type="email" placeholder="Enter your registered email" className="auth-input" />

        <button className="auth-button">Send Reset Link</button>

        <p className="auth-footer-text">
          Go back to the <Link to="/login" className="auth-link">Login</Link> page.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
