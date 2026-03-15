import React, { useState } from "react";
import "./Contact.css";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import API_BASE from "../../config";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }
    
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setStatus("success");
      } else {
        setStatus("api-error");
        console.error(data.message);
      }
    } catch (error) {
      console.error("Network error submitting contact form:", error);
      setStatus("network-error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setStatus("");
      }, 5000);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have a question, feedback, or just want to say hi? We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-cards">
          <div className="info-card">
            <div className="icon-wrapper">
              <FaEnvelope size={24} />
            </div>
            <h3>Email Us</h3>
            <p>blogversewebsite@gmail.com</p>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-wrapper">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject Title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {status === "success" && (
                <div className="form-message success-message">
                  Thank you! Your message has been sent successfully. Check your email for a confirmation.
                </div>
              )}
              {status === "error" && (
                <div className="form-message error-message">
                  Please fill in all required fields.
                </div>
              )}
              {status === "api-error" && (
                <div className="form-message error-message">
                  Failed to send message. Please try again later.
                </div>
              )}
              {status === "network-error" && (
                <div className="form-message error-message">
                  Network error. Please check your connection and try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
