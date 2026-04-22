/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import SemesterSelect from "./pages/SemesterSelect";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudyTimerPage from "./pages/StudyTimerPage";
import AiChatPage from "./pages/AiChatPage";
import HomePage from "./pages/HomePage";
import ForecastingPage from "./pages/ForecastingPage";
import WhatIfPage from "./pages/WhatIfPage";
import WarningsPage from "./pages/WarningsPage";
import RiskAnalyzerPage from "./pages/RiskAnalyzerPage";
import FinalAnalyzer from "./pages/FinalAnalyzer";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import AnimatedBackground from "./components/AnimatedBackground";

const AUTH_PATHS = ["/login", "/register", "/academic-setup"];

function AppShell() {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  return (
    <>
      <App />
      <AnimatedBackground />
      {!isAuthPage && <Navbar />}
      <div className={!isAuthPage ? "pt-24" : ""}>
        <Routes>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/select-semester" element={<PageTransition><SemesterSelect /></PageTransition>} />
          <Route path="/whatif" element={<PageTransition><WhatIfPage /></PageTransition>} />
          <Route path="/warnings" element={<PageTransition><WarningsPage /></PageTransition>} />
          <Route path="/forecasting" element={<PageTransition><ForecastingPage /></PageTransition>} />
          <Route path="/timer" element={<PageTransition><StudyTimerPage /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><AiChatPage /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/risk-analyzer" element={<PageTransition><RiskAnalyzerPage /></PageTransition>} />
          <Route path="/final-analyzer" element={<PageTransition><FinalAnalyzer /></PageTransition>} />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>,
)

