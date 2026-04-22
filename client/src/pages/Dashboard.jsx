import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const STYLES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.9; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  .anim-shimmer  { animation: shimmer 2.5s infinite linear; }
  .anim-slide-up { animation: slide-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-fade-in  { animation: fade-in 0.9s ease both; }
  .anim-float    { animation: float 4s ease-in-out infinite; }
  .anim-glow     { animation: glow-pulse 3s ease-in-out infinite; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.15s; }
  .d3 { animation-delay: 0.25s; }
  .d4 { animation-delay: 0.38s; }
  .d5 { animation-delay: 0.50s; }
  .card-hover {
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.35s ease,
                border-color 0.35s ease;
  }
  .card-hover:hover { transform: translateY(-6px); }
`;

/* ── grade helpers ── */
const GP = {
  "A+":4.0,"A":4.0,"A-":3.7,
  "B+":3.3,"B":3.0,"B-":2.7,
  "C+":2.3,"C":2.0,"C-":1.7,
  "D+":1.3,"D":1.0,"E":0.0,"F":0.0,
};

function calcSemGpa(modules) {
  let pts = 0, creds = 0;
  (modules || []).forEach((m) => {
    const gp = GP[m.grade];
    if (gp !== undefined && m.credits > 0) {
      pts   += gp * Number(m.credits);
      creds += Number(m.credits);
    }
  });
  return creds > 0 ? pts / creds : null;
}

function classifyGpa(gpa) {
  if (gpa >= 3.7) return { label:"First Class",  color:"#10b981", badge:"bg-emerald-500/10 border-emerald-500/25 text-emerald-400", glow:"rgba(16,185,129,0.15)" };
  if (gpa >= 3.3) return { label:"Upper Second", color:"#3b82f6", badge:"bg-blue-500/10 border-blue-500/25 text-blue-400",         glow:"rgba(59,130,246,0.15)" };
  if (gpa >= 3.0) return { label:"Second Class", color:"#8b5cf6", badge:"bg-purple-500/10 border-purple-500/25 text-purple-400",   glow:"rgba(139,92,246,0.15)" };
  if (gpa >= 2.0) return { label:"Lower Second", color:"#f59e0b", badge:"bg-amber-500/10 border-amber-500/25 text-amber-400",      glow:"rgba(245,158,11,0.15)" };
  return          { label:"Pass",               color:"#ef4444", badge:"bg-red-500/10 border-red-500/25 text-red-400",            glow:"rgba(239,68,68,0.15)" };
}

/* ── Animated GPA Ring ── */
function GpaRing({ gpa, size = 160, strokeWidth = 10, label = "CGPA", color = "#10b981" }) {
  const [animated, setAnimated] = useState(false);
  const [display,  setDisplay]  = useState(0);

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 350); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!gpa) return;
    let frame, start = null;
    const target = parseFloat(gpa);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      const e = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      setDisplay(e * target);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [gpa]);

  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const off  = animated ? circ - Math.min((gpa || 0) / 4, 1) * circ : circ;
  const id   = `g-${label.replace(/\s/g,"")}`;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width:size, height:size }}>
      <div className="absolute inset-0 rounded-full blur-3xl opacity-25 anim-glow" style={{ backgroundColor:color }} />
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        {/* glow layer */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth+4}
          strokeOpacity="0.08" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(0.34,1.5,0.64,1)" }} />
        {/* main arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(0.34,1.5,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white leading-none tracking-tighter" style={{ fontSize: size * 0.22 }}>
          {gpa != null ? display.toFixed(2) : "0.00"}
        </span>
        <span className="font-bold uppercase tracking-[0.18em] text-white/35 mt-1" style={{ fontSize: size * 0.065 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Stat Pill ── */
function StatPill({ label, value, sub, color = "#22c55e" }) {
  return (
    <div className="flex flex-col gap-1.5 p-5 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors">
      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30">{label}</span>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-black text-white tracking-tighter leading-none">{value}</span>
        {sub && <span className="text-base text-white/25 font-semibold mb-0.5">{sub}</span>}
      </div>
    </div>
  );
}

/* ── Target GPA Modal ── */
function TargetGpaModal({ currentGpa, onSave }) {
  const [target, setTarget] = useState("3.5");
  const presets = ["3.0","3.3","3.5","3.7","4.0"];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-sm bg-[#0d0d0d] border border-white/[0.07] rounded-[36px] p-10 shadow-2xl overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto mb-5 anim-float">🎯</div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Set Your Target</h2>
          <p className="text-white/40 text-sm mb-7 font-medium">
            Current GPA: <span className="text-emerald-400 font-bold">{currentGpa?.toFixed(2) ?? "—"}</span>
          </p>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {presets.map((v) => (
              <button key={v} onClick={() => setTarget(v)}
                className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                  target === v
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105"
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                }`}>{v}</button>
            ))}
          </div>
          <input type="number" min="0" max="4" step="0.1" value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-3xl font-black text-center outline-none focus:border-emerald-500 transition-all mb-6" />
          <button onClick={() => onSave(parseFloat(target))}
            className="w-full bg-emerald-500 text-black rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-emerald-400 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20">
            Lock Target
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ MAIN DASHBOARD ════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showModal, setShowModal] = useState(false);
  const [targetGpa, setTargetGpa] = useState(() => {
    const v = parseFloat(localStorage.getItem("targetGpa"));
    return isNaN(v) ? null : v;
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [uRes, pRes] = await Promise.all([api.get("/auth/me"), api.get("/profile")]);
        setUser(uRes.data);
        setProfile(pRes.data);
        if (!localStorage.getItem("targetGpa")) setShowModal(true);
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
        else setError("Failed to synchronize dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSaveTarget = (val) => {
    if (!isNaN(val) && val > 0) { localStorage.setItem("targetGpa", String(val)); setTargetGpa(val); }
    setShowModal(false);
  };

  /* derived */
  const semesters     = profile?.semesters || [];
  const cgpa          = profile?.cgpa ?? 0;
  const completedSems = semesters.filter((s) => (s.modules || []).some((m) => m.grade));
  const totalCredits  = profile?.totalCredits ?? semesters.reduce((a, s) => a + (s.semesterCredits || 0), 0);
  const semGpas       = semesters.map((s) => ({ name: s.title || s.key || "Semester", gpa: calcSemGpa(s.modules) ?? s.semesterGpa ?? 0 }));
  const cls           = cgpa > 0 ? classifyGpa(cgpa) : null;
  const gap           = targetGpa != null ? targetGpa - cgpa : null;
  const firstName     = user?.name?.split(" ")[0] || "Student";
  const initials      = (user?.name || "S").split(" ").map((w) => w[0]).join("").slice(0,2).toUpperCase();
  const hour          = new Date().getHours();
  const greeting      = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetIcon     = hour < 12 ? "🌤️" : hour < 17 ? "☀️" : "🌙";

  const tools = [
    { icon:"📊", title:"GPA Optimizer",     desc:"Hit targets precisely.",        gradient:"from-emerald-500/15 to-transparent", glow:"rgba(16,185,129,0.18)", border:"hover:border-emerald-500/30", path:"/select-semester" },
    { icon:"🔮", title:"What-If Analysis",  desc:"Simulate future scores.",       gradient:"from-purple-500/15 to-transparent",  glow:"rgba(139,92,246,0.18)",  border:"hover:border-purple-500/30",  path:"/whatif",          badge:"Live" },
    { icon:"⚡", title:"Forecasting",       desc:"Neural trajectory modeling.",   gradient:"from-blue-500/15 to-transparent",    glow:"rgba(59,130,246,0.18)",   border:"hover:border-blue-500/30",    path:"/forecasting" },
    { icon:"⚠️", title:"Risk Analyzer",     desc:"Identify critical subjects.",   gradient:"from-amber-500/15 to-transparent",   glow:"rgba(245,158,11,0.18)",   border:"hover:border-amber-500/30",   path:"/risk-analyzer" },
    { icon:"⏱️", title:"Deep Focus",        desc:"Elite study management.",       gradient:"from-rose-500/15 to-transparent",    glow:"rgba(244,63,94,0.18)",    border:"hover:border-rose-500/30",    path:"/timer" },
    { icon:"🤖", title:"AI Academic Coach", desc:"Powered by AI Engine.",         gradient:"from-cyan-500/15 to-transparent",    glow:"rgba(6,182,212,0.18)",    border:"hover:border-cyan-500/30",    path:"/chat",            badge:"BETA" },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500/15" />
        <div className="absolute inset-0 rounded-full border-[3px] border-t-emerald-500 animate-spin" />
      </div>
      <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Dashboard</p>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">⚠️</div>
      <div>
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">System Out of Sync</h2>
        <p className="text-red-400 text-sm font-medium max-w-sm">{error}</p>
      </div>
      <button onClick={() => navigate("/login")}
        className="bg-white/5 border border-white/10 text-white rounded-2xl px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
        Re-authenticate
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24 px-5 sm:px-10 font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      <style>{STYLES}</style>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/[0.04] blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-blue-500/[0.04] blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-purple-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      {showModal && <TargetGpaModal currentGpa={cgpa || null} onSave={handleSaveTarget} />}

      <div className="mx-auto max-w-7xl relative z-10 text-white">

        {/* ══ HEADER ══ */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-14 anim-slide-up">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <span className="text-xl font-black text-emerald-400">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050505]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{greetIcon}</span>
                <span className="text-white/40 text-sm font-semibold">{greeting}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tighter">
                {firstName}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">.</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {user?.university && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[9px] font-bold text-white/35 uppercase tracking-widest">
                    🏛️ {user.university}
                  </span>
                )}
                {user?.degreeProgram && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[9px] font-bold text-white/35 uppercase tracking-widest">
                    🎓 {user.degreeProgram}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white/40 tracking-[0.2em] uppercase">System Active</span>
            </div>
            <button onClick={() => navigate("/academic-setup")} title="Settings"
              className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/15 transition-all group">
              <svg className="w-5 h-5 text-white/35 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={() => { localStorage.removeItem("gpa_token"); navigate("/login"); }} title="Sign Out"
              className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-all group">
              <svg className="w-5 h-5 text-white/35 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </section>

        {/* ══ METRICS HERO ══ */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-12 anim-slide-up d1">

          {/* CGPA card */}
          <div className="xl:col-span-8 relative rounded-[40px] bg-white/[0.025] backdrop-blur-3xl border border-white/[0.06] p-8 md:p-10 overflow-hidden group card-hover"
            style={{ boxShadow: cls ? `0 0 80px ${cls.glow}` : "none" }}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.04] blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/[0.07] transition-colors duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <GpaRing gpa={cgpa} label="Current GPA" color="#10b981" size={190} strokeWidth={11} />
              <div className="flex-1 w-full">
                {cls && (
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-7 ${cls.badge}`}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cls.color }} />
                    {cls.label} Honours
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <StatPill label="Credits Earned" value={totalCredits} />
                  <StatPill label="Semesters" value={completedSems.length} sub={`/${semesters.length}`} />
                  <StatPill label="Efficiency" value={totalCredits > 0 ? Math.round((cgpa/4)*100) : 0} sub="%" color="#22c55e" />
                </div>
              </div>
            </div>
          </div>

          {/* Target card */}
          <div className="xl:col-span-4 relative rounded-[40px] bg-white/[0.025] backdrop-blur-3xl border border-white/[0.06] p-8 overflow-hidden group card-hover flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 bg-blue-500/[0.03] blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/[0.06] transition-colors duration-700" />
            {targetGpa ? (
              <div className="relative z-10 flex flex-col items-center gap-5">
                <GpaRing gpa={targetGpa} label="Target" color="#3b82f6" size={130} strokeWidth={8} />
                <div>
                  <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.22em] mb-1">Gap to Target</p>
                  <p className={`text-3xl font-black tracking-tighter ${gap <= 0 ? "text-emerald-400" : "text-blue-400"}`}>
                    {gap <= 0 ? "✓ Achieved" : `+${gap.toFixed(2)}`}
                  </p>
                </div>
                <button onClick={() => setShowModal(true)}
                  className="px-5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                  Modify Target
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-3xl anim-float">🎯</div>
                <div>
                  <h3 className="text-white text-lg font-black tracking-tight">Set Trajectory</h3>
                  <p className="text-white/35 text-xs mt-1 font-medium">Define your academic end-game.</p>
                </div>
                <button onClick={() => setShowModal(true)}
                  className="px-7 py-2.5 rounded-xl bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                  Initialize
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ PERFORMANCE FLOW ══ */}
        <section className="mb-14 anim-slide-up d2">
          <SectionHeader title="Performance Flow" />
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[36px] p-8 md:p-10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none rounded-[36px]" />
            <div className="flex flex-col gap-7 relative z-10">
              {semGpas.length > 0
                ? semGpas.map((s, i) => <SemRow key={i} name={s.name} gpa={s.gpa} index={i} total={semGpas.length} />)
                : <p className="py-8 text-center text-white/20 font-medium italic">No academic cycles detected yet.</p>
              }
            </div>
          </div>
        </section>

        {/* ══ SYSTEM MODULES ══ */}
        <section className="anim-slide-up d3">
          <SectionHeader title="System Modules" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool, i) => (
              <ToolCard key={i} tool={tool} onClick={() => navigate(tool.path)} />
            ))}
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="mt-20 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 opacity-30 hover:opacity-70 transition-opacity duration-500">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-white tracking-[0.25em] uppercase">AcadamiX Engine Control</span>
          </div>
          <p className="text-[9px] font-bold text-white tracking-widest uppercase">Protocol v2.5.4</p>
        </footer>
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <h2 className="text-base font-black text-white tracking-tight shrink-0">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

/* ── Semester Progress Row ── */
function SemRow({ name, gpa, index, total }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min((gpa / 4) * 100, 100);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 500 + index * 120);
    return () => clearTimeout(t);
  }, [pct, index]);

  const color = gpa >= 3.7 ? "#10b981" : gpa >= 3.0 ? "#3b82f6" : gpa > 0 ? "#f59e0b" : "#333";
  const label = gpa >= 3.7 ? "First" : gpa >= 3.3 ? "Upper 2nd" : gpa >= 3.0 ? "2nd Class" : gpa > 0 ? "Lower 2nd" : null;

  return (
    <div className="group flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full shrink-0 transition-all duration-500 group-hover:scale-125"
            style={{ backgroundColor: gpa > 0 ? color : "#333", boxShadow: gpa > 0 ? `0 0 8px ${color}88` : "none" }} />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em] group-hover:text-white/65 transition-colors">{name}</span>
          {label && (
            <span className="hidden sm:inline px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}>{label}</span>
          )}
        </div>
        <span className="text-sm font-black tracking-tighter" style={{ color: gpa > 0 ? color : "rgba(255,255,255,0.15)" }}>
          {gpa > 0 ? gpa.toFixed(2) : "UNGRADED"}
        </span>
      </div>
      <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03] p-[2px]">
        <div className="h-full rounded-full relative transition-all duration-[1.6s] ease-[cubic-bezier(0.85,0,0.15,1)]"
          style={{ width:`${width}%`, backgroundColor: color, boxShadow:`0 0 16px ${color}44` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent anim-shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Tool Card ── */
function ToolCard({ tool, onClick }) {
  return (
    <button onClick={onClick}
      className={`group relative h-[200px] rounded-[32px] bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] p-7 text-left overflow-hidden shadow-xl card-hover ${tool.border}`}>
      {/* hover gradient fill */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]"
        style={{ boxShadow:`inset 0 0 40px ${tool.glow}` }} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-2xl transition-transform duration-400 group-hover:scale-110 group-hover:rotate-3">
            {tool.icon}
          </div>
          {tool.badge && (
            <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[7px] font-black text-white/60 uppercase tracking-[0.2em]">
              {tool.badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight mb-1.5 group-hover:text-emerald-400 transition-colors duration-300">{tool.title}</h3>
          <p className="text-white/30 text-xs font-medium leading-relaxed group-hover:text-white/55 transition-colors duration-300">{tool.desc}</p>
        </div>
      </div>
    </button>
  );
}
