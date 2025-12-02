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
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
