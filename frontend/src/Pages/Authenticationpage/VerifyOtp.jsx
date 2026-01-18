import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Authentication.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("Session expired. Please request OTP again.");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");

    setLoading(true);
    const loadingToast = toast.loading("Verifying OTP...");

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("OTP Verified!");
        // Store verified OTP in local storage to pass to next step 
        // (normally you'd use a token, but for simplicity we trust the client state flow here as requested)
        localStorage.setItem("verifiedOtp", otp); 
        navigate("/reset-password");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Verify OTP error:", error);
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-body">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="auth-card">
        <h2 className="auth-title">Verify OTP</h2>
        <p>Enter the 6-digit OTP sent to {email}</p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            className="auth-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
