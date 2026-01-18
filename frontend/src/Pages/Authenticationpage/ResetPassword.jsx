import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Authentication.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    const verifiedOtp = localStorage.getItem("verifiedOtp");

    if (storedEmail && verifiedOtp) {
      setEmail(storedEmail);
      setOtp(verifiedOtp);
    } else {
      toast.error("Invalid session. Redirecting to start.");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    const loadingToast = toast.loading("Reseting Password...");

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Password reset successful!");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("verifiedOtp");
        navigate("/login");
      } else {
        toast.error(data.message || "Error resetting password");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Reset password error:", error);
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-body">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <p>Enter your new password.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="auth-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


