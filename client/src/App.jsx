import AcademicSetup from "./pages/AcademicSetup";
import AiChatPage from "./pages/AiChatPage";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "./api";
import logo from "./assets/logo3.png";
import { buildDefaultSemesters, gradeOptions, yearWeights } from "./data/template";
import { calculateMetrics } from "./utils/gpa";
import {
  buildAcademicWarnings,
  calculateTargetCgpa,
  calculateTargetGap,
  getClassTone,
  getDegreeClassification,
} from "./utils/insights";
import {
  buildStudyTips,
  defaultHabits,
  generateCoachReply,
  getTodayEvents,
  getUpcomingEvents,
} from "./utils/coach";

const tokenStorageKey = "gpa_token";
const userStorageKey = "gpa_user";

const blankRegister = {
  name: "",
  email: "",
  university: "",
  degreeProgram: "",
  password: "",
  confirmPassword: "",
};

const universityData = {
  "SLIIT": ["BSc (Hons) in Information Technology", "BSc (Hons) in Computer Science", "BSc (Hons) in Software Engineering", "BSc (Hons) in Data Science", "BSc (Hons) in Cyber Security", "BBA (Hons)", "BSc Eng (Hons)"],
  "NSBM Green University": ["BSc (Hons) Software Engineering", "BSc (Hons) Computer Networks", "BSc (Hons) Management", "BSc (Hons) Accounting", "BSc (Hons) Nursing"],
  "University of Colombo": ["BSc in Computer Science", "BSc in Information Systems", "MBBS", "LLB", "BSc in Management", "BSc in Physical Science"],
  "University of Moratuwa": ["BSc Engineering (Hons)", "BSc in Information Technology", "BDes", "BSc in Quantity Surveying", "BSc in Town & Country Planning"],
  "University of Kelaniya": ["BSc in Computer Science", "BSc in Software Engineering", "BBM", "BA", "MBBS", "BSc in Physical Science"],
  "University of Sri Jayewardenepura": ["BSc in Management", "BSc in Accounting", "BSc in Computer Science", "MBBS", "BSc in Physical Science"],
  "University of Peradeniya": ["BSc Engineering (Hons)", "BSc in Physical Science", "MBBS", "BDS", "BA", "BSc in Agriculture"],
  "University of Ruhuna": ["BSc Engineering", "BSc in Physical Science", "MBBS", "BA", "BSc in Agriculture"],
  "University of Jaffna": ["BSc Engineering", "BSc in Physical Science", "MBBS", "BA", "BSc in Agriculture"],
  "Rajarata University": ["BSc in Information Technology", "BSc in Physical Science", "MBBS", "BSc in Agriculture"],
  "Wayamba University": ["BSc in Food Science", "BSc in Applied Sciences", "BSc in Agribusiness", "BSc in Computing"],
  "Sabaragamuwa University": ["BSc in Computing", "BSc in Geomatics", "BSc in Applied Sciences", "BA", "BSc in Agriculture"],
  "Uva Wellassa University": ["BSc in Computer Science", "BSc in Mineral Resources", "BSc in Export Agriculture"],
  "Eastern University": ["BSc in Physical Science", "MBBS", "BA", "BSc in Agriculture"],
  "South Eastern University": ["BSc in Physical Science", "BSc in Information Technology", "BA", "BBA"],
  "CINEC Campus": ["BSc (Hons) Software Engineering", "BSc (Hons) IT", "BSc (Hons) Logistics", "BSc (Hons) Engineering"],
  "KDU (Kotelawala Defence University)": ["BSc (Hons) in Software Engineering", "BSc Engineering", "LLB", "BSc in Logistics"],
  "IIT (Informatics Institute of Technology)": ["BSc (Hons) Software Engineering", "BSc (Hons) Computer Science", "BSc (Hons) Business Information Systems"],
  "APIIT": ["BSc (Hons) Computing", "BSc (Hons) Software Engineering", "LLB", "BA (Hons) Business"],
  "NIBM": ["BSc (Hons) Computing", "BSc (Hons) Software Engineering", "BSc (Hons) Data Science", "BSc (Hons) Management"],
  "ICBT": ["BSc (Hons) Software Engineering", "BSc (Hons) IT", "BSc (Hons) Data Science", "BBA (Hons)"],
  "SLTC": ["BSc (Hons) Engineering", "BSc (Hons) Software Engineering", "BSc (Hons) IT", "BSc (Hons) Management"],
  "Horizon Campus": ["BSc (Hons) in IT", "BSc (Hons) Business Management", "BSc (Hons) Education", "BSc (Hons) Psychology"],
};
const universityList = Object.keys(universityData);
const defaultDegrees = ["BSc (Hons) in Software Engineering", "BSc (Hons) in Information Technology", "BSc (Hons) in Computer Science", "BSc Engineering (Hons)", "BBA (Hons)", "BSc (Hons) Management"];


const blankLogin = {
  email: "",
  password: "",
};

const defaultAssessmentPlanner = {
  moduleName: "ABC",
  targetOverallMark: 80,
  assessments: [
    { id: 1, name: "Assignment", weight: 20, mark: 0, completed: false },
    { id: 2, name: "Quiz", weight: 10, mark: 0, completed: false },
    { id: 3, name: "Presentation", weight: 10, mark: 0, completed: false },
    { id: 4, name: "Mid Exam", weight: 20, mark: 0, completed: false },
    { id: 5, name: "Final Exam", weight: 40, mark: 0, completed: false },
  ],
};

const dashboardTabs = [
  { id: "forecasting", label: "Assessment-Level Forecasting" },
  { id: "whatif", label: "What-If Analysis & Class Predictor" },
  { id: "warnings", label: "Academic Warning & Improvement" },
  { id: "analytics", label: "Visual Analytics & PDF Reports" },
];

