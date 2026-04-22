import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import WhatIfSection from "../components/WhatIfSection";
import CAGraphComparison from "../components/CAGraphComparison";

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

export default function WhatIfPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [step, setStep] = useState("setup"); // "setup" | "analyzer"
  const [analyzerTab, setAnalyzerTab] = useState("analysis"); // "analysis" | "graphs"
  
  const [activeModules, setActiveModules] = useState([]);
  
  const [whatIfConfig, setWhatIfConfig] = useState({
    id: `whatif-${Date.now()}`,
    moduleName: defaultAssessmentPlanner.moduleName,
    targetOverallMark: defaultAssessmentPlanner.targetOverallMark,
    assessments: defaultAssessmentPlanner.assessments,
  });
  const [whatIfPlans, setWhatIfPlans] = useState([]);

  // Auto-switch planner if they change modules from the UI
  const handleModuleChange = (newModuleName) => {
    // try to find an existing plan for this module
    const existingPlan = whatIfPlans.find(p => p.moduleName === newModuleName);
    if (existingPlan) {
      setWhatIfConfig(existingPlan);
    } else {
      // create a fresh template for it
      setWhatIfConfig({
        id: `whatif-${Date.now()}`,
        moduleName: newModuleName,
        targetOverallMark: 80,
        assessments: [
          { id: 1, name: "Assignment 1", weight: 20, mark: 0, completed: false },
          { id: 2, name: "Mid Exam", weight: 30, mark: 0, completed: false },
          { id: 3, name: "Final Exam", weight: 50, mark: 0, completed: false },
        ],
      });
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        
        const plans = data.supportTools?.whatIfPlans?.length ? data.supportTools.whatIfPlans : [];
        setWhatIfPlans(plans);

        const activeSemId = localStorage.getItem("selectedSemesterId");
        let modulesToUse = [];
        if (data.semesters?.length) {
          const sem = data.semesters.find(s => s.key === activeSemId) || data.semesters[0];
          modulesToUse = sem.modules || [];
          setActiveModules(modulesToUse);
        }

        // Auto-select the first available module if no module is specifically chosen yet
        if (modulesToUse.length > 0) {
           const firstModuleName = modulesToUse[0].code ? `${modulesToUse[0].code} - ${modulesToUse[0].name}` : modulesToUse[0].name;
           
           const existing = plans.find(p => p.moduleName === firstModuleName);
           if (existing) {
             setWhatIfConfig(existing);
           } else {
             setWhatIfConfig(prev => ({ ...prev, moduleName: firstModuleName }));
           }
        }
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

  const whatIfResult = useMemo(() => {
    const currentWeightedScore = whatIfConfig.assessments.reduce((sum, assessment) => {
      if (!assessment.completed) return sum;
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

    if (finalProjection >= 90) predictedGrade = "A+";
    else if (finalProjection >= 80) predictedGrade = "A";
    else if (finalProjection >= 75) predictedGrade = "A-";
    else if (finalProjection >= 70) predictedGrade = "B+";
    else if (finalProjection >= 65) predictedGrade = "B";
    else if (finalProjection >= 60) predictedGrade = "B-";
    else if (finalProjection >= 55) predictedGrade = "C+";
    else if (finalProjection >= 45) predictedGrade = "C";
    else if (finalProjection >= 40) predictedGrade = "C-";
    else if (finalProjection >= 35) predictedGrade = "D+";
    else if (finalProjection >= 30) predictedGrade = "D";
    else predictedGrade = "E";

    return {
      currentWeightedScore,
      remainingWeight,
      requiredAverage,
      totalWeight,
      predictedGrade,
      isImpossible,
      alreadyReached,
      nextAssessment: whatIfConfig.assessments.find((assessment) => !assessment.completed) || null,
    };
  }, [whatIfConfig.assessments, whatIfConfig.targetOverallMark]);

  // ── Auto-save to CA marks table whenever marks change (debounced 1.2s) ──
  const autoSaveTimer = useRef(null);
  const autoSaveCaRecord = useCallback((config, result) => {
    if (!config.id || !config.moduleName) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const activeSemId = localStorage.getItem("selectedSemesterId") || "";
        await api.put("/profile/ca-marks", {
          id: config.id,
          moduleName: config.moduleName,
          semesterKey: activeSemId,
          targetOverallMark: config.targetOverallMark,
          assessments: config.assessments,
          currentScore: result.currentWeightedScore,
          predictedGrade: result.predictedGrade,
        });
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      } catch (_) { /* silent */ }
    }, 1200);
  }, []);

  useEffect(() => {
    autoSaveCaRecord(whatIfConfig, whatIfResult);
    return () => clearTimeout(autoSaveTimer.current);
  }, [whatIfConfig, whatIfResult, autoSaveCaRecord]);

  const whatIfVisuals = useMemo(() => {    const target = Number(whatIfConfig.targetOverallMark) || 0;
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

  const addAssessment = () => {
    setWhatIfConfig(prev => ({
      ...prev,
      assessments: [
        ...prev.assessments,
        { id: Date.now(), name: "New Assessment", weight: 10, mark: 0, completed: false }
      ]
    }));
  };

  const updateAssessment = (id, field, rawValue) => {
    let value = rawValue;
    if (field === "weight" || field === "mark") {
      const num = Number(rawValue);
      if (rawValue !== "" && (isNaN(num) || num < 0 || num > 100)) return;
    }
    setWhatIfConfig(prev => ({
      ...prev,
      assessments: prev.assessments.map(acc => acc.id === id ? { ...acc, [field]: value } : acc)
    }));
  };

  const removeAssessment = (id) => {
    setWhatIfConfig(prev => ({
      ...prev,
      assessments: prev.assessments.filter(acc => acc.id !== id)
    }));
  };

  const saveWhatIfPlan = async () => {
    setSaving(true);
    try {
      const newPlan = { ...whatIfConfig, id: whatIfConfig.id || `whatif-${Date.now()}`, updatedAt: new Date().toISOString() };
      
      const updatedPlans = whatIfConfig.id 
        ? whatIfPlans.map(p => p.id === whatIfConfig.id ? newPlan : p) 
        : [...whatIfPlans, newPlan];
        
      setWhatIfPlans(updatedPlans);
      
      // Save whatif plans
      try {
        await api.put("/profile/whatif", { whatIfPlans: updatedPlans });
      } catch (e) {
        // Ignore API save errors for unauthenticated users
      }

      // Save to CA marks table
      try {
        const activeSemId = localStorage.getItem("selectedSemesterId") || "";
        const caRecord = {
          id: newPlan.id,
          moduleName: newPlan.moduleName,
          semesterKey: activeSemId,
          targetOverallMark: newPlan.targetOverallMark,
          assessments: newPlan.assessments,
          currentScore: whatIfResult.currentWeightedScore,
          predictedGrade: whatIfResult.predictedGrade,
        };
        await api.put("/profile/ca-marks", caRecord);
      } catch (e) {
        // Non-critical — don't block the user
      }

      setWhatIfConfig(newPlan);
    } finally {
      setSaving(false);
    }
  };

  const loadWhatIfPlan = (plan) => {
    setWhatIfConfig(plan);
  };

  const deleteWhatIfPlan = async (id) => {
    const updatedPlans = whatIfPlans.filter(p => p.id !== id);
    setWhatIfPlans(updatedPlans);
    try {
      await api.put("/profile/whatif", { whatIfPlans: updatedPlans });
    } catch (e) {
      // Ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white pt-16 flex items-center justify-center">
        <div className="rounded-3xl border border-[#333333] bg-[#1a1a1a] p-10 shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#333333] border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Loading analyzer…</div>
        </div>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-start justify-center p-6 font-sans pt-24">
        <div className="mx-auto w-full max-w-4xl relative z-10 flex flex-col animate-fade-in">
          
          <button
              onClick={() => navigate("/")}
              className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold w-fit"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
          </button>

          <div className="glass-dark rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] bg-gradient-to-b from-[#1a1a1a] to-[#111] w-full border border-white/5 hover:border-blue-500/20 transition-all duration-500">
            {/* Background glowing orb */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                  Module <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Configuration</span>
              </h2>
              <p className="text-base font-medium text-white/50 mb-10 max-w-xl leading-relaxed">
                  Select your module and map out its precise assessment breakdown. This structure will serve as the foundation for your projections.
              </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <label className="flex flex-col gap-3 font-bold text-white/90 flex-1">
                <span className="text-xs tracking-widest uppercase text-blue-400 font-bold">Target Module</span>
                {activeModules.length > 0 ? (
                  <div className="relative">
                    <select
                      value={whatIfConfig.moduleName}
                      onChange={(e) => handleModuleChange(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-white/5 font-bold text-lg text-white bg-black/40 outline-none transition-all focus:border-blue-500 focus:bg-black/60 focus:ring-1 focus:ring-blue-500/50 cursor-pointer appearance-none shadow-inner"
                    >
                      {activeModules.map((m) => {
                        const label = m.code ? `${m.code} - ${m.name}` : m.name;
                        return <option key={label} value={label} className="bg-[#1a1a1a]">{label}</option>;
                      })}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={whatIfConfig.moduleName}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 font-bold text-lg text-white bg-black/40 outline-none transition-all focus:border-blue-500 focus:bg-black/60 shadow-inner"
                    placeholder="e.g. Mathematics"
                  />
                )}
              </label>

              <label className="flex flex-col gap-3 font-bold text-white/90 flex-1 md:max-w-[200px]">
                <span className="text-xs tracking-widest uppercase text-cyan-400 font-bold">Target Mark (%)</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={whatIfConfig.targetOverallMark}
                    onChange={(e) => setWhatIfConfig({ ...whatIfConfig, targetOverallMark: Number(e.target.value) || 0 })}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 font-black text-2xl text-white bg-black/40 outline-none transition-all focus:border-cyan-500 focus:bg-black/60 focus:ring-1 focus:ring-cyan-500/50 shadow-inner"
                  />
                </div>
              </label>
            </div>

            <div className="border-t border-white/5 pt-10 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                  Assessment Structure
                </h3>
                <button 
                  type="button" 
                  onClick={addAssessment}
                  className="px-5 py-2.5 rounded-xl font-bold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500 hover:text-black text-blue-400 text-sm transition-all shadow-sm group flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"></path></svg>
                  Add Item
                </button>
              </div>

              <div className="grid gap-4">
                {whatIfConfig.assessments.map((assessment) => {
                  const weightNum = Number(assessment.weight);
                  const weightInvalid = assessment.weight !== "" && (isNaN(weightNum) || weightNum < 0 || weightNum > 100);
                  return (
                  <div key={assessment.id} className="flex flex-col sm:flex-row gap-4 items-center p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
                    <input
                      type="text"
                      value={assessment.name}
                      placeholder="Assessment Name"
                      onChange={(e) => updateAssessment(assessment.id, "name", e.target.value)}
                      className="flex-1 px-5 py-4 bg-black/40 border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:bg-black/60 rounded-xl text-white font-bold outline-none w-full transition-colors placeholder-white/20"
                    />
                    <div className="relative w-full sm:w-36">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assessment.weight}
                        placeholder="Weight"
                        onChange={(e) => updateAssessment(assessment.id, "weight", e.target.value)}
                        onBlur={(e) => {
                          const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                          updateAssessment(assessment.id, "weight", v);
                        }}
                        className={`w-full px-5 py-4 bg-black/40 border rounded-xl text-white font-mono font-bold outline-none pr-10 text-center transition-colors ${weightInvalid ? "border-red-500 focus:border-red-500" : "border-white/5 focus:border-blue-500"}`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">%</span>
                      {weightInvalid && <p className="text-red-400 text-[10px] font-bold mt-1 text-center">0 – 100</p>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeAssessment(assessment.id)}
                      className="w-full sm:w-14 h-14 flex items-center justify-center rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all hover:scale-105"
                      title="Remove Assessment"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Total weight indicator */}
            {(() => {
              const totalWeight = whatIfConfig.assessments.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
              const over = totalWeight > 100;
              return (
                <div className={`flex items-center justify-between px-5 py-3 rounded-xl border mt-2 mb-2 ${over ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
                  <span className={`text-sm font-bold ${over ? "text-red-400" : "text-white/60"}`}>Total Weight</span>
                  <span className={`text-lg font-black ${over ? "text-red-400" : totalWeight === 100 ? "text-green-400" : "text-white"}`}>
                    {totalWeight}%
                    {over && <span className="ml-2 text-xs font-bold text-red-400">⚠ Exceeds 100%</span>}
                    {totalWeight === 100 && <span className="ml-2 text-xs font-bold text-green-400">✓</span>}
                  </span>
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {(() => {
                const totalWeight = whatIfConfig.assessments.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
                const over = totalWeight > 100;
                return (
                  <button
                      onClick={async () => {
                        if (over) return;
                        await saveWhatIfPlan();
                        setStep("analyzer");
                      }}
                      disabled={saving || over}
                      title={over ? "Total weight exceeds 100%. Please adjust." : ""}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-5 font-black text-black shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3 group"
                  >
                      {saving ? "Saving Configuration..." : "Save & Proceed to Dashboard"}
                      {!saving && <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                  </button>
                );
              })()}
            </div>
            </div>
          </div>

          {/* Saved Subject Plans Grid */}
          <div className="mt-12 space-y-6 animate-slide-up stagger-2">
            <h3 className="text-xl font-bold text-white px-2">Saved Configurations</h3>
            {whatIfPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatIfPlans.map((plan) => (
                  <div key={plan.id} className="glass border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 transition-all flex flex-col group bg-black/40">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <strong className="text-lg font-bold text-white block mb-1">{plan.moduleName}</strong>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{new Date(plan.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 font-mono text-xs">
                        {plan.targetOverallMark}%
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2 pt-4 border-t border-white/10">
                      <button 
                        type="button" 
                        onClick={() => {
                          loadWhatIfPlan(plan);
                          setStep("analyzer");
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-black hover:bg-blue-400 transition-all text-xs uppercase"
                      >
                        Launch
                      </button>
                      <button 
                        type="button" 
                        onClick={() => deleteWhatIfPlan(plan.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all focus:outline-none"
                        title="Delete Plan"
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-white/5 border-dashed text-center text-white/40 font-medium bg-black/20">
                No active module configurations cached.
              </div>
            )}
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-16 p-6 font-sans text-white selection:bg-blue-500 selection:text-black animate-fade-in">
      <div className="max-w-6xl mx-auto relative z-10 pt-10 pb-12">

        {/* Page Header */}
        <div className="mb-8 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-xl">
            Continuous Assessment <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-blue-400 to-cyan-200">Analyzer</span>
          </h1>
          <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto text-balance">
            Track your assignments and simulate what marks you need precisely to secure an A or pass the module safely.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-bold">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-3 mb-6 animate-slide-up stagger-2">
          <button
            onClick={() => setAnalyzerTab("analysis")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all duration-300 ${
              analyzerTab === "analysis"
                ? "bg-blue-500 text-black border-blue-500 shadow-lg shadow-blue-500/20 -translate-y-0.5"
                : "bg-transparent text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Analysis
          </button>

          <button
            onClick={() => setAnalyzerTab("graphs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all duration-300 ${
              analyzerTab === "graphs"
                ? "bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20 -translate-y-0.5"
                : "bg-transparent text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Graph Comparison
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest border border-cyan-400/20">NEW</span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {autoSaved && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                Saved
              </span>
            )}
            <button
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white/40 border border-white/10 hover:text-white hover:bg-white/5 transition-all outline-none flex items-center gap-2"
              onClick={() => setStep("setup")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Config
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {analyzerTab === "analysis" && (
          <div className="glass-dark rounded-3xl p-8 mb-8 animate-fade-in border-[#333333]">
            <WhatIfSection
              whatIfConfig={whatIfConfig}
              setWhatIfConfig={setWhatIfConfig}
              updateAssessment={updateAssessment}
              whatIfResult={whatIfResult}
              whatIfVisuals={whatIfVisuals}
              isSaving={saving}
              onSaveMarks={async () => {
                setSaving(true);
                try {
                  const activeSemId = localStorage.getItem("selectedSemesterId") || "";
                  await api.put("/profile/ca-marks", {
                    id: whatIfConfig.id,
                    moduleName: whatIfConfig.moduleName,
                    semesterKey: activeSemId,
                    targetOverallMark: whatIfConfig.targetOverallMark,
                    assessments: whatIfConfig.assessments,
                    currentScore: whatIfResult.currentWeightedScore,
                    predictedGrade: whatIfResult.predictedGrade,
                  });
                  setAutoSaved(true);
                  setTimeout(() => setAutoSaved(false), 2000);
                } catch (_) { /* silent */ } finally {
                  setSaving(false);
                }
              }}
            />
          </div>
        )}

        {analyzerTab === "graphs" && (
          <div className="glass-dark rounded-3xl p-8 mb-8 animate-fade-in border border-white/5">
            <CAGraphComparison
              whatIfConfig={whatIfConfig}
              whatIfVisuals={whatIfVisuals}
              whatIfResult={whatIfResult}
            />
          </div>
        )}

      </div>
    </div>
  );
}
