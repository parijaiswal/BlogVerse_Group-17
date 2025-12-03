import React from "react";
import "./auth.css";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-box">

        <h1>Log in</h1>

        <label>Username or Email</label>
        <input type="text" placeholder="Enter email" />
        <label>Password</label>
        <input type="password" placeholder="Enter password" />

        <button className="login-button">Log in</button>

        <div className="forgot-links">
          <span>
            <a href="/forgot-password">Forgot username or password?</a>
          </span>
          <div className="signup-link">
            Need an account? <a href="/register">Sign up</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
