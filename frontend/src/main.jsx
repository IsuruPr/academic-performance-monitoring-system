import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import SemesterSelect from "./pages/SemesterSelect";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudyTimerPage from "./pages/StudyTimerPage";
import AiChatPage from "./pages/AiChatPage";
import HomePage from "./pages/HomePage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import AnimatedBackground from "./components/AnimatedBackground";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AnimatedBackground />
      <Navbar />
      <div className="pt-24">
        <Routes>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/select-semester" element={<PageTransition><SemesterSelect /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/timer" element={<PageTransition><StudyTimerPage /></PageTransition>} />
            <Route path="/chat" element={<PageTransition><AiChatPage /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>
);