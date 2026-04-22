import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { buildDefaultSemesters } from "../data/template";
import { calculateMetrics } from "../utils/gpa";
import { calculateTargetCgpa, calculateTargetGap } from "../utils/insights";
import ForecastingSection from "../components/ForecastingSection";

export default function ForecastingPage() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState("Faculty of Computing");
  const [program, setProgram] = useState("BSc (Hons) in Information Technology - Information Technology");
  const [semesters, setSemesters] = useState(buildDefaultSemesters());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [forecastConfig, setForecastConfig] = useState({
    targetCgpa: 3.5,
    remainingCredits: 24,
    expectedGrade: "A-",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setFaculty(data.faculty || "Faculty of Computing");
        setProgram(data.program || "BSc (Hons) in Information Technology - Information Technology");
        setSemesters(data.semesters?.length ? data.semesters : buildDefaultSemesters());
      } catch (requestError) {
        if (requestError.response?.status !== 401) {
          setError("Could not load saved GPA data. Starting with a blank template.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const metrics = useMemo(() => calculateMetrics(semesters), [semesters]);

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

  const updateSemester = (semesterIndex, moduleIndex, field, value) => {
    setSemesters((current) =>
      current.map((semester, currentSemesterIndex) => {
        if (currentSemesterIndex !== semesterIndex) return semester;
        return {
          ...semester,
          modules: semester.modules.map((module, currentModuleIndex) => {
            if (currentModuleIndex !== moduleIndex) return module;
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
              modules: semester.modules.filter((_, mIndex) => mIndex !== moduleIndex),
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
      await api.post("/profile", { faculty, program, semesters });
      setMessage("Profile saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white pt-16 flex items-center justify-center">
        <div className="rounded-3xl border border-[#333333] bg-[#1a1a1a] p-10 shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#333333] border-t-[#22c55e] rounded-full animate-spin"></div>
          <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Loading engine…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-16 p-6 font-sans text-white selection:bg-[#c8f135] selection:text-black animate-fade-in">
      <div className="max-w-6xl mx-auto relative z-10 pt-10 pb-12">

        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color:"rgba(255,255,255,0.3)" }}>Academic Intelligence</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter">
              Forecasting<br />
              <span style={{ color:"#c8f135" }}>Engine.</span>
            </h1>
            <p className="text-sm font-medium max-w-xs text-right" style={{ color:"rgba(255,255,255,0.4)" }}>
              Model your trajectory, track degree requirements, and identify achievable targets.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl text-sm font-bold" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171" }}>
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="rounded-3xl p-6 md:p-8 mb-6 animate-slide-up stagger-2" style={{ background:"#111", border:"1px solid #1e1e1e" }}>
          <ForecastingSection
            forecastConfig={forecastConfig}
            setForecastConfig={setForecastConfig}
            forecastingResult={forecastingResult}
            semesters={semesters}
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap animate-slide-up stagger-3">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:opacity-70"
            style={{ color:"rgba(255,255,255,0.4)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back
          </button>

          <button onClick={saveProfile} disabled={saving}
            className="px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50"
            style={{ background:"#c8f135", color:"#111", boxShadow:"0 0 24px rgba(200,241,53,0.25)" }}>
            {saving ? "Saving…" : "Save Configuration"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-black animate-fade-in" style={{ color:"#c8f135" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
