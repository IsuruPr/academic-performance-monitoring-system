import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthCard from "./components/AuthCard";
import IntroForm from "./components/IntroForm";
import Dashboard from "./components/Dashboard";
import GPACalculator from "./components/GPACalculator";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthCard />} />
        <Route path="/onboarding" element={<ProtectedRoute />}>
          <Route index element={<IntroForm />} />
        </Route>

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gpa" element={<GPACalculator />} />
            <Route index element={<Navigate to="/app/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}