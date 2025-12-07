import React, { useState } from "react";
import "./Authentication.css";

function Registration() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    contact: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact)) {
      newErrors.contact = "Enter a valid 10-digit number";
    }

    if (!formData.role.trim()) {
      newErrors.role = "User role is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please re-enter password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Frontend validation
  if (!validate()) return;

  // 2. Send data to backend
  try {
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
        contact: formData.contact,
        role: formData.role,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful ✅");

      // 3. Clear the form after success
      setFormData({
        username: "",
        email: "",
        gender: "",
        contact: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      // later you can navigate to /login here
    } else {
      alert(data.message || "Something went wrong");
    }
  } catch (err) {
    console.error("Error while registering:", err);
    alert("Server error. Please try again later.");
  }
};

  return (
  <div className="auth-page">
    <div className="auth-card">
      <h2 className="auth-title">Create your Account</h2>
      {/* <p className="auth-subtitle">
        Register to like blogs, post comments and access PDF downloads.
      </p> */}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="auth-label">Username</label>
          <input
            type="text"
            name="username"
            className="auth-input"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">Email</label>
          <input
            type="email"
            name="email"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">Gender</label>
          <select
            name="gender"
            className="auth-input"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="error-text">{errors.gender}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">Contact No.</label>
          <input
            type="text"
            name="contact"
            className="auth-input"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter 10 digit mobile number"
          />
          {errors.contact && <p className="error-text">{errors.contact}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">User Role</label>
          <select
            name="role"
            className="auth-input"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">-- Select Role --</option>
            <option value="Member">Member</option>
            <option value="Client">Client</option>
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">Password</label>
          <input
            type="password"
            name="password"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label className="auth-label">Re-enter Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="auth-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <a href="/login" className="auth-link">
          Login here
        </a>
      </p>
    </div>
  </div>
);

}

export default Registration;
