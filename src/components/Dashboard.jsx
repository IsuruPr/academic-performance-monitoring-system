import { useEffect, useMemo, useState } from "react";
import { BarChart2, Award } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { C, DONUT_COLORS, classifyGPA } from "../constants";
import { apiFetch } from "../api/client";
import SemesterEditorModal from "./SemesterEditorModal";

const CustomDonutLabel = ({ cx, cy, cgpa }) => (
  <>
    <text x={cx} y={cy-10} textAnchor="middle" fill={C.navy}
      style={{ fontSize:26, fontWeight:700, fontFamily:"Georgia,serif" }}>{cgpa.toFixed(2)}</text>
    <text x={cx} y={cy+14} textAnchor="middle" fill={C.sub}
      style={{ fontSize:11, fontWeight:600, letterSpacing:1.5 }}>CGPA</text>
  </>
);

export default function Dashboard() {
  const [cardHover,  setCardHover]  = useState(false);
  const [activeSem,  setActiveSem]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gpaData, setGpaData] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const showLine = cardHover;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/gpa");
      setGpaData(data);
      const sems = Array.isArray(data?.semesters) ? data.semesters : [];
      setActiveSem((prev) => prev || sems.at(-1)?.semesterName || null);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cgpa = Number(gpaData?.cgpa || 0);
  const semesters = useMemo(
    () => (Array.isArray(gpaData?.semesters) ? gpaData.semesters : []),
    [gpaData]
  );

  const activeSemester = useMemo(
    () => semesters.find((s) => s.semesterName === activeSem) || null,
    [semesters, activeSem]
  );

  const trendData = useMemo(
    () =>
      semesters.map((s, idx) => ({
        sem: `Sem ${idx + 1}`,
        gpa: Number(s.semesterGPA || 0),
        name: s.semesterName,
      })),
    [semesters]
  );

  const totalCredits = useMemo(
    () => semesters.reduce((acc, s) => acc + Number(s.totalCredits || 0), 0),
    [semesters]
  );

  const donutData = useMemo(() => {
    const achieved = Math.max(0, Math.min(4, cgpa));
    return [
      { name: "Achieved GPA", value: achieved },
      { name: "Remaining", value: Math.max(0, 4 - achieved) },
    ];
  }, [cgpa]);

  const prediction = classifyGPA(cgpa);

  return (
    <main className="flex-1 flex flex-col" style={{ padding:"28px 28px 0 28px" }}>

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold"
                style={{ color:C.navy, fontFamily:"Georgia,serif" }}>
                Historical Analytics Dashboard
              </h1>
              <p className="text-xs mt-0.5" style={{ color:C.sub }}>
                {showLine ? "📈 GPA Trend" : "🎓 Academic Performance Overview"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
              style={{ background:C.mist, color:C.blue, border:`1px solid ${C.sky}` }}>
              <Award size={13}/> GPA: {cgpa.toFixed(2)}
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl shadow-lg p-6 mb-5" style={{ background:C.white, color:C.sub }}>
              Loading your real GPA data...
            </div>
          )}
          {error && (
            <div className="rounded-2xl shadow-lg p-6 mb-5" style={{ background:C.white, color:"#EF4444" }}>
              {error}
            </div>
          )}

          {/* Content Grid */}
          <div className="grid gap-5 flex-1" style={{ gridTemplateColumns:"1fr 220px" }}>

            {/* Chart Card */}
            <div className="rounded-2xl flex flex-col overflow-hidden shadow-lg"
              style={{ background:C.white, minHeight:340 }}>

              {/* Hoverable Header → switches Donut ↔ Line */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b cursor-pointer select-none"
                style={{
                  borderColor:C.border,
                  transition:"background 0.2s",
                  background:cardHover ? "#F8FAFF" : C.white
                }}
                onMouseEnter={() => setCardHover(true)}
                onMouseLeave={() => setCardHover(false)}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm"
                    style={{ color:cardHover ? C.blue : C.navy }}>
                    {showLine ? "GPA Trend Analysis" : "Current GPA Distribution"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: cardHover ? "#DBEAFE" : C.gray,
                      color: cardHover ? C.blue : C.sub,
                      fontSize:10
                    }}>
                    {cardHover ? "trend view ↗" : "hover to preview trend"}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background:showLine?"#FEF3C7":C.mist, color:showLine?C.warn:C.blue }}>
                  {showLine ? "Trend View" : "Donut View"}
                </span>
              </div>

              {/* Chart */}
              <div className="flex-1 flex items-center justify-center p-6" key={String(showLine)}>
                <ResponsiveContainer width="100%" height={280}>
                  {showLine ? (
                    <LineChart data={trendData} margin={{ top:10,right:20,bottom:0,left:-10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                      <XAxis dataKey="sem" tick={{ fontSize:11, fill:C.sub }}/>
                      <YAxis domain={[2.5,4.0]} tick={{ fontSize:11, fill:C.sub }}/>
                      <Tooltip
                        contentStyle={{ borderRadius:10, border:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontSize:12 }}
                        formatter={v => [v.toFixed(2),"GPA"]}/>
                      <Legend wrapperStyle={{ fontSize:11 }}/>
                      <Line type="monotone" dataKey="gpa" stroke={C.blue} strokeWidth={3}
                        dot={{ r:5, fill:C.blue, strokeWidth:2, stroke:"white" }}
                        activeDot={{ r:7 }}/>
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%"
                        innerRadius={80} outerRadius={120}
                        dataKey="value" startAngle={90} endAngle={-270}
                        labelLine={false} label={(p) => <CustomDonutLabel {...p} cgpa={cgpa} />}>
                        {donutData.map((_,i) => (
                          <Cell key={i} fill={DONUT_COLORS[i]} strokeWidth={0}/>
                        ))}
                      </Pie>
                      <Tooltip formatter={(v,n) => [v.toFixed(2),n]}/>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Cards */}
            <div className="flex flex-col gap-4">

              {/* Prediction */}
              <div className="rounded-2xl p-5 shadow-lg" style={{ background:C.white }}>
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} color={C.blue}/>
                  <span className="text-xs font-bold uppercase tracking-wide"
                    style={{ color:C.sub }}>Prediction</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-3xl mb-1">{prediction.icon}</div>
                  <div className="text-base font-bold"
                    style={{ color:prediction.color, fontFamily:"Georgia,serif" }}>
                    {prediction.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color:C.sub }}>
                    Projected Graduation Class
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor:C.border }}>
                    <div className="text-xs" style={{ color:C.sub }}>Based on CGPA</div>
                    <div className="text-xl font-bold" style={{ color:C.navy }}>3.80 / 4.00</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl p-5 shadow-lg flex-1" style={{ background:C.white }}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={16} color={C.blue}/>
                  <span className="text-xs font-bold uppercase tracking-wide"
                    style={{ color:C.sub }}>Quick Stats</span>
                </div>
                {[
                  { label:"Semesters", value:String(semesters.length) },
                  { label:"Total Credits", value:String(totalCredits) },
                  { label:"Best Sem", value:trendData.length ? trendData.reduce((a,b)=> (b.gpa>a.gpa?b:a), trendData[0]).sem : "-" },
                  { label:"Updated", value: gpaData?.updatedAt ? new Date(gpaData.updatedAt).toLocaleDateString() : "-" },
                ].map(({ label, value }) => (
                  <div key={label}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                    style={{ borderColor:C.border }}>
                    <span className="text-xs" style={{ color:C.sub }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color:C.navy }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Semester Edit */}
              <div className="rounded-2xl p-5 shadow-lg" style={{ background: C.white }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.sub }}>
                    Semester
                  </span>
                  <button
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                    style={{ background: C.mist, color: C.blue, border: `1px solid ${C.sky}` }}
                    onClick={() => setEditOpen(true)}
                    disabled={!activeSemester}
                    title={!activeSemester ? "No semester selected" : "Edit selected semester"}
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm font-semibold" style={{ color: C.navy }}>
                  {activeSemester?.semesterName || "No data"}
                </div>
                <div className="text-xs mt-1" style={{ color: C.sub }}>
                  {activeSemester ? `${activeSemester.modules?.length || 0} modules` : "Save a semester to enable editing"}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Semester Pills */}
          <div className="flex items-center gap-3 py-5">
            {(semesters.length ? semesters.map((s)=>s.semesterName) : ["Semester 1"]).slice(-3).map(s => (
              <button key={s} onClick={() => setActiveSem(s)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                style={{
                  background: activeSem===s ? C.blue  : C.white,
                  color:      activeSem===s ? "white" : C.slate,
                  border:    `1.5px solid ${activeSem===s ? C.blue : C.border}`,
                  transform:  activeSem===s ? "translateY(-2px)" : "none",
                  boxShadow:  activeSem===s ? `0 4px 14px rgba(37,99,235,0.35)` : "none",
                }}>
                {s}
              </button>
            ))}
            <div className="ml-auto text-xs px-3 py-1.5 rounded-lg"
              style={{ background:C.mist, color:C.sub }}>
              Viewing: <strong style={{ color:C.navy }}>{activeSem || "—"}</strong>
            </div>
          </div>

          {editOpen && (
            <SemesterEditorModal
              semester={activeSemester}
              onClose={() => setEditOpen(false)}
              onSaved={async () => {
                setEditOpen(false);
                await load();
              }}
              onDeleted={async () => {
                setEditOpen(false);
                setActiveSem(null);
                await load();
              }}
            />
          )}
        </main>
  );
}


