import React, { useState } from "react";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");       // we'll use email to login
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Login successful and data fetched from the users table");
        // You can redirect the user or perform other actions here
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-body auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Log in</h1>

        <form onSubmit={handleSubmit} >
          <label className="auth-label">Email</label>
          <input
            type="text"
            placeholder="Enter email" className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="auth-label">Password</label>
          <input
            type="password"
            placeholder="Enter password" className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Log in
          </button>
        </form>

        <div className="auth-footer-text">
          <span>
            <a href="/forgot-password" className="
            auth-link">Forgot Password?</a>
          </span>
          <div className="signup-text">
            Don't have an Account? <a href="/register" className="auth-link">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
