import { useEffect, useMemo, useState } from "react";
import { fetchPlan, fetchWhatIf, fetchAiStudyPlan } from "../api/optimizerApi";
import ReactMarkdown from "react-markdown";
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

  // AI Plan Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPlanString, setAiPlanString] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

  const handleGenerateAiPlan = async () => {
    if (!plan) return;
    try {
      setIsGeneratingAi(true);
      setShowAiModal(true); // show modal immediately for loading state
      const data = await fetchAiStudyPlan(plan);
      setAiPlanString(data.markdown);
    } catch (e) {
      setAiPlanString("Failed to generate study plan: " + e.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
    <div className="min-h-screen relative overflow-hidden text-white pt-16">
      <div className="mx-auto max-w-6xl p-6 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 stagger-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
                Dashboard <span className="text-[#22c55e]">Overview</span>
              </h1>
              <p className="text-sm font-medium text-white/60">
                Smart plan • Priorities • Real-time simulation
              </p>
            </div>
          </div>

          {err ? <p className="text-sm font-medium text-red-400 mt-2">{err}</p> : null}
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
                ? "bg-[#22c55e] text-black border-[#22c55e] shadow-lg shadow-[#22c55e]/20 -translate-y-0.5"
                : "bg-transparent text-white/60 border-[#333333] hover:bg-[#232323] hover:text-white"
              }`}
          >
            All Subjects
          </button>

          <button
            onClick={() => setActiveTab("single")}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all duration-300
              ${activeTab === "single"
                ? "bg-[#22c55e] text-black border-[#22c55e] shadow-lg shadow-[#22c55e]/20 -translate-y-0.5"
                : "bg-transparent text-white/60 border-[#333333] hover:bg-[#232323] hover:text-white"
              }`}
          >
            Single Subject
          </button>

          <div className="ml-auto text-sm text-white/50 flex items-center">
            Semester:
            <span className="ml-2 rounded-full bg-[#232323] border border-[#333333] px-3 py-1 text-[#22c55e] font-bold">
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
                  <div className="text-sm font-bold text-white">
                    Filters & Sorting
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-[#333333] bg-[#1a1a1a] px-4 py-2 text-sm font-bold text-white shadow-sm outline-none focus:ring-2 focus:ring-[#22c55e] cursor-pointer"
                    >
                      <option value="priority" className="bg-[#1a1a1a]">Sort: Priority</option>
                      <option value="requiredFinal" className="bg-[#1a1a1a]">Sort: Required Final</option>
                      <option value="credits" className="bg-[#1a1a1a]">Sort: Credits</option>
                      <option value="difficulty" className="bg-[#1a1a1a]">Sort: Difficulty</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm font-bold text-white/70 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={showHighRiskOnly}
                        onChange={(e) => setShowHighRiskOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 cursor-pointer appearance-none checked:bg-blue-500 border"
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

              <div className="glass rounded-3xl p-6 relative overflow-hidden group border-[#333333]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>
                <h2 className="text-xl font-extrabold text-white relative z-10">
                  Quick What-If
                </h2>
                <p className="mt-2 text-sm text-white/60 font-medium relative z-10">
                  Switch to Single Subject mode to simulate exam marks and predict your GPA instantly.
                </p>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setActiveTab("single")}
                    className="flex-1 rounded-xl bg-[#232323] px-3 py-3 font-bold text-white shadow-sm border border-[#333333] hover:bg-[#333333] transition-all relative z-10 uppercase tracking-widest text-xs"
                  >
                    Simulator Mode
                  </button>
                  <button
                    onClick={handleGenerateAiPlan}
                    className="flex-1 rounded-xl bg-[#22c55e] px-3 py-3 font-bold text-black shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40 hover-lift relative z-10 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    AI Strategy ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single Subject View */}
        {activeTab === "single" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2 animate-slide-in-right">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-extrabold text-white">
                Choose a Subject
              </h2>

              <select
                className="mt-4 w-full rounded-xl border border-[#333333] bg-[#1a1a1a] px-4 py-3 font-bold text-white outline-none focus:ring-2 focus:ring-[#22c55e] cursor-pointer shadow-inner appearance-none"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                {(plan?.requiredFinals ?? []).map((s) => (
                  <option key={s.subjectId} value={s.subjectId} className="bg-[#1a1a1a]">
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
                    <div className="mt-4 text-sm text-white/50 font-bold">
                      Select a subject to view details.
                    </div>
                  );

                return (
                  <div className="mt-6 rounded-2xl bg-[#1a1a1a] border border-[#333333] p-5 shadow-sm animate-fade-in">
                    <div className="text-lg font-extrabold text-[#22c55e]">
                      {s.subjectName}
                    </div>
                    <div className="mt-4 flex gap-4 text-sm font-bold text-white/70">
                      <div className="bg-[#232323] rounded-xl px-3 py-1.5 shadow-sm border border-[#333333]">Credits: <span className="font-extrabold text-white">{s.credits}</span></div>
                      <div className="bg-[#232323] rounded-xl px-3 py-1.5 shadow-sm border border-[#333333]">Difficulty: <span className="font-extrabold text-white">{s.difficulty}</span></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-[#232323] rounded-xl p-3 shadow-sm border border-[#333333] text-center">
                        <div className="text-xs text-white/50 font-extrabold uppercase tracking-wider mb-1">CA Marks</div>
                        <div className="text-xl font-bold text-white">{s.caMarks}</div>
                      </div>
                      <div className="bg-[#22c55e]/10 rounded-xl p-3 shadow-sm border border-[#22c55e]/20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-[#22c55e]/20 rounded-full blur-xl -mr-6 -mt-6"></div>
                        <div className="text-xs text-[#22c55e]/80 font-extrabold uppercase tracking-wider mb-1 relative z-10">Required Final</div>
                        <div className="text-xl font-extrabold text-[#22c55e] relative z-10">{s.requiredFinal}</div>
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

      {/* AI Modal Overlay */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#121212] border border-[#333333] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#333333] flex justify-between items-center bg-[#1a1a1a] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/20">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">AI Action Plan</h2>
                  <p className="text-xs text-[#22c55e] font-bold uppercase tracking-widest mt-1">Generated by AcadamiX Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-white/50 hover:text-white bg-[#232323] hover:bg-[#333333] rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar flex-1">
              {isGeneratingAi ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 border-4 border-[#333333] border-t-[#22c55e] rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing your profile...</h3>
                  <p className="text-[#a3a3a3]">Synthesizing priority requirements and generating your tailored strategy.</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-green max-w-none 
                  prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl 
                  prose-strong:text-[#22c55e] prose-a:text-[#22c55e] hover:prose-a:text-white
                  prose-ul:border-l-2 prose-ul:border-[#333333] prose-ul:pl-4
                  prose-li:marker:text-[#22c55e] prose-hr:border-[#333333]
                  prose-p:text-[#d4d4d4] prose-p:leading-relaxed">
                  <ReactMarkdown>{aiPlanString}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#333333] bg-[#1a1a1a] flex justify-end shrink-0">
              <button
                onClick={() => setShowAiModal(false)}
                className="rounded-lg bg-[#22c55e] px-6 py-2.5 font-bold text-black shadow-sm transition-all hover:bg-[#16a34a] uppercase tracking-wider text-sm"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}