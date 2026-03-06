import React, { useState } from "react";
import "./Contact.css";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }
    
    // Construct mailto link
    const mailtoLink = `mailto:blogversewebsite@gmail.com?subject=${encodeURIComponent(formData.subject || 'New Contact Query')}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    // Open default mail client
    window.location.href = mailtoLink;
    
    // Clear form
    setFormData({ name: "", email: "", subject: "", message: "" });
    setStatus("success");
    
    setTimeout(() => {
      setStatus("");
    }, 4000);
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

              <button type="submit" className="submit-btn">
                Send Message
              </button>

              {status === "success" && (
                <div className="form-message success-message">
                  Thank you! Your email client should now open to send the message.
                </div>
              )}
              {status === "error" && (
                <div className="form-message error-message">
                  Please fill in all required fields.
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
