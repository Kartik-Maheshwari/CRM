import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import CampaignList from "./components/CampaignList";
import CampaignForm from "./components/CampaignForm";
import CustomerList from "./components/CustomerList";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="container mx-auto">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/create-campaign" element={<CampaignForm />} />
          <Route path="/" exact element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
