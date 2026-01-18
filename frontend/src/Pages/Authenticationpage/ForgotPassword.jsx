import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Authentication.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    const loadingToast = toast.loading("Sending OTP...");

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("OTP Sent!");
        // Store email to use in VerifyOtp
        localStorage.setItem("resetEmail", email);
        navigate("/verify-otp");
      } else {
        toast.error(data.message || "Error sending OTP");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Forgot password error:", error);
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-body">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="auth-card">
        <h2 className="auth-title">Forgot your password?</h2>
        <p>No worries, enter your email to receive an OTP</p>

        <form onSubmit={handleSendOTP}>
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="auth-footer-text">
          Go back to the <Link to="/login" className="auth-link">Login</Link> page.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


