import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "./Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('subscription'); // 'subscription' or 'pdf'
  const [paymentData, setPaymentData] = useState(null);

  // Get data from location state
  useEffect(() => {
    const state = location.state;
    
    if (!state) {
      navigate("/subscription");
      return;
    }

    if (state.type === 'pdf') {
      setPaymentType('pdf');
      setPaymentData({
        amount: state.pdfPrice || 50,
        name: "PDF Download",
        description: state.blogTitle || "Blog PDF Download",
        blogId: state.blogId,
        blog: state.blog
      });
    } else {
      // Subscription payment
      setPaymentType('subscription');
      if (state.plan) {
        setPaymentData({
          amount: state.plan.SubPrice,
          name: state.plan.SubName,
          description: `${state.plan.SubDuration} Month Subscription`,
          plan: state.plan
        });
      }
    }
  }, [location.state, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Generate PDF for blog
  const generateBlogPDF = (blog) => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    doc.setFontSize(20);
    doc.text(blog.Title, 105, y, { align: "center" });
    y += 10;

    doc.setFontSize(11);
    doc.text(`Author: ${blog.Username || ""}`, 20, y);
    y += 6;
    doc.text(`Date: ${new Date(blog.Create_Date).toDateString()}`, 20, y);
    y += 10;

    doc.setFontSize(13);
    const contentLines = doc.splitTextToSize(blog.Content, 170);
    doc.text(contentLines, 20, y);

    doc.setFontSize(10);
    doc.text("Downloaded from BlogVerse", 105, 290, { align: "center" });

    doc.save(`${blog.Title}.pdf`);
  };

  const handlePayment = async () => {
    if (!paymentData) return;

    try {
      // Step 1: Create order on backend
      const response = await fetch("http://localhost:5000/api/razorpay/createorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          name: paymentData.name,
          description: paymentData.description,
          type: paymentType
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("Failed to create order: " + data.msg);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "BlogVerse",
        description: data.description,
        order_id: data.order_id,
        handler: async function (response) {
          // Payment successful
          if (paymentType === 'pdf') {
            alert("Payment Successful! Your PDF will download now.");
            // Download the PDF after successful payment
            if (paymentData.blog) {
              generateBlogPDF(paymentData.blog);
            }
            navigate("/");
          } else {
            // Save subscription to database
            try {
              const userId = localStorage.getItem("userId");
              const subId = paymentData.plan?.SubId;
              
              if (!userId || !subId) {
                alert("Payment successful but could not save subscription. Please contact support.");
                console.error("Missing userId or subId:", { userId, subId });
                navigate("/");
                return;
              }

              const saveResponse = await fetch("http://localhost:5000/api/razorpay/save-subscription", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId,
                  subId,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id
                }),
              });

              const saveData = await saveResponse.json();

              if (saveData.success) {
                alert("Subscription purchased successfully! You can now publish blogs.");
                navigate("/client");
              } else {
                alert("Payment successful! " + (saveData.message || "Subscription activated."));
                console.error("Save subscription response:", saveData);
                navigate("/client");
              }
            } catch (saveError) {
              console.error("Error saving subscription:", saveError);
              alert("Payment successful! Your subscription will be activated shortly.");
              navigate("/client");
            }
          }
        },
        prefill: {
          name: localStorage.getItem("username") || "",
          email: localStorage.getItem("email") || "",
          contact: "",
        },
        theme: {
          color: "#1976d2",
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout form closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        alert("Payment Failed: " + response.error.description);
        console.log("Payment Failed:", response.error);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!paymentData) {
    return (
      <div className="pdf-payment-container">
        <div className="left-box">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-payment-container">
      {/* Left Section */}
      <div className="left-box">
        <h2>{paymentType === 'pdf' ? 'Pay for PDF Download' : 'Complete Your Purchase'}</h2>

        {paymentType === 'pdf' && (
          <p className="member-note">
            You have used your 2 free downloads. Pay ₹29 to download this PDF.
          </p>
        )}

        <div className="pdf-info">
          {paymentType === 'pdf' ? (
            <>
              <p><b>PDF:</b> {paymentData.description}</p>
              <p><b>Price:</b> ₹{paymentData.amount}</p>
            </>
          ) : (
            <>
              <p><b>Plan:</b> {paymentData.name}</p>
              <p><b>Duration:</b> {paymentData.description}</p>
              <p><b>Price:</b> ₹{paymentData.amount}</p>
            </>
          )}
        </div>

        <h3>Secure Payment via Razorpay</h3>



        <button className="download-btn" onClick={handlePayment}>
          Pay ₹{paymentData.amount}
        </button>

        <button 
          className="download-btn" 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: "#666", marginTop: "10px" }}
        >
          Go Back
        </button>
      </div>

      {/* Right Section */}
      <div className="right-box">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>{paymentType === 'pdf' ? 'PDF Download' : paymentData.name}</span>
          <span>₹{paymentData.amount}</span>
        </div>

        <hr />

        <div className="summary-total">
          <span>Total</span>
          <span>₹{paymentData.amount}</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;