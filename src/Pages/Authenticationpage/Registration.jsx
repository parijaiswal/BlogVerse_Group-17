import React, { useState } from "react";
import "./auth.css";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <div className="form-container">
      <h2>Registration Form</h2>

      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Username:</label>
          <input 
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select 
            name="gender" 
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>

        <div className="form-group">
          <label>Contact No:</label>
          <input 
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
          {errors.contact && <p className="error">{errors.contact}</p>}
        </div>

        <div className="form-group">
       <label>User Role:</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
      >
       <option value="">-- Select Role --</option>
       <option value="Member">Member</option>
        <option value="Client">Client</option>
      </select>
       {errors.role && <p className="error">{errors.role}</p>}
      </div>

        <div className="form-group">
          <label>Password:</label>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label>Re-Enter Password:</label>
          <input 
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}

export default Registration;
