import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import API_BASE from "../../config";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('subscription'); // 'subscription' or 'pdf'
  const [paymentData, setPaymentData] = useState(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [checkingSub, setCheckingSub] = useState(false);

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

  // Check for active subscription if buying a plan
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role")?.toLowerCase();
    
    if (paymentType === 'subscription' && userId && role === 'client') {
      setCheckingSub(true);
      fetch(`${API_BASE}/api/admin/client-subscription/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.Status?.toLowerCase() === "active") {
            setHasActiveSub(true);
            Swal.fire({
              title: "Active Subscription Found",
              text: `You already have an active ${data.SubName} subscription. You cannot purchase another one until it expires.`,
              icon: "info",
              confirmButtonText: "View My Subscription",
            }).then(() => {
              navigate("/client");
            });
          }
        })
        .catch(err => console.error("Error checking subscription:", err))
        .finally(() => setCheckingSub(false));
    }
  }, [paymentType, navigate]);

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
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write("<h2 style='font-family:sans-serif; text-align:center; margin-top:50px; color:#334155;'>Generating your PDF... Please wait.</h2>");
    }

    try {
      const response = await fetch(`${API_BASE}/api/blogs/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blog: blog }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        // Fallback: If popup was blocked (very common after Razorpay iframe), force a hard download
        const link = document.createElement('a');
        link.href = url;
        const filename = (blog.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog') + '.pdf';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      if (newWindow) newWindow.close();
      console.error("Error generating single blog PDF from backend:", error);
      toast.error("Failed to download PDF. Please try again.", {
        duration: 5000,
      });
    }
  };

  const handlePayment = async () => {
    if (!paymentData || hasActiveSub) return;

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
        toast.error("Failed to create order: " + data.msg);
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
            // Critical: Window.open MUST be called immediately before alert blocks thread
            if (paymentData.blog) {
              await generateBlogPDF(paymentData.blog);
            }
            toast.success("Payment Successful! Your PDF has been downloaded.", {
              duration: 6000,
            });
            // Navigate after a delay to ensure download starts
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } else {
            // Save subscription to database
            try {
              const userId = localStorage.getItem("userId");
              const subId = paymentData.plan?.SubId;
              
              if (!userId || !subId) {
                toast.error("Payment successful but could not save subscription. Please contact support.");
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
                toast.success("Subscription purchased successfully!", { duration: 5000 });
                navigate("/client");
              } else {
                toast("Payment successful! " + (saveData.message || "Subscription activated."));
                console.error("Save subscription response:", saveData);
                navigate("/client");
              }
            } catch (saveError) {
              console.error("Error saving subscription:", saveError);
              toast("Payment successful! Your subscription will be activated shortly.");
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
        toast.error(response.error.description);
        console.log("Payment Failed:", response.error);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!paymentData || checkingSub) {
    return (
      <div className="pdf-payment-container">
        <div className="left-box">
          <h2>{checkingSub ? "Checking subscription..." : "Loading..."}</h2>
        </div>
      </div>
    );
  }

  if (hasActiveSub) {
      return null; // The Swal alert will handle the redirect
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