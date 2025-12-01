import React from "react";
import "./login.css";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Log in</h1>

        <p>Need an account? <a href="/register">Create an account</a></p>

        <label>Username or Email</label>
        <input type="text" placeholder="Enter email" />

        <label>Password</label>
        <input type="password" placeholder="Enter password" />

        <button className="login-btn">Log in</button>

        <div className="links">
          <a href="#">Forgot username?</a>
          <a href="#">Forgot password?</a>
          <a href="#">Can’t log in?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
