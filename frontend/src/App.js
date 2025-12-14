import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Pages/Homepage/Home';
import Registration from './Pages/Authenticationpage/Registration';
import Login from './Pages/Authenticationpage/LoginTemp';
import ForgotPassword from "./Pages/Authenticationpage/ForgotPassword";
import ResetPassword from "./Pages/Authenticationpage/ResetPassword";
import Navbar from "./Components/Navbar";

// ⭐ Import your Member Page
import Member from "./Pages/MemberPage/Member";
import Client from "./Pages/ClientPage/Client";

const App = () => {

  return (
    <Router>
      {<Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        //⭐ Member Page Route 
        <Route path="/member" element={<Member />} />

         // Client Page 
        <Route path="/client" element={<Client />} />


      </Routes>
    </Router>
  );
};
export default App;
