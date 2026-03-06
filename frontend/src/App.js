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

import MemberProfile from "./Pages/MemberPage/MemberProfile";
import Client from "./Pages/ClientPage/Client";
import BlogDetails from "./Pages/Homepage/BlogDetails";
import Payment from "./Pages/Payment/Payment";
import Contact from "./Pages/Homepage/Contact";

// Main App Layout with conditional Navbar
const AppLayout = () => {
  const location = useLocation();

  // Hide navbar on dashboards
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/member");

  // Hide footer on dashboards AND auth pages
  const hideFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/member") ||

    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/verify-otp" ||
    location.pathname === "/reset-password";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />


        {/* Dashboards */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/client" element={<Client />} />
        <Route path="/member" element={<MemberProfile />} />


        <Route path="/Subscription" element={<Subscription />} />

      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
