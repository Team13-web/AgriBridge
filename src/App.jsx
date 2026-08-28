import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Marketplace from "./pages/Marketplace";
import LandLeasing from "./pages/LandLeasing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Farmer from "./pages/farmer";
import Buyer from "./pages/buyer";
import Landowner from "./pages/landowner";
import Admin from "./pages/admin";

export default function App() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/features" element={<Features/>}/>
    <Route path="/marketplace" element={<Marketplace/>}/>
    <Route path="/land-leasing" element={<LandLeasing/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/contact" element={<Contact/>}/>
    <Route path="/auth" element={<Auth/>}/>
    <Route path="/farmer/*" element={<Farmer/>}/>
    <Route path="/buyer/*" element={<Buyer/>}/>
    <Route path="/landowner/*" element={<Landowner/>}/>
    <Route path="/admin/*" element={<Admin/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}