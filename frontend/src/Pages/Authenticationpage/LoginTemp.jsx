import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Authentication.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // SAVE LOGIN INFO
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);

        // REDIRECT BASED ON ROLE
        const role = data.user.role.toLowerCase();
        if (role === "admin") {
          window.location.href = "/admin";
        } else if (role === "client") {
          window.location.href = "/client";
        }
        else if (role === "member") {
          window.location.href = "/member";
        }
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your account to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="text"
            placeholder="Enter email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
            placeholder="Enter password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-button">
            Log in
          </button>
        </form>

        <div className="auth-footer-text">
          <a href="/forgot-password" className="auth-link">
            Forgot Password?
          </a>

          <div className="signup-text">
            Don't have an Account?{" "}
            <a href="/register" className="auth-link">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
