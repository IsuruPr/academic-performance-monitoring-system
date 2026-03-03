import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import SemesterSelect from "./pages/SemesterSelect";
import Dashboard from "./pages/Dashboard";

import Navbar from "./components/Navbar";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <div className="pt-24">
        <Routes>
          <Route path="/" element={<Navigate to="/select-semester" replace />} />
          <Route path="/select-semester" element={<SemesterSelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);