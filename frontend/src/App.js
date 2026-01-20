import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/Homepage/Home";
import Registration from "./Pages/Authenticationpage/Registration";
import Login from "./Pages/Authenticationpage/LoginTemp";
import ForgotPassword from "./Pages/Authenticationpage/ForgotPassword";
import VerifyOtp from "./Pages/Authenticationpage/VerifyOtp";
import ResetPassword from "./Pages/Authenticationpage/ResetPassword";
import Admin from "./Pages/AdminPage/Admin";
import Subscription from "./Pages/SubscriptionPage/Subscription";
import Member from "./Pages/MemberPage/Member";
import Client from "./Pages/ClientPage/Client";
import BlogDetails from "./Pages/Homepage/BlogDetails";

// Main App Layout with conditional Navbar
const AppLayout = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/member");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />
      
        {/* Dashboards */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/client" element={<Client />} />
        <Route path="/member" element={<Member />} />

        <Route path="/Subscription" element={<Subscription />} />

      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
     <Footer />
    </Router>
  );
};

export default App;
