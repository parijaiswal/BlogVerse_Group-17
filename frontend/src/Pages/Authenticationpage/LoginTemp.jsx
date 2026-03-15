import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Authentication.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter email and password");
      setIsError(true);
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
      console.log("LOGIN RESPONSE:", data);
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
        } else if (role === "member") {
          // Members go to home page
          window.location.href = "/";
        }
      } else {
        setMessage(data.message || "Invalid email or password");
        setIsError(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Server error. Please try again later.");
      setIsError(true);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your account to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && (
            <p className={isError ? "error-text" : "success-text"}>{message}</p>
          )}
          
          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="text"
              placeholder="Enter email"
              className="auth-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="auth-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage("");
              }}
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
