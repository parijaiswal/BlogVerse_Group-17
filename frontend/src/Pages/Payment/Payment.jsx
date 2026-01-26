import React from "react";
import "./Payment.css";

const Payment = () => {
  return (
    <div className="pdf-payment-container">

      {/* Left Section */}
      <div className="left-box">
        <h2>PDF Payment</h2>

        <p className="member-note">
          Only members can download premium PDFs.
        </p>

        <div className="pdf-info">
          <p><b>PDF Title:</b> Advanced React Notes</p>
          <p><b>Price:</b> ₹200</p>
        </div>

        <h3>Select Payment Method</h3>

        <div className="payment-methods">
          <div className="pay-card">
            <img src="https://img.icons8.com/color/96/visa.png" alt="Card" />
            <p>Debit / Credit Card</p>
          </div>

          <div className="pay-card">
            <img src="https://img.icons8.com/color/96/google-pay.png" alt="UPI" />
            <p>UPI Payment</p>
          </div>
        </div>

        <button className="download-btn">
          Pay & Download PDF
        </button>
      </div>

      {/* Right Section */}
      <div className="right-box">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>PDF Price</span>
          <span>₹200</span>
        </div>

        <hr />

        <div className="summary-total">
          <span>Total</span>
          <span>₹200</span>
        </div>
      </div>

    </div>
  );
};
export default Payment;