const buildSavedWhatIfPlans = (plans, currentPlan) => {
  if (!currentPlan.moduleName.trim()) {
    return plans;
  }

  const savedPlan = {
    ...currentPlan,
    id: currentPlan.id || `whatif-${Date.now()}`,
    moduleName: currentPlan.moduleName.trim(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = plans.findIndex(
    (plan) => plan.moduleName.trim().toLowerCase() === savedPlan.moduleName.toLowerCase(),
  );

  if (existingIndex === -1) {
    return [...plans, savedPlan];
  }

  return plans.map((plan, index) => (index === existingIndex ? savedPlan : plan));
};

function AuthLayout({ children, mode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "stretch",
      background: "rgba(8, 8, 8, 0.55)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
        animation: "authBlob1 8s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
        animation: "authBlob2 10s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
        backgroundSize: "40px 40px",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Left branding panel */}
      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        position: "relative",
        zIndex: 1,
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }} className="auth-left-panel">
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          <img
            src={logo}
            alt="AcadamiX"
            style={{
              height: "72px",
              width: "auto",
              objectFit: "contain",
              marginBottom: "28px",
              filter: "drop-shadow(0 0 24px rgba(34,197,94,0.3))",
            }}
          />
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "100px",
            border: "1px solid rgba(34,197,94,0.25)",
            background: "rgba(34,197,94,0.06)",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.8)",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              AcadamiX
            </span>
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "16px",
            letterSpacing: "-0.03em",
          }}>
            {mode === "login" ? "Welcome\nBack." : "Start Your\nJourney."}
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 500 }}>
            {mode === "login"
              ? "Track your GPA, forecast your future, and master academic success with AI-powered insights."
              : "Join thousands of SLIIT students maximizing their academic potential with intelligent tracking."}
          </p>

          {/* Feature pills */}
          <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
            {["AI-Powered GPA Forecasting", "Real-time Academic Insights", "Smart Study Habit Tracker"].map((feat, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.12)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "#22c55e", flexShrink: 0 }}>
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "48px 40px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes authBlob1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, 30px) scale(1.1); } }
        @keyframes authBlob2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px, -20px) scale(1.08); } }
        .auth-left-panel { display: flex; }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
        .auth-input {
          width: 100%; box-sizing: border-box;
          padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          margin-top: 6px;
        }
        .auth-input:focus {
          border-color: rgba(34,197,94,0.6);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
          background: rgba(34,197,94,0.04);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.3); }
        .auth-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.02em;
        }
        .auth-primary-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 12px;
          color: #000;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
          box-shadow: 0 8px 24px rgba(34,197,94,0.3);
        }
        .auth-primary-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(34,197,94,0.4); }
        .auth-primary-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-ghost-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        .auth-ghost-btn:hover { border-color: rgba(34,197,94,0.4); color: #22c55e; background: rgba(34,197,94,0.05); }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: rgba(255,255,255,0.2);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
      `}</style>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(blankLogin);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    return errs;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      onLogin(data);
      setTimeout(() => {
        const dest = localStorage.getItem("selectedSemesterId") ? "/" : "/academic-setup";
        navigate(dest);
      }, 0);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...{},
    borderColor: fieldErrors[field] ? "rgba(239,68,68,0.6)" : undefined,
    boxShadow: fieldErrors[field] ? "0 0 0 2px rgba(239,68,68,0.15)" : undefined,
  });

  return (
    <AuthLayout mode="login">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
          Sign in
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0, fontWeight: 500 }}>
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label className="auth-label">Email address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@sliit.lk"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }}
            style={inputStyle("email")}
          />
          {fieldErrors.email && <p style={{ margin: "5px 0 0 2px", fontSize: "12px", color: "#f87171", fontWeight: 600 }}>{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors(p => ({ ...p, password: "" })); }}
            style={inputStyle("password")}
          />
          {fieldErrors.password && <p style={{ margin: "5px 0 0 2px", fontSize: "12px", color: "#f87171", fontWeight: 600 }}>{fieldErrors.password}</p>}
        </div>

        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#f87171", fontSize: "13px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <button className="auth-primary-btn" type="submit" disabled={loading} style={{ marginTop: "4px" }}>
          {loading ? "Signing in…" : "Sign in →"}
        </button>

        <div className="auth-divider">or</div>

        <button className="auth-ghost-btn" type="button" onClick={() => navigate("/register")}>
          Create a new account
        </button>
      </form>
    </AuthLayout>
  );
}

function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(blankRegister);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setFieldErrors(p => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!form.university.trim()) {
      errs.university = "University is required.";
    }

    if (!form.degreeProgram.trim()) {
      errs.degreeProgram = "Degree program is required.";
    }

    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      errs.password = "Password must contain letters and numbers.";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      onLogin(data);
      setTimeout(() => navigate("/academic-setup"), 0);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => fieldErrors[field]
    ? { borderColor: "rgba(239,68,68,0.6)", boxShadow: "0 0 0 2px rgba(239,68,68,0.15)" }
    : {};

  const FieldError = ({ field }) => fieldErrors[field]
    ? <p style={{ margin: "5px 0 0 2px", fontSize: "12px", color: "#f87171", fontWeight: 600 }}>{fieldErrors[field]}</p>
    : null;

  return (
    <AuthLayout mode="register">
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
          Create account
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0, fontWeight: 500 }}>
          Join AcadamiX and unlock your academic potential
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label className="auth-label">Full name</label>
            <input className="auth-input" type="text" placeholder="Your name"
              value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle("name")} />
            <FieldError field="name" />
          </div>
          <div>
            <label className="auth-label">Email address</label>
            <input className="auth-input" type="email" placeholder="you@email.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle("email")} />
            <FieldError field="email" />
          </div>
        </div>

        <div>
          <label className="auth-label">University / Campus</label>
          <input className="auth-input" list="universities-list" placeholder="Search or type university"
            value={form.university}
            onChange={(e) => { set("university", e.target.value); setForm(p => ({ ...p, degreeProgram: "" })); }}
            style={inputStyle("university")} />
          <datalist id="universities-list">
            {universityList.map(uni => <option key={uni} value={uni} />)}
          </datalist>
          <FieldError field="university" />
        </div>

        <div>
          <label className="auth-label">Degree Program</label>
          <input className="auth-input" list="degrees-list" placeholder="Search or type degree program"
            value={form.degreeProgram} onChange={(e) => set("degreeProgram", e.target.value)}
            style={inputStyle("degreeProgram")} />
          <datalist id="degrees-list">
            {(universityData[form.university] || defaultDegrees).map(deg => <option key={deg} value={deg} />)}
          </datalist>
          <FieldError field="degreeProgram" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="Min. 6 chars"
              value={form.password} onChange={(e) => set("password", e.target.value)}
              style={inputStyle("password")} />
            <FieldError field="password" />
          </div>
          <div>
            <label className="auth-label">Confirm</label>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
              style={inputStyle("confirmPassword")} />
            <FieldError field="confirmPassword" />
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#f87171", fontSize: "13px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <button className="auth-primary-btn" type="submit" disabled={loading} style={{ marginTop: "4px" }}>
          {loading ? "Creating account…" : "Create account →"}
        </button>

        <div className="auth-divider">or</div>

        <button className="auth-ghost-btn" type="button" onClick={() => navigate("/login")}>
          Already have an account? Sign in
        </button>
      </form>
    </AuthLayout>
  );
}


function ModuleRow({ module, onChange, onRemove }) {
  return (
    <div className="module-row">
      <input
        type="text"
        placeholder="Module code"
        value={module.code}
        onChange={(event) => onChange("code", event.target.value)}
      />
      <input
        type="text"
        placeholder="Module name"
        value={module.name}
        onChange={(event) => onChange("name", event.target.value)}
      />
      <input
        type="number"
        min="0"
        placeholder="Credits"
        value={module.credits}
        onChange={(event) => onChange("credits", event.target.value)}
      />
      <select value={module.grade} onChange={(event) => onChange("grade", event.target.value)}>
        <option value="">Select grade</option>
        {gradeOptions.map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
      <button className="danger-button" type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "forecasting");
  const [faculty, setFaculty] = useState("Faculty of Computing");
  const [program, setProgram] = useState("BSc (Hons) in Information Technology - Information Technology");
  const [semesters, setSemesters] = useState(buildDefaultSemesters());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [forecastConfig, setForecastConfig] = useState({
    targetCgpa: 3.5,
    remainingCredits: 24,
    expectedGrade: "A-",
  });
  const [whatIfConfig, setWhatIfConfig] = useState({
    id: "",
    moduleName: defaultAssessmentPlanner.moduleName,
    targetOverallMark: defaultAssessmentPlanner.targetOverallMark,
    assessments: defaultAssessmentPlanner.assessments,
  });
  const [whatIfPlans, setWhatIfPlans] = useState([]);
  const [habits, setHabits] = useState(defaultHabits);
  const [events, setEvents] = useState([]);
  const [habitForm, setHabitForm] = useState({
    title: "",
    moduleName: "",
    category: "Revision",
    targetMinutes: 30,
    preferredTime: "19:00",
  });
  const [eventForm, setEventForm] = useState({
    title: "Final Exam",
    moduleName: "",
    date: "",
    type: "Exam",
  });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: "coach-welcome",
      role: "assistant",
      text: "Ask me how to improve this semester, what your next exam is, or what study habit to do today.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setFaculty(data.faculty || "Faculty of Computing");
        setProgram(data.program || "BSc (Hons) in Information Technology - Information Technology");
        setSemesters(data.semesters?.length ? data.semesters : buildDefaultSemesters());
        setHabits(
          data.supportTools?.habits?.length
            ? data.supportTools.habits.map((habit) => ({
                category: "Revision",
                targetMinutes: 30,
                preferredTime: "",
                moduleName: "",
                ...habit,
              }))
            : defaultHabits,
        );
        setEvents(data.supportTools?.events?.length ? data.supportTools.events : []);
        setWhatIfPlans(data.supportTools?.whatIfPlans?.length ? data.supportTools.whatIfPlans : []);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          onLogout();
          navigate("/login");
          return;
        }
        setError("Could not load saved GPA data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, onLogout]);

  const metrics = useMemo(() => calculateMetrics(semesters), [semesters]);
  const classification = useMemo(
    () => getDegreeClassification(metrics.wgpa, metrics.cgpa),
    [metrics.cgpa, metrics.wgpa],
  );
  const warnings = useMemo(() => buildAcademicWarnings(metrics), [metrics]);
  const studyTips = useMemo(() => buildStudyTips(metrics, warnings, habits, events), [events, habits, metrics, warnings]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const todayEvents = useMemo(() => getTodayEvents(events), [events]);

  const yearAverages = useMemo(() => {
    return Object.keys(yearWeights).map((yearKey) => {
      const year = Number(yearKey);
      const yearSemesters = metrics.semesters.filter((semester) => semester.year === year);
      const totalCredits = yearSemesters.reduce((sum, semester) => sum + semester.semesterCredits, 0);
      const weightedGpa = yearSemesters.reduce(
        (sum, semester) => sum + semester.semesterGpa * semester.semesterCredits,
        0,
      );

      return {
        year,
        credits: totalCredits,
        average: totalCredits > 0 ? weightedGpa / totalCredits : 0,
      };
    });
  }, [metrics.semesters]);

  const analyticsProjection = useMemo(() => {
    const completedSemesters = metrics.semesters.filter((semester) => semester.semesterCredits > 0);
    const lastSemester = completedSemesters.at(-1);
    const previousSemester = completedSemesters.at(-2);
    const recentAverage =
      completedSemesters.length > 0
        ? completedSemesters.reduce((sum, semester) => sum + semester.semesterGpa, 0) / completedSemesters.length
        : 0;
    const trendBoost =
      lastSemester && previousSemester ? (lastSemester.semesterGpa - previousSemester.semesterGpa) * 0.35 : 0;
    const predictedNextSemesterGpa = Math.max(0, Math.min(4, recentAverage + trendBoost));
    const nextSemesterCredits = lastSemester?.semesterCredits || 20;
    const projectedCgpa = metrics.totalCredits
      ? ((metrics.cgpa * metrics.totalCredits) + predictedNextSemesterGpa * nextSemesterCredits) /
        (metrics.totalCredits + nextSemesterCredits)
      : predictedNextSemesterGpa;

    return {
      predictedNextSemesterGpa,
      nextSemesterCredits,
      projectedCgpa,
      predictedMark: predictedNextSemesterGpa * 25,
      recentAverage,
    };
  }, [metrics.cgpa, metrics.semesters, metrics.totalCredits]);

  const gradeDistribution = useMemo(() => {
    const buckets = {
      "A Range": 0,
      "B Range": 0,
      "C Range": 0,
      "D / E Range": 0,
    };

    metrics.semesters.forEach((semester) => {
      semester.modules.forEach((module) => {
        if (!module.grade) {
          return;
        }

        if (["A+", "A", "A-"].includes(module.grade)) {
          buckets["A Range"] += 1;
        } else if (["B+", "B", "B-"].includes(module.grade)) {
          buckets["B Range"] += 1;
        } else if (["C+", "C", "C-"].includes(module.grade)) {
          buckets["C Range"] += 1;
        } else {
          buckets["D / E Range"] += 1;
        }
      });
    });

    const total = Object.values(buckets).reduce((sum, count) => sum + count, 0) || 1;

    return Object.entries(buckets).map(([label, count]) => ({
      label,
      count,
      percentage: (count / total) * 100,
    }));
  }, [metrics.semesters]);

  const creditByYear = useMemo(() => {
    return Object.keys(yearWeights).map((yearKey) => {
      const year = Number(yearKey);
      const yearSemesters = metrics.semesters.filter((semester) => semester.year === year);
      const credits = yearSemesters.reduce((sum, semester) => sum + semester.semesterCredits, 0);

      return {
        year,
        credits,
        percentage: Math.min(100, (credits / 40) * 100),
      };
    });
  }, [metrics.semesters]);

  const analyticsNotes = useMemo(() => {
    const notes = [];

    if (analyticsProjection.predictedNextSemesterGpa >= 3.3) {
      notes.push("Your trend suggests a strong next semester if current performance consistency is maintained.");
    } else if (analyticsProjection.predictedNextSemesterGpa >= 2.5) {
      notes.push("Your projection is stable, but stronger performance in key modules is needed for upper-class improvement.");
    } else {
      notes.push("The current trend predicts a weak next semester. Early intervention is recommended before exams start.");
    }

    const strongestBucket = gradeDistribution.reduce(
      (best, bucket) => (bucket.count > best.count ? bucket : best),
      gradeDistribution[0],
    );
    notes.push(`Most completed modules are currently in the ${strongestBucket.label}.`);

    const weakestYear = creditByYear.reduce(
      (lowest, yearItem) => (yearItem.credits < lowest.credits ? yearItem : lowest),
      creditByYear[0],
    );
    notes.push(`Year ${weakestYear.year} has the lowest completed-credit progress in the current analytics view.`);

    return notes;
  }, [analyticsProjection.predictedNextSemesterGpa, creditByYear, gradeDistribution]);

  const forecastingResult = useMemo(() => {
    const projectedCgpa = calculateTargetCgpa(
      metrics.totalCredits,
      metrics.cgpa,
      Number(forecastConfig.remainingCredits) || 0,
      forecastConfig.expectedGrade,
    );

    return {
      projectedCgpa,
      gap: calculateTargetGap(projectedCgpa, Number(forecastConfig.targetCgpa) || 0),
    };
  }, [forecastConfig.expectedGrade, forecastConfig.remainingCredits, forecastConfig.targetCgpa, metrics.cgpa, metrics.totalCredits]);

  const whatIfResult = useMemo(() => {
    const currentWeightedScore = whatIfConfig.assessments.reduce((sum, assessment) => {
      if (!assessment.completed) {
        return sum;
      }

      return sum + ((Number(assessment.weight) || 0) * (Number(assessment.mark) || 0)) / 100;
    }, 0);

    const remainingWeight = whatIfConfig.assessments.reduce(
      (sum, assessment) => sum + (assessment.completed ? 0 : Number(assessment.weight) || 0),
      0,
    );
    const totalWeight = whatIfConfig.assessments.reduce((sum, assessment) => sum + (Number(assessment.weight) || 0), 0);
    const targetOverallMark = Number(whatIfConfig.targetOverallMark) || 0;
    const requiredAverage =
      remainingWeight > 0 ? ((targetOverallMark - currentWeightedScore) / remainingWeight) * 100 : 0;
    const isImpossible = remainingWeight > 0 && requiredAverage > 100;
    const alreadyReached = targetOverallMark <= currentWeightedScore;
    const finalProjection = remainingWeight > 0 ? targetOverallMark : currentWeightedScore;
    let predictedGrade = "N/A";

    if (finalProjection >= 90) {
      predictedGrade = "A+";
    } else if (finalProjection >= 80) {
      predictedGrade = "A";
    } else if (finalProjection >= 75) {
      predictedGrade = "A-";
    } else if (finalProjection >= 70) {
      predictedGrade = "B+";
    } else if (finalProjection >= 65) {
      predictedGrade = "B";
    } else if (finalProjection >= 60) {
      predictedGrade = "B-";
    } else if (finalProjection >= 55) {
      predictedGrade = "C+";
    } else if (finalProjection >= 45) {
      predictedGrade = "C";
    } else if (finalProjection >= 40) {
      predictedGrade = "C-";
    } else if (finalProjection >= 35) {
      predictedGrade = "D+";
    } else if (finalProjection >= 30) {
      predictedGrade = "D";
    } else {
      predictedGrade = "E";
    }

    return {
      currentWeightedScore,
      remainingWeight,
      requiredAverage,
      totalWeight,
      predictedGrade,
      isImpossible,
      alreadyReached,
      nextAssessment:
        whatIfConfig.assessments.find((assessment) => !assessment.completed) || null,
    };
  }, [whatIfConfig.assessments, whatIfConfig.targetOverallMark]);

  const whatIfVisuals = useMemo(() => {
    const target = Number(whatIfConfig.targetOverallMark) || 0;

    return whatIfConfig.assessments.map((assessment) => {
      const weight = Number(assessment.weight) || 0;
      const actualMark = assessment.completed ? Number(assessment.mark) || 0 : 0;
      const neededMark = assessment.completed ? actualMark : Math.max(0, Math.min(100, whatIfResult.requiredAverage));

      return {
        ...assessment,
        weight,
        actualMark,
        neededMark,
        target,
        weightedContribution: (weight * actualMark) / 100,
      };
    });
  }, [whatIfConfig.assessments, whatIfConfig.targetOverallMark, whatIfResult.requiredAverage]);

  const updateSemester = (semesterIndex, moduleIndex, field, value) => {
    setSemesters((current) =>
      current.map((semester, currentSemesterIndex) => {
        if (currentSemesterIndex !== semesterIndex) {
          return semester;
        }

        return {
          ...semester,
          modules: semester.modules.map((module, currentModuleIndex) => {
            if (currentModuleIndex !== moduleIndex) {
              return module;
            }

            return {
              ...module,
              [field]: field === "credits" ? Number(value) || 0 : value,
            };
          }),
        };
      }),
    );
  };

  const addModule = (semesterIndex) => {
    setSemesters((current) =>
      current.map((semester, index) =>
        index === semesterIndex
          ? {
              ...semester,
              modules: [...semester.modules, { code: "", name: "", credits: 0, grade: "" }],
            }
          : semester,
      ),
    );
  };

  const removeModule = (semesterIndex, moduleIndex) => {
    setSemesters((current) =>
      current.map((semester, index) =>
        index === semesterIndex
          ? {
              ...semester,
              modules: semester.modules.filter((_, currentModuleIndex) => currentModuleIndex !== moduleIndex),
            }
          : semester,
      ),
    );
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.put("/profile", {
        faculty,
        program,
        semesters: metrics.semesters,
        totalCredits: metrics.totalCredits,
        cgpa: metrics.cgpa,
        wgpa: metrics.wgpa,
        supportTools: {
          habits,
          events,
          whatIfPlans: buildSavedWhatIfPlans(whatIfPlans, whatIfConfig),
        },
      });
      setMessage("Student GPA data saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save GPA data.");
    } finally {
      setSaving(false);
    }
  };

  const persistProfile = async (nextWhatIfPlans) => {
    await api.put("/profile", {
      faculty,
      program,
      semesters: metrics.semesters,
      totalCredits: metrics.totalCredits,
      cgpa: metrics.cgpa,
      wgpa: metrics.wgpa,
      supportTools: {
        habits,
        events,
        whatIfPlans: nextWhatIfPlans,
      },
    });
  };

  const resetTemplate = () => {
    setSemesters(buildDefaultSemesters());
    setMessage("");
    setError("");
  };

  const handlePrintReport = () => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 18;

    const addSectionTitle = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 86, 216);
      doc.text(title, 14, cursorY);
      cursorY += 7;
    };

    const ensureSpace = (extra = 20) => {
      if (cursorY + extra > 280) {
        doc.addPage();
        cursorY = 18;
      }
    };

    doc.setFillColor(30, 86, 216);
    doc.roundedRect(12, 10, pageWidth - 24, 26, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(255, 255, 255);
    doc.text("SLIIT GPA Student Report", 18, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on ${generatedAt}`, 18, 29);
    cursorY = 46;

    addSectionTitle("Student Details");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(23, 48, 88);
    const details = [
      `Name: ${user.name}`,
      `Student ID: ${user.studentId}`,
      `Email: ${user.email}`,
      `Faculty: ${faculty}`,
      `Degree Program: ${program}`,
    ];
    details.forEach((line) => {
      const split = doc.splitTextToSize(line, pageWidth - 28);
      doc.text(split, 14, cursorY);
      cursorY += split.length * 5.5;
    });
    cursorY += 2;

    addSectionTitle("Academic Summary");
    autoTable(doc, {
      startY: cursorY,
      theme: "grid",
      headStyles: { fillColor: [30, 86, 216] },
      styles: { fontSize: 10, textColor: [23, 48, 88] },
      body: [
        ["Current CGPA", metrics.cgpa.toFixed(2)],
        ["Current WGPA", metrics.wgpa.toFixed(2)],
        ["Total Credits", String(metrics.totalCredits)],
        ["Current Class Prediction", classification],
        ["Predicted Next Semester GPA", analyticsProjection.predictedNextSemesterGpa.toFixed(2)],
        ["Projected CGPA After Next Semester", analyticsProjection.projectedCgpa.toFixed(2)],
      ],
    });
    cursorY = doc.lastAutoTable.finalY + 10;

    ensureSpace(40);
    addSectionTitle("Warnings and Study Tips");
    const warningLines = warnings.map((warning) => `${warning.title}: ${warning.detail}`);
    const tipLines = studyTips.map((tip) => `- ${tip}`);
    [...warningLines, ...tipLines].forEach((line) => {
      const split = doc.splitTextToSize(line, pageWidth - 28);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 76, 110);
      doc.text(split, 14, cursorY);
      cursorY += split.length * 5.2;
      ensureSpace(16);
    });
    cursorY += 3;

    ensureSpace(30);
    addSectionTitle("Upcoming Events");
    const eventRows =
      upcomingEvents.length > 0
        ? upcomingEvents.slice(0, 8).map((eventItem) => [
            eventItem.title,
            eventItem.moduleName || "General",
            eventItem.type,
            eventItem.date,
          ])
        : [["No upcoming events", "-", "-", "-"]];
    autoTable(doc, {
      startY: cursorY,
      theme: "striped",
      head: [["Event", "Module", "Type", "Date"]],
      body: eventRows,
      headStyles: { fillColor: [243, 154, 47] },
      styles: { fontSize: 10, textColor: [23, 48, 88] },
    });
    cursorY = doc.lastAutoTable.finalY + 10;

    ensureSpace(30);
    addSectionTitle("Habit Tracker");
      autoTable(doc, {
        startY: cursorY,
        theme: "plain",
        head: [["Habit", "Module", "Category", "Minutes", "Time", "Status"]],
        body: habits.map((habit) => [
          habit.title,
          habit.moduleName || "-",
          habit.category || "-",
          String(habit.targetMinutes || 0),
          habit.preferredTime || "-",
          habit.completed ? "Completed" : "Pending",
        ]),
        styles: { fontSize: 10, textColor: [23, 48, 88] },
        alternateRowStyles: { fillColor: [244, 248, 255] },
        headStyles: { fillColor: [243, 154, 47] },
      });
    cursorY = doc.lastAutoTable.finalY + 10;

    ensureSpace(30);
    addSectionTitle("Analytics Notes");
    analyticsNotes.forEach((note) => {
      const split = doc.splitTextToSize(`- ${note}`, pageWidth - 28);
      doc.text(split, 14, cursorY);
      cursorY += split.length * 5.2;
      ensureSpace(14);
    });
    cursorY += 3;

    metrics.semesters.forEach((semester) => {
      ensureSpace(42);
      addSectionTitle(semester.title);
      autoTable(doc, {
        startY: cursorY,
        theme: "grid",
        head: [["Module Code", "Module Name", "Credits", "Grade"]],
        body:
          semester.modules.length > 0
            ? semester.modules.map((module) => [
                module.code || "-",
                module.name || "-",
                String(module.credits || 0),
                module.grade || "Pending",
              ])
            : [["-", "No modules", "-", "-"]],
        styles: { fontSize: 9.5, textColor: [23, 48, 88] },
        headStyles: { fillColor: [30, 86, 216] },
        margin: { left: 14, right: 14 },
      });
      cursorY = doc.lastAutoTable.finalY + 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Semester Credits: ${semester.semesterCredits}   |   Semester GPA: ${semester.semesterGpa.toFixed(2)}`,
        14,
        cursorY,
      );
      cursorY += 10;
    });

    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFontSize(9);
      doc.setTextColor(123, 139, 168);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - 28, 290);
    }

    doc.save(`${user.studentId}-gpa-report.pdf`);
  };

  const toggleHabit = (habitId) => {
    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? { ...habit, completed: !habit.completed } : habit)),
    );
  };

  const addHabit = (event) => {
    event.preventDefault();

    if (!habitForm.title.trim()) {
      return;
    }

    setHabits((current) => [
      ...current,
      {
        id: `habit-${Date.now()}`,
        title: habitForm.title.trim(),
        moduleName: habitForm.moduleName.trim(),
        category: habitForm.category,
        targetMinutes: Number(habitForm.targetMinutes) || 0,
        preferredTime: habitForm.preferredTime,
        completed: false,
      },
    ]);

    setHabitForm({
      title: "",
      moduleName: "",
      category: "Revision",
      targetMinutes: 30,
      preferredTime: "19:00",
    });
  };

  const removeHabit = (habitId) => {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));
  };

  const addEvent = (event) => {
    event.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      return;
    }

    setEvents((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        title: eventForm.title,
        moduleName: eventForm.moduleName,
        date: eventForm.date,
        type: eventForm.type,
      },
    ]);
    setEventForm({
      title: "Final Exam",
      moduleName: "",
      date: "",
      type: "Exam",
    });
  };

  const removeEvent = (eventId) => {
    setEvents((current) => current.filter((event) => event.id !== eventId));
  };

  const sendCoachMessage = async (event) => {
    event.preventDefault();
    const text = chatInput.trim();

    if (!text) {
      return;
    }

    const userMessage = { id: `user-${Date.now()}`, role: "user", text };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");

    try {
      setChatLoading(true);
      const { data } = await api.post("/coach/chat", {
        message: text,
        metrics,
        warnings,
        habits,
        events,
        faculty,
        program,
      });

      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now() + 1}`,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (requestError) {
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now() + 1}`,
          role: "assistant",
          text:
            generateCoachReply({
              message: text,
              metrics,
              warnings,
              habits,
              events,
            }) +
            " Local fallback used because the OpenAI API was unavailable.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const updateAssessment = (assessmentId, field, value) => {
    setWhatIfConfig((current) => ({
      ...current,
      assessments: current.assessments.map((assessment) =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              [field]:
                field === "completed"
                  ? value
                  : field === "name"
                    ? value
                    : Number(value) || 0,
            }
          : assessment,
      ),
    }));
  };

  const addAssessment = () => {
    setWhatIfConfig((current) => ({
      ...current,
      assessments: [
        ...current.assessments,
        {
          id: Date.now(),
          name: "New Assessment",
          weight: 0,
          mark: 0,
          completed: false,
        },
      ],
    }));
  };

  const removeAssessment = (assessmentId) => {
    setWhatIfConfig((current) => ({
      ...current,
      assessments: current.assessments.filter((assessment) => assessment.id !== assessmentId),
    }));
  };

  const saveWhatIfPlan = async () => {
    if (!whatIfConfig.moduleName.trim()) {
      setError("Enter a subject name before saving the assessment plan.");
      return;
    }

    try {
      const nextPlans = buildSavedWhatIfPlans(whatIfPlans, whatIfConfig);
      await persistProfile(nextPlans);
      setWhatIfPlans(nextPlans);
      setWhatIfConfig((current) => ({
        ...current,
        id:
          nextPlans.find(
            (plan) => plan.moduleName.trim().toLowerCase() === current.moduleName.trim().toLowerCase(),
          )?.id || current.id,
      }));
      setMessage(`Saved What-If plan for ${whatIfConfig.moduleName.trim()} .`);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save subject plan.");
    }
  };

  const loadWhatIfPlan = (plan) => {
    setWhatIfConfig({
      ...plan,
      assessments: plan.assessments.map((assessment) => ({ ...assessment })),
    });
    setMessage(`Loaded saved plan for ${plan.moduleName}.`);
    setError("");
  };

  const deleteWhatIfPlan = async (planId) => {
    try {
      const nextPlans = whatIfPlans.filter((plan) => plan.id !== planId);
      await persistProfile(nextPlans);
      setWhatIfPlans(nextPlans);
      setMessage("Deleted subject.");
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete subject plan.");
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading student dashboard...</div>;
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Academic Intelligence Platform</p>
          <h1>SLIIT GPA Calculator</h1>
          <p className="subtle-text">
            {user.name} | {user.studentId} | {user.email}
          </p>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={resetTemplate}>
            Reset template
          </button>
          <button className="danger-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="eyebrow"></p>
          <h2>Forecast, predict, warn, and report from one student dashboard.</h2>
          <p></p>
        </div>
        <div className={`classification-card ${getClassTone(classification)}`}>
          <span>Current Class Prediction</span>
          <strong>{classification}</strong>
          <p>
            CGPA {metrics.cgpa.toFixed(2)} | WGPA {metrics.wgpa.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Total Credits</span>
          <strong>{metrics.totalCredits}</strong>
        </article>
        <article className="summary-card success">
          <span>CGPA</span>
          <strong>{metrics.cgpa.toFixed(2)}</strong>
        </article>
        <article className="summary-card warning">
          <span>WGPA</span>
          <strong>{metrics.wgpa.toFixed(2)}</strong>
        </article>
      </section>

      <section className="tab-strip">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === "forecasting" ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <h2>Assessment-Level Forecasting</h2>
              <p>Plan future performance and continue updating your semester data below.</p>
            </div>
            <div className="forecast-grid">
              <label>
                Target CGPA
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={forecastConfig.targetCgpa}
                  onChange={(event) =>
                    setForecastConfig({ ...forecastConfig, targetCgpa: Number(event.target.value) || 0 })
                  }
                />
              </label>
              <label>
                Remaining Credits
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={forecastConfig.remainingCredits}
                  onChange={(event) =>
                    setForecastConfig({ ...forecastConfig, remainingCredits: Number(event.target.value) || 0 })
                  }
                />
              </label>
              <label>
                Expected Future Grade
                <select
                  value={forecastConfig.expectedGrade}
                  onChange={(event) => setForecastConfig({ ...forecastConfig, expectedGrade: event.target.value })}
                >
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="insight-grid">
              <article className="insight-card">
                <span>Projected CGPA</span>
                <strong>{forecastingResult.projectedCgpa.toFixed(2)}</strong>
              </article>
              <article className="insight-card">
                <span>Gap To Target</span>
                <strong>{forecastingResult.gap.toFixed(2)}</strong>
              </article>
              <article className="insight-card">
                <span>Forecast Note</span>
                <strong>
                  {forecastingResult.gap <= 0 ? "Target reachable" : "Need stronger grades or more credits"}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Student Details</h2>
              <p>Each logged-in student has a separate saved record in the database.</p>
            </div>
            <div className="details-grid">
              <label>
                Faculty
                <input value={faculty} onChange={(event) => setFaculty(event.target.value)} />
              </label>
              <label>
                Degree Program
                <input value={program} onChange={(event) => setProgram(event.target.value)} />
              </label>
            </div>
          </section>

          <section className="semester-list">
            {metrics.semesters.map((semester, semesterIndex) => (
              <article key={semester.key} className="semester-card">
                <div className="semester-header">
                  <div>
                    <h3>{semester.title}</h3>
                    <p>Update module names, credits, and grades.</p>
                  </div>
                  <div className="semester-stats">
                    <span>Credits: {semester.semesterCredits}</span>
                    <span>Semester GPA: {semester.semesterGpa.toFixed(2)}</span>
                  </div>
                </div>

                <div className="module-table">
                  {semester.modules.map((module, moduleIndex) => (
                    <ModuleRow
                      key={`${semester.key}-${moduleIndex}`}
                      module={module}
                      onChange={(field, value) => updateSemester(semesterIndex, moduleIndex, field, value)}
                      onRemove={() => removeModule(semesterIndex, moduleIndex)}
                    />
                  ))}
                </div>

                <button
                  className="primary-button secondary-tone"
                  type="button"
                  onClick={() => addModule(semesterIndex)}
                >
                  Add Another Module
                </button>
              </article>
            ))}
          </section>
        </>
      ) : null}

      {activeTab === "whatif" ? (
        <section className="panel">
          <div className="panel-header">
            <h2>What-If Analysis & Class Predictor</h2>
            <p>Enter completed assessment marks and find the mark needed in the remaining exam to reach an A.</p>
          </div>
          <div className="planner-header">
            <label>
              Subject name
              <input
                type="text"
                value={whatIfConfig.moduleName}
                onChange={(event) => setWhatIfConfig({ ...whatIfConfig, moduleName: event.target.value })}
              />
            </label>
            <label>
              Target overall mark
              <input
                type="number"
                min="0"
                max="100"
                value={whatIfConfig.targetOverallMark}
                onChange={(event) =>
                  setWhatIfConfig({ ...whatIfConfig, targetOverallMark: Number(event.target.value) || 0 })
                }
              />
            </label>
            <button className="ghost-button" type="button" onClick={addAssessment}>
              Add Assessment
            </button>
          </div>
          <div className="planner-actions">
            <button className="primary-button" type="button" onClick={saveWhatIfPlan}>
              Save Subject Plan
            </button>
          </div>

          <div className="assessment-list">
            {whatIfConfig.assessments.map((assessment) => (
              <div key={assessment.id} className="assessment-item">
                <input
                  type="text"
                  value={assessment.name}
                  onChange={(event) => updateAssessment(assessment.id, "name", event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assessment.weight}
                  onChange={(event) => updateAssessment(assessment.id, "weight", event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assessment.completed ? assessment.mark : ""}
                  placeholder="Mark %"
                  onChange={(event) => updateAssessment(assessment.id, "mark", event.target.value)}
                  disabled={!assessment.completed}
                />
                <label className="checkbox-card">
                  <span>Completed</span>
                  <input
                    type="checkbox"
                    checked={assessment.completed}
                    onChange={(event) => updateAssessment(assessment.id, "completed", event.target.checked)}
                  />
                </label>
                <button className="danger-button" type="button" onClick={() => removeAssessment(assessment.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="insight-grid planner-summary">
            <article className="insight-card">
              <span>Current weighted score</span>
              <strong>{whatIfResult.currentWeightedScore.toFixed(1)}%</strong>
            </article>
            <article className="insight-card">
              <span>Remaining weight</span>
              <strong>{whatIfResult.remainingWeight.toFixed(0)}%</strong>
            </article>
            <article className={`insight-card ${whatIfResult.isImpossible ? "danger" : "success"}`}>
              <span>Required average</span>
              <strong>
                {whatIfResult.remainingWeight > 0 ? `${whatIfResult.requiredAverage.toFixed(1)}%` : "Completed"}
              </strong>
            </article>
          </div>

          <div className="comparison-grid">
            <article className="chart-card">
              <h3>Assessment Comparison Graph</h3>
              <div className="chart-list">
                {whatIfVisuals.map((assessment) => (
                  <div key={assessment.id} className="chart-row">
                    <span>{assessment.name || "Assessment"}</span>
                    <div className="double-bar-track">
                      <div
                        className="double-bar actual"
                        style={{ width: `${Math.min(100, assessment.actualMark)}%` }}
                      />
                      {!assessment.completed ? (
                        <div
                          className="double-bar target"
                          style={{ width: `${Math.min(100, assessment.neededMark)}%` }}
                        />
                      ) : null}
                    </div>
                    <strong>{assessment.completed ? `${assessment.actualMark.toFixed(0)}%` : `${assessment.neededMark.toFixed(0)}%`}</strong>
                  </div>
                ))}
              </div>
              <div className="graph-legend">
                <span><i className="legend-dot actual" /> Current mark</span>
                <span><i className="legend-dot target" /> Needed next mark</span>
              </div>
            </article>

            <article className="chart-card">
              <h3>Target Progress</h3>
              <div className="target-progress-card">
                <div className="progress-ring-text">
                  <span>Current vs Target</span>
                  <strong>{whatIfResult.currentWeightedScore.toFixed(1)} / {whatIfConfig.targetOverallMark}%</strong>
                </div>
                <div className="bar-track tall">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, (whatIfResult.currentWeightedScore / Math.max(1, whatIfConfig.targetOverallMark)) * 100)}%`,
                    }}
                  />
                </div>
                <p>
                  {whatIfResult.nextAssessment
                    ? `If ${whatIfResult.nextAssessment.name || "the next assessment"} is your next remaining task, aim for ${Math.max(0, Math.min(100, whatIfResult.requiredAverage)).toFixed(1)}% to stay on target.`
                    : "All assessments are completed for this plan."}
                </p>
              </div>
            </article>
          </div>

          <div className="comparison-card">
            <h3>{whatIfConfig.moduleName || "Module"} planner summary</h3>
            <p>
              {whatIfResult.alreadyReached
                ? `You have already secured the target overall mark of ${whatIfConfig.targetOverallMark}% for this module.`
                : whatIfResult.isImpossible
                  ? `To reach ${whatIfConfig.targetOverallMark}%, you would need ${whatIfResult.requiredAverage.toFixed(1)}% in the remaining assessments, which is above 100% and not possible.`
                  : `To reach ${whatIfConfig.targetOverallMark}% in ${whatIfConfig.moduleName || "this module"}, you need an average of ${whatIfResult.requiredAverage.toFixed(1)}% in the remaining ${whatIfResult.remainingWeight.toFixed(0)}% weight.`}
            </p>
            <p>Predicted target grade: {whatIfResult.predictedGrade}</p>
            <p>Total entered assessment weight: {whatIfResult.totalWeight.toFixed(0)}%</p>
            {whatIfResult.nextAssessment ? (
              <p>
                Next assessment focus: {whatIfResult.nextAssessment.name || "Remaining assessment"} needs about{" "}
                {Math.max(0, Math.min(100, whatIfResult.requiredAverage)).toFixed(1)}%.
              </p>
            ) : null}
          </div>

          <div className="comparison-card">
            <h3>Saved Subject Plans</h3>
            {whatIfPlans.length > 0 ? (
              <div className="saved-plan-list">
                {whatIfPlans.map((plan) => (
                  <div key={plan.id} className="saved-plan-item">
                    <div>
                      <strong>{plan.moduleName}</strong>
                      <p>
                        Target {plan.targetOverallMark}% | Assessments {plan.assessments.length} | Updated{" "}
                        {new Date(plan.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="saved-plan-actions">
                      <button className="ghost-button" type="button" onClick={() => loadWhatIfPlan(plan)}>
                        Load
                      </button>
                      <button className="danger-button" type="button" onClick={() => deleteWhatIfPlan(plan.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No subject-wise What-If plans saved yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "warnings" ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Academic Warning & Improvement</h2>
            <p>AI-style study support with warnings, habits, next events, and semester improvement guidance.</p>
          </div>
          <div className="support-grid">
            <div className="support-column">
              <div className="warning-list">
                {warnings.map((warning) => (
                  <article key={warning.title} className={`warning-card ${warning.tone}`}>
                    <h3>{warning.title}</h3>
                    <p>{warning.detail}</p>
                  </article>
                ))}
              </div>

              <div className="comparison-card">
                <h3>Study Tips</h3>
                {studyTips.map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>

              <div className="comparison-card">
                <h3>Habit Tracker</h3>
                <div className="habit-list">
                  {habits.map((habit) => (
                    <div key={habit.id} className={habit.completed ? "habit-item done" : "habit-item"}>
                      <label className="habit-main">
                        <input type="checkbox" checked={habit.completed} onChange={() => toggleHabit(habit.id)} />
                        <div>
                          <strong>{habit.title}</strong>
                          <p>
                            {habit.moduleName || "General"} | {habit.category} | {habit.targetMinutes} min |{" "}
                            {habit.preferredTime || "Any time"}
                          </p>
                        </div>
                      </label>
                      <button className="danger-button" type="button" onClick={() => removeHabit(habit.id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <form className="habit-form" onSubmit={addHabit}>
                  <input
                    type="text"
                    placeholder="Habit title"
                    value={habitForm.title}
                    onChange={(event) => setHabitForm({ ...habitForm, title: event.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Module name"
                    value={habitForm.moduleName}
                    onChange={(event) => setHabitForm({ ...habitForm, moduleName: event.target.value })}
                  />
                  <select
                    value={habitForm.category}
                    onChange={(event) => setHabitForm({ ...habitForm, category: event.target.value })}
                  >
                    <option value="Revision">Revision</option>
                    <option value="Practice">Practice</option>
                    <option value="Reading">Reading</option>
                    <option value="Focus">Focus</option>
                  </select>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="Minutes"
                    value={habitForm.targetMinutes}
                    onChange={(event) => setHabitForm({ ...habitForm, targetMinutes: Number(event.target.value) || 0 })}
                  />
                  <input
                    type="time"
                    value={habitForm.preferredTime}
                    onChange={(event) => setHabitForm({ ...habitForm, preferredTime: event.target.value })}
                  />
                  <button className="primary-button" type="submit">
                    Add Habit
                  </button>
                </form>
              </div>
            </div>

            <div className="support-column">
              <div className="comparison-card">
                <h3>Next Events</h3>
                {todayEvents.length > 0 ? (
                  <p className="event-alert">
                    Today you have {todayEvents[0].title} for {todayEvents[0].moduleName || "a module"}.
                  </p>
                ) : null}
                {upcomingEvents.length > 0 ? (
                  <div className="event-list">
                    {upcomingEvents.slice(0, 5).map((eventItem) => (
                      <div key={eventItem.id} className="event-item">
                        <div>
                          <strong>{eventItem.title}</strong>
                          <p>
                            {eventItem.moduleName || "General"} | {eventItem.type} | {eventItem.date}
                          </p>
                        </div>
                        <button className="danger-button" type="button" onClick={() => removeEvent(eventItem.id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No upcoming events added yet.</p>
                )}
              </div>

              <div className="comparison-card">
                <h3>Add Event</h3>
                <form className="event-form" onSubmit={addEvent}>
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventForm.title}
                    onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Module name"
                    value={eventForm.moduleName}
                    onChange={(event) => setEventForm({ ...eventForm, moduleName: event.target.value })}
                  />
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })}
                  />
                  <select
                    value={eventForm.type}
                    onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })}
                  >
                    <option value="Exam">Exam</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                  <button className="primary-button" type="submit">
                    Add Event
                  </button>
                </form>
              </div>

              <div className="comparison-card">
                <h3>AI Study Coach</h3>
                <div className="chat-box">
                  {chatMessages.map((chatMessage) => (
                    <div
                      key={chatMessage.id}
                      className={chatMessage.role === "assistant" ? "chat-message assistant" : "chat-message user"}
                    >
                      {chatMessage.text}
                    </div>
                  ))}
                </div>
                <form className="chat-form" onSubmit={sendCoachMessage}>
                  <input
                    type="text"
                    placeholder="Ask: how can I improve this semester?"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                  />
                  <button className="primary-button" type="submit" disabled={chatLoading}>
                    {chatLoading ? "Thinking..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "analytics" ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Visual Analytics & PDF Reports</h2>
            <p>Use the charts below to review past performance, next-semester prediction, and your printable report.</p>
          </div>
          <div className="chart-grid">
            <article className="chart-card">
              <h3>Semester GPA Trend</h3>
              <div className="chart-list">
                {metrics.semesters.map((semester) => (
                  <div key={semester.key} className="chart-row">
                    <span>{semester.title}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.min(100, (semester.semesterGpa / 4) * 100)}%` }}
                      />
                    </div>
                    <strong>{semester.semesterGpa.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-card">
              <h3>Year Average GPA</h3>
              <div className="chart-list">
                {yearAverages.map((yearItem) => (
                  <div key={yearItem.year} className="chart-row">
                    <span>Year {yearItem.year}</span>
                    <div className="bar-track soft">
                      <div
                        className="bar-fill amber"
                        style={{ width: `${Math.min(100, (yearItem.average / 4) * 100)}%` }}
                      />
                    </div>
                    <strong>{yearItem.average.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-card">
              <h3>Grade Distribution</h3>
              <div className="chart-list">
                {gradeDistribution.map((bucket) => (
                  <div key={bucket.label} className="chart-row">
                    <span>{bucket.label}</span>
                    <div className="bar-track soft">
                      <div className="bar-fill violet" style={{ width: `${bucket.percentage}%` }} />
                    </div>
                    <strong>{bucket.count}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-card">
              <h3>Credit Completion By Year</h3>
              <div className="chart-list">
                {creditByYear.map((yearItem) => (
                  <div key={yearItem.year} className="chart-row">
                    <span>Year {yearItem.year}</span>
                    <div className="bar-track">
                      <div className="bar-fill green" style={{ width: `${yearItem.percentage}%` }} />
                    </div>
                    <strong>{yearItem.credits}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-card">
              <h3>Next Semester Prediction</h3>
              <div className="prediction-metrics">
                <div className="prediction-card">
                  <span>Predicted Semester GPA</span>
                  <strong>{analyticsProjection.predictedNextSemesterGpa.toFixed(2)}</strong>
                </div>
                <div className="prediction-card">
                  <span>Predicted Average Mark</span>
                  <strong>{analyticsProjection.predictedMark.toFixed(1)}%</strong>
                </div>
                <div className="prediction-card">
                  <span>Projected CGPA After Next Semester</span>
                  <strong>{analyticsProjection.projectedCgpa.toFixed(2)}</strong>
                </div>
              </div>
              <div className="trend-compare">
                <div className="trend-column">
                  <span>Recent Avg</span>
                  <div style={{ height: `${(analyticsProjection.recentAverage / 4) * 180}px` }} />
                  <strong>{analyticsProjection.recentAverage.toFixed(2)}</strong>
                </div>
                <div className="trend-column predicted">
                  <span>Predicted Next</span>
                  <div style={{ height: `${(analyticsProjection.predictedNextSemesterGpa / 4) * 180}px` }} />
                  <strong>{analyticsProjection.predictedNextSemesterGpa.toFixed(2)}</strong>
                </div>
              </div>
            </article>
            <article className="chart-card">
              <h3>Analytics Summary</h3>
              <div className="analysis-notes">
                {analyticsNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </article>
          </div>
          <div className="comparison-card">
            <h3>Printable Report</h3>
            <p>
              Use the browser print dialog to save this dashboard as PDF with current GPA, classification, warnings,
              and charts.
            </p>
            <button className="primary-button" type="button" onClick={handlePrintReport}>
              Export PDF Report
            </button>
          </div>
        </section>
      ) : null}

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="footer-actions">
        <button className="primary-button" type="button" onClick={saveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(userStorageKey);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = ({ token, user: loggedInUser }) => {
    localStorage.setItem(tokenStorageKey, token);
    localStorage.setItem(userStorageKey, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    setUser(null);
  };

const isAppRoute = ["/login", "/register", "/academic-setup"].includes(useLocation().pathname);

  if (!isAppRoute) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} />}
      />
      <Route
        path="/register"
        element={<RegisterPage onLogin={handleLogin} />}
      />

      <Route
        path="/academic-setup"
        element={<ProtectedRoute user={user}><AcademicSetup onLogout={handleLogout} /></ProtectedRoute>}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute user={user}><DashboardPage user={user} onLogout={handleLogout} /></ProtectedRoute>}
      />
      <Route
        path="/chat"
        element={<ProtectedRoute user={user}><AiChatPage user={user} onLogout={handleLogout} /></ProtectedRoute>}
      />
    </Routes>
  );
}

