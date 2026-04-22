import { useMemo, useState } from "react";
import { gradePoints, yearWeights } from "../data/template";

const GRADES = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","E"];
const ACCENT = "#c8f135";

function classifyGpa(gpa) {
  if (gpa >= 3.7) return { label:"First Class",  color:"#c8f135" };
  if (gpa >= 3.3) return { label:"Upper Second", color:"#a78bfa" };
  if (gpa >= 3.0) return { label:"Second Class", color:"#60a5fa" };
  if (gpa >= 2.0) return { label:"Lower Second", color:"#fbbf24" };
  if (gpa > 0)    return { label:"Pass",          color:"#f87171" };
  return           { label:"No Data",            color:"#444" };
}

function ForecastingSection({ forecastConfig, setForecastConfig, forecastingResult, semesters }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [openSem, setOpenSem]     = useState(null);

  const semStats = useMemo(() => semesters.map(sem => {
    let creds = 0, pts = 0;
    sem.modules.forEach(m => {
      const c = Number(m.credits) || 0;
      const gp = gradePoints[m.grade] ?? null;
      if (c > 0 && gp !== null) { creds += c; pts += c * gp; }
    });
    return { ...sem, creds, gpa: creds > 0 ? pts / creds : 0 };
  }), [semesters]);

  const gradedSems = semStats.filter(s => s.creds > 0);

  const yearBreakdown = useMemo(() => {
    const map = {};
    semStats.forEach(s => {
      if (!map[s.year]) map[s.year] = { creds:0, pts:0, weight: yearWeights[s.year]||0 };
      map[s.year].creds += s.creds;
      map[s.year].pts   += s.creds * s.gpa;
    });
    return Object.entries(map).map(([year, d]) => ({
      year: Number(year), gpa: d.creds > 0 ? d.pts/d.creds : 0,
      creds: d.creds, weight: d.weight,
    }));
  }, [semStats]);

  const wgpa = yearBreakdown.reduce((s, y) => s + (y.creds > 0 ? (y.gpa * y.weight)/100 : 0), 0);
  const wgpaCls = classifyGpa(wgpa);
  const projCls = classifyGpa(forecastingResult.projectedCgpa);

  const calcScenario = (grade) => {
    const gp = gradePoints[grade] ?? 0;
    const rc = Number(forecastConfig.remainingCredits) || 0;
    let cc=0, cp=0;
    semesters.forEach(sem => sem.modules.forEach(m => {
      const g = gradePoints[m.grade];
      if (g !== undefined) { cc += Number(m.credits)||0; cp += (Number(m.credits)||0)*g; }
    }));
    return (cc+rc) > 0 ? (cp + rc*gp)/(cc+rc) : 0;
  };

  const tabs = ["overview","semesters","simulator"];

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily:"'Poppins',sans-serif" }}>

      {/* ── Tab strip ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-full w-fit" style={{ background:"#1a1a1a", border:"1px solid #2a2a2a" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all"
            style={activeTab === t
              ? { background: ACCENT, color:"#111" }
              : { background:"transparent", color:"rgba(255,255,255,0.4)" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5">

          {/* Top stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:"Current WGPA",   value: wgpa.toFixed(2),                             sub: wgpaCls.label,  color: wgpaCls.color,  accent: false },
              { label:"Projected CGPA", value: forecastingResult.projectedCgpa.toFixed(2),  sub: projCls.label,  color: projCls.color,  accent: false },
              { label:"Semesters Done", value: gradedSems.length,                            sub:`of ${semStats.length} total`, color:"#fff", accent: false },
              { label:"Gap to Target",  value: forecastingResult.gap <= 0 ? "✓ Done" : `+${forecastingResult.gap.toFixed(2)}`,
                sub: forecastingResult.gap <= 0 ? "Target reached" : "Needs improvement",
                color: forecastingResult.gap <= 0 ? ACCENT : "#f87171", accent: forecastingResult.gap <= 0 },
            ].map(c => (
              <div key={c.label} className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: c.accent ? ACCENT : "#161616", border:`1px solid ${c.accent ? "transparent" : "#252525"}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-widest" style={{ color: c.accent ? "#111" : "rgba(255,255,255,0.35)" }}>{c.label}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: c.accent ? "rgba(0,0,0,0.15)" : "#222" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke={c.accent ? "#111" : "rgba(255,255,255,0.3)"} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-black tracking-tighter leading-none" style={{ color: c.accent ? "#111" : c.color }}>{c.value}</p>
                <p className="text-sm font-bold" style={{ color: c.accent ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.3)" }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Bento row: bar chart + year weights */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* GPA bar chart — spans 3 cols */}
            <div className="lg:col-span-3 rounded-2xl p-6" style={{ background:"#161616", border:"1px solid #252525" }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-base font-black text-white">GPA Trajectory</p>
                <div className="flex gap-2">
                  {[{c:ACCENT,l:"First"},{c:"#a78bfa",l:"Upper"},{c:"#60a5fa",l:"Second"},{c:"#fbbf24",l:"Lower"}].map(r => (
                    <span key={r.l} className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background:`${r.c}18`, color:r.c, border:`1px solid ${r.c}30` }}>{r.l}</span>
                  ))}
                </div>
              </div>

              {gradedSems.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-sm" style={{ color:"rgba(255,255,255,0.2)" }}>
                  No graded semesters yet
                </div>
              ) : (
                <div className="flex items-end gap-2" style={{ height:"120px" }}>
                  {semStats.map((sem, i) => {
                    const cls = classifyGpa(sem.gpa);
                    const h   = sem.creds > 0 ? Math.max((sem.gpa/4)*100, 6) : 6;
                    const prev = i > 0 ? semStats[i-1].gpa : null;
                    const up   = prev !== null && sem.creds > 0 && sem.gpa > prev;
                    return (
                      <div key={sem.key} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-sm font-black" style={{ color: sem.creds > 0 ? (up ? ACCENT : "#f87171") : "transparent" }}>
                          {sem.creds > 0 ? (up ? "▲" : "▼") : ""}
                        </span>
                        <div className="w-full flex items-end justify-center" style={{ height:"90px" }}>
                          <div className="w-full rounded-t-xl relative overflow-hidden transition-all duration-300 group-hover:brightness-125"
                            style={{
                              height: `${h}%`,
                              background: sem.creds > 0 ? "linear-gradient(to top, " + cls.color + "cc, " + cls.color + "66)" : "#222",
                              boxShadow: sem.creds > 0 ? "0 0 16px " + cls.color + "33" : "none"
                            }}>
                            {/* stripe pattern like the reference */}
                            <div className="absolute inset-0 opacity-20"
                              style={{ backgroundImage:`repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,0.3) 3px,rgba(0,0,0,0.3) 6px)` }} />
                          </div>
                        </div>
                        <span className="text-sm font-black" style={{ color: sem.creds > 0 ? cls.color : "rgba(255,255,255,0.2)" }}>
                          {sem.creds > 0 ? sem.gpa.toFixed(1) : "—"}
                        </span>
                        <span className="text-xs text-center leading-tight" style={{ color:"rgba(255,255,255,0.2)" }}>
                          {sem.title?.replace("Year ","Y")?.replace(" Semester "," S") || sem.key}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Year weight breakdown — spans 2 cols */}
            <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col gap-4" style={{ background:"#161616", border:"1px solid #252525" }}>
              <p className="text-base font-black text-white">Year Weights</p>
              <div className="flex flex-col gap-4 flex-1 justify-center">
                {yearBreakdown.map(y => {
                  const cls = classifyGpa(y.gpa);
                  const pct = y.creds > 0 ? Math.min((y.gpa/4)*100,100) : 0;
                  return (
                    <div key={y.year}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black text-white">Year {y.year}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black" style={{ color: y.creds > 0 ? cls.color : "rgba(255,255,255,0.2)" }}>
                            {y.creds > 0 ? y.gpa.toFixed(2) : "—"}
                          </span>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background:"#222", color:"rgba(255,255,255,0.3)" }}>
                            {y.weight}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background:"#252525" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: y.creds > 0 ? "linear-gradient(to right, " + cls.color + ", " + cls.color + "88)" : "#333",
                            boxShadow: y.creds > 0 ? "0 0 8px " + cls.color + "44" : "none"
                          }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Classification thresholds */}
              <div className="pt-4 flex flex-wrap gap-1.5" style={{ borderTop:"1px solid #252525" }}>
                {[{l:"First",v:3.7,c:"#c8f135"},{l:"Upper",v:3.3,c:"#a78bfa"},{l:"2nd",v:3.0,c:"#60a5fa"},{l:"Lower",v:2.0,c:"#fbbf24"}].map(t => (
                  <span key={t.l} className="text-xs font-black px-2 py-0.5 rounded-full transition-all"
                    style={{ background:`${t.c}${wgpa >= t.v ? "22" : "0a"}`, color: wgpa >= t.v ? t.c : "rgba(255,255,255,0.2)",
                      border:`1px solid ${t.c}${wgpa >= t.v ? "40" : "15"}` }}>
                    {wgpa >= t.v && "✓ "}{t.l} ≥{t.v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SEMESTERS TAB ══ */}
      {activeTab === "semesters" && (
        <div className="flex flex-col gap-3">
          {semStats.map((sem, i) => {
            const cls     = classifyGpa(sem.gpa);
            const hasData = sem.creds > 0;
            const isOpen  = openSem === sem.key;
            const modules = sem.modules.filter(m => m.name || m.code);
            const pct     = hasData ? Math.min((sem.gpa/4)*100,100) : 0;
            const prev    = i > 0 ? semStats[i-1].gpa : null;
            const trend   = prev !== null && hasData ? (sem.gpa > prev ? "▲" : sem.gpa < prev ? "▼" : "—") : null;

            return (
              <div key={sem.key} className="rounded-2xl overflow-hidden transition-all"
                style={{ background:"#161616", border:`1px solid ${isOpen && hasData ? cls.color+"40" : "#252525"}` }}>
                <button onClick={() => setOpenSem(isOpen ? null : sem.key)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black"
                    style={{
                      background: hasData ? cls.color + "18" : "#222",
                      color: hasData ? cls.color : "rgba(255,255,255,0.2)",
                      border: "1px solid " + (hasData ? cls.color + "30" : "#333")
                    }}>
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{sem.title}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>
                      {hasData ? `${sem.creds} credits · ${sem.modules.filter(m=>m.grade).length}/${modules.length} graded` : "No grades yet"}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 w-36 shrink-0">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#252525" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background: hasData ? cls.color : "#333" }} />
                    </div>
                  </div>
                  {trend && <span className="text-xs font-black shrink-0" style={{ color: trend==="▲" ? ACCENT : trend==="▼" ? "#f87171" : "rgba(255,255,255,0.2)" }}>{trend}</span>}
                  <span className="text-xl font-black tracking-tighter shrink-0 w-14 text-right" style={{ color: hasData ? cls.color : "rgba(255,255,255,0.2)" }}>
                    {hasData ? sem.gpa.toFixed(2) : "—"}
                  </span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {isOpen && modules.length > 0 && (
                  <div className="px-5 pb-5 flex flex-col gap-2" style={{ borderTop:"1px solid #252525" }}>
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modules.map((m, mi) => {
                        const gp = gradePoints[m.grade] ?? null;
                        const mc = gp === null ? { color:"rgba(255,255,255,0.2)", bg:"#1e1e1e" }
                                 : gp >= 3.7   ? { color:"#c8f135", bg:"#c8f13518" }
                                 : gp >= 3.0   ? { color:"#60a5fa", bg:"#60a5fa18" }
                                 : gp >= 2.0   ? { color:"#fbbf24", bg:"#fbbf2418" }
                                 : { color:"#f87171", bg:"#f8717118" };
                        return (
                          <div key={mi} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background:"#1a1a1a", border:"1px solid #2a2a2a" }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                {m.code && <span className="text-sm font-black" style={{ color:"rgba(255,255,255,0.2)" }}>{m.code}</span>}
                                <span className="text-sm font-semibold truncate" style={{ color:"rgba(255,255,255,0.7)" }}>{m.name || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:"#252525" }}>
                                  <div className="h-full rounded-full" style={{ width:`${gp !== null ? Math.min((gp/4)*100,100) : 0}%`, background: mc.color }} />
                                </div>
                                <span className="text-xs font-bold shrink-0" style={{ color:"rgba(255,255,255,0.2)" }}>{m.credits}cr</span>
                              </div>
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg min-w-[2.5rem] text-center shrink-0"
                              style={{ background: mc.bg, color: mc.color, border:`1px solid ${mc.color}30` }}>
                              {m.grade || "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ SIMULATOR TAB ══ */}
      {activeTab === "simulator" && (
        <div className="flex flex-col gap-5">

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label:"Target CGPA", key:"targetCgpa", type:"number", min:0, max:4, step:0.1 },
              { label:"Remaining Credits", key:"remainingCredits", type:"number", min:0, step:1 },
            ].map(f => (
              <div key={f.key} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background:"#161616", border:"1px solid #252525" }}>
                <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color:"rgba(255,255,255,0.3)" }}>{f.label}</span>
                <input type={f.type} min={f.min} max={f.max} step={f.step}
                  value={forecastConfig[f.key]}
                  onChange={e => setForecastConfig({ ...forecastConfig, [f.key]: Number(e.target.value)||0 })}
                  className="bg-transparent outline-none text-4xl font-black tracking-tighter text-white w-full"
                  style={{ borderBottom:`2px solid ${ACCENT}40` }} />
              </div>
            ))}
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background:"#161616", border:"1px solid #252525" }}>
              <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color:"rgba(255,255,255,0.3)" }}>Expected Grade</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {GRADES.map(g => (
                  <button key={g} onClick={() => setForecastConfig({ ...forecastConfig, expectedGrade: g })}
                    className="px-2.5 py-1 rounded-lg text-xs font-black transition-all"
                    style={forecastConfig.expectedGrade === g
                      ? { background: ACCENT, color:"#111" }
                      : { background:"#222", color:"rgba(255,255,255,0.4)", border:"1px solid #333" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { grade:"A+", label:"Best Case",    desc:"if all remaining = A+" },
              { grade:forecastConfig.expectedGrade, label:"Your Scenario", desc:`if all remaining = ${forecastConfig.expectedGrade}`, highlight:true },
              { grade:"C",  label:"Worst Case",   desc:"if all remaining = C" },
            ].map(sc => {
              const proj = calcScenario(sc.grade);
              const cls  = classifyGpa(proj);
              return (
                <div key={sc.label} className="rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden transition-all"
                  style={{
                    background: sc.highlight ? cls.color + "12" : "#161616",
                    border: "1px solid " + (sc.highlight ? cls.color + "50" : "#252525"),
                    boxShadow: sc.highlight ? "0 0 30px " + cls.color + "18" : "none"
                  }}>
                  {sc.highlight && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse" style={{ background: cls.color }} />
                  )}
                  <span className="text-sm font-black uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.3)" }}>{sc.label}</span>
                  <p className="text-5xl font-black tracking-tighter leading-none" style={{ color: cls.color }}>{proj.toFixed(2)}</p>
                  <div>
                    <p className="text-sm font-black" style={{ color: cls.color }}>{cls.label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.25)" }}>{sc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default ForecastingSection;


