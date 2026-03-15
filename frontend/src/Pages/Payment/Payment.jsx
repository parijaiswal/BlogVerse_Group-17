import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import API_BASE from "../../config";

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
  // Request PDF from backend Puppeteer endpoint
  const generateBlogPDF = async (blog) => {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blog: blog }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();

      // Create a temporary URL for the received PDF blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = (blog.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog') + '.pdf';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating single blog PDF from backend:", error);
      alert("Failed to download PDF. Please try again from the blog page.");
    }
  };

  const handlePayment = async () => {
    if (!paymentData) return;

    try {
      // Step 1: Create order on backend
      const response = await fetch(`${API_BASE}/api/razorpay/createorder`, {
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

              const saveResponse = await fetch(`${API_BASE}/api/razorpay/save-subscription`, {
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