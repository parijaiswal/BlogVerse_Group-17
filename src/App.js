import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from './Pages/Homepage/Home';
import Registration from './Pages/Authenticationpage/Registration';
import Login from './Pages/Authenticationpage/LoginTemp';
import ForgotPassword from "./Pages/Authenticationpage/ForgotPassword";
import ResetPassword from "./Pages/Authenticationpage/ResetPassword";

import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication Pages */}
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Reset password (token optional for now) */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
};

export default App;
