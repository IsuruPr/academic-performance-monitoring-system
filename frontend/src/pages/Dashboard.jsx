import { useEffect, useMemo, useState } from "react";
import { fetchPlan, fetchWhatIf } from "../api/optimizerApi";
import SummaryCards from "../components/SummaryCards";
import PriorityList from "../components/PriorityList";
import WhatIfPanel from "../components/WhatIfPanel";
import SubjectCardsGrid from "../components/SubjectCardsGrid";
import { useNavigate } from "react-router-dom";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const semesterId = localStorage.getItem("selectedSemesterId");

  const [sortBy, setSortBy] = useState("priority"); // priority | requiredFinal | credits | difficulty
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  const [activeTab, setActiveTab] = useState("all"); // "all" | "single"
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [plan, setPlan] = useState(null);

  // What-if UI state
  const [assumedFinal, setAssumedFinal] = useState(60);

  // Live output after what-if
  const [liveCurrentGpa, setLiveCurrentGpa] = useState(null);
  const [liveGap, setLiveGap] = useState(null);

  // ✅ Redirect if no semester selected
  useEffect(() => {
    if (!semesterId) navigate("/select-semester");
  }, [semesterId, navigate]);

  // Load plan on mount (semester-only)
  useEffect(() => {
    if (!semesterId) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchPlan(semesterId);
        setPlan(data);

        // set default subject for what-if
        const first = data?.requiredFinals?.[0];
        if (first?.subjectId) setSelectedSubjectId(first.subjectId);

        setLiveCurrentGpa(data.currentGpa);
        setLiveGap(data.gap);
      } catch (e) {
        setErr(e.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    })();
  }, [semesterId]);

  const subjectsForSelect = useMemo(() => {
    if (!plan?.requiredFinals) return [];
    return plan.requiredFinals.map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
    }));
  }, [plan]);

  // Trigger what-if when subject or assumedFinal changes
  useEffect(() => {
    if (!semesterId || !plan || !selectedSubjectId) return;

    const timer = setTimeout(async () => {
      try {
        const data = await fetchWhatIf({
          semesterId,
          subjectId: selectedSubjectId,
          assumedFinal,
        });

        setLiveCurrentGpa(data.currentGpa);
        setLiveGap(data.gap);
        setPlan(data);
      } catch (e) {
        setErr(e.message || "What-if failed");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedSubjectId, assumedFinal, semesterId]); // ✅ avoid loops

  if (!semesterId) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  if (err && !plan) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-red-600 font-medium">Error</div>
          <div className="mt-2 text-sm text-slate-600">{err}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl p-6 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 stagger-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gradient mb-1">
                Academic GPS
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Smart plan • Priorities • Real-time simulation
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("selectedSemesterId");
                navigate("/select-semester");
              }}
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-md hover-lift transition-all"
            >
              Change Semester
            </button>
          </div>

          {err ? <p className="text-sm font-medium text-red-500 mt-2">{err}</p> : null}
        </div>

        {/* Summary */}
        <SummaryCards
          currentGpa={liveCurrentGpa ?? plan?.currentGpa}
          targetGpa={plan?.targetGpa}
          gap={liveGap ?? plan?.gap}
        />

        {/* Tabs */}
        <div className="mt-8 flex gap-3 animate-slide-up stagger-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all duration-300
              ${activeTab === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "bg-white/80 text-slate-600 border-white/40 hover:bg-white hover:shadow-md backdrop-blur-sm"
              }`}
          >
            All Subjects
          </button>

          <button
            onClick={() => setActiveTab("single")}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all duration-300
              ${activeTab === "single"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "bg-white/80 text-slate-600 border-white/40 hover:bg-white hover:shadow-md backdrop-blur-sm"
              }`}
          >
            Single Subject
          </button>

          <div className="ml-auto text-sm text-slate-500 flex items-center">
            Semester:
            <span className="ml-2 rounded-full bg-white border border-slate-200 px-3 py-1">
              {semesterId}
            </span>
          </div>
        </div>

        {/* All Subjects View */}
        {activeTab === "all" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2 animate-slide-up stagger-5">
            <div className="space-y-8">
              {/* Filters */}
              <div className="glass rounded-3xl p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-bold text-slate-700">
                    Filters & Sorting
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-2xl border-0 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm cursor-pointer"
                    >
                      <option value="priority">Sort: Priority</option>
                      <option value="requiredFinal">Sort: Required Final</option>
                      <option value="credits">Sort: Credits</option>
                      <option value="difficulty">Sort: Difficulty</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={showHighRiskOnly}
                        onChange={(e) => setShowHighRiskOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      High Risk Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Subject Cards Grid */}
              <SubjectCardsGrid
                subjects={plan?.requiredFinals ?? []}
                sortBy={sortBy}
                showHighRiskOnly={showHighRiskOnly}
                onSimulate={(subjectId) => {
                  setSelectedSubjectId(subjectId);
                  setActiveTab("single");
                }}
              />
            </div>

            <div className="space-y-8">
              <PriorityList items={plan?.priority ?? []} />

              <div className="glass rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <h2 className="text-xl font-bold text-slate-800 relative z-10">
                  Quick What-If
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-medium relative z-10">
                  Switch to Single Subject mode to simulate exam marks and predict your GPA instantly.
                </p>
                <button
                  onClick={() => setActiveTab("single")}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-offset hover:shadow-indigo-500/40 hover-lift relative z-10"
                >
                  Open Simulator ✨
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Single Subject View */}
        {activeTab === "single" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2 animate-slide-in-right">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-bold text-slate-800">
                Choose a Subject
              </h2>

              <select
                className="mt-4 w-full rounded-2xl border-0 bg-slate-50/50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-inner"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                {(plan?.requiredFinals ?? []).map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.subjectName}
                  </option>
                ))}
              </select>

              {(() => {
                const s = (plan?.requiredFinals ?? []).find(
                  (x) => x.subjectId === selectedSubjectId
                );
                if (!s)
                  return (
                    <div className="mt-4 text-sm text-slate-500">
                      Select a subject to view details.
                    </div>
                  );

                return (
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100 p-5 shadow-sm animate-fade-in">
                    <div className="text-lg font-bold text-slate-800">
                      {s.subjectName}
                    </div>
                    <div className="mt-4 flex gap-4 text-sm font-medium text-slate-600">
                      <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm">Credits: <span className="font-bold text-slate-800">{s.credits}</span></div>
                      <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm">Difficulty: <span className="font-bold text-slate-800">{s.difficulty}</span></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100/50 text-center">
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">CA Marks</div>
                        <div className="text-xl font-bold text-slate-800">{s.caMarks}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-blue-100 rounded-full blur-xl -mr-6 -mt-6"></div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 relative z-10">Required Final</div>
                        <div className="text-xl font-bold text-blue-600 relative z-10">{s.requiredFinal}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <WhatIfPanel
              subjects={subjectsForSelect}
              selectedSubjectId={selectedSubjectId}
              assumedFinal={assumedFinal}
              onChangeSubject={setSelectedSubjectId}
              onChangeFinal={setAssumedFinal}
              liveCurrentGpa={liveCurrentGpa ?? plan?.currentGpa}
              liveGap={liveGap ?? plan?.gap}
            />
          </div>
        )}

        <div className="mt-12 animate-slide-up stagger-5">
          <AnalyticsCharts plan={plan} />
        </div>
      </div>
    </div>
  );
}