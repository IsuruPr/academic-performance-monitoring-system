
function WhatIfSection({
  whatIfConfig,
  setWhatIfConfig,
  updateAssessment,
  whatIfResult,
  whatIfVisuals,
  onSaveMarks,
  isSaving,
}) {
  return (
    <section className="flex flex-col gap-10">
      {/* Insight Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-dark rounded-2xl p-6 border-blue-500/20 shadow-[0_8px_32px_rgba(59,130,246,0.05)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-blue-400 font-semibold uppercase tracking-widest text-xs mb-3 z-10">Current Mark</span>
          <strong className="text-5xl font-black text-white tracking-tighter z-10 drop-shadow-md">
            {whatIfResult.currentWeightedScore.toFixed(1)}<span className="text-2xl text-white/50">%</span>
          </strong>
        </div>
        
        <div className="glass-dark rounded-2xl p-6 border-purple-500/20 shadow-[0_8px_32px_rgba(168,85,247,0.05)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-purple-400 font-semibold uppercase tracking-widest text-xs mb-3 z-10">Remaining Weight</span>
          <strong className="text-5xl font-black text-white tracking-tighter z-10 drop-shadow-md">
            {whatIfResult.remainingWeight.toFixed(0)}<span className="text-2xl text-white/50">%</span>
          </strong>
        </div>

        <div className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg border backdrop-blur-md transition-colors ${
          whatIfResult.alreadyReached ? "bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]" : 
          whatIfResult.isImpossible ? "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : 
          "bg-white/5 border-white/10"
        }`}>
          <span className={`font-semibold uppercase tracking-widest text-xs mb-3 z-10 ${whatIfResult.alreadyReached ? "text-green-400" : whatIfResult.isImpossible ? "text-red-400" : "text-white/60"}`}>
            Required Average
          </span>
          <strong className={`text-5xl font-black tracking-tighter z-10 drop-shadow-md ${whatIfResult.alreadyReached ? "text-green-500" : whatIfResult.isImpossible ? "text-red-500" : "text-white"}`}>
            {whatIfResult.remainingWeight > 0 ? `${whatIfResult.requiredAverage.toFixed(1)}` : "Done"}<span className="text-2xl opacity-50">%</span>
          </strong>
        </div>
      </div>

      {/* Assessment List Builder */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          Assessment Breakdown
        </h3>
        {(() => {
          const totalWeight = whatIfConfig.assessments.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
          const over = totalWeight > 100;
          return (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold ${over ? "bg-red-500/10 border-red-500/30 text-red-400" : totalWeight === 100 ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/50"}`}>
              <span>Total Weight</span>
              <span>
                {totalWeight}%
                {over && " ⚠ Exceeds 100% — adjust weights before saving"}
                {totalWeight === 100 && " ✓"}
              </span>
            </div>
          );
        })()}
        <div className="grid gap-4">
          {whatIfConfig.assessments.map((assessment) => {
            const markNum = Number(assessment.mark);
            const markInvalid = assessment.completed && (isNaN(markNum) || markNum < 0 || markNum > 100);
            return (
            <div key={assessment.id} className="grid grid-cols-1 lg:grid-cols-[1fr_120px_140px_auto] gap-4 items-center p-4 rounded-2xl glass-dark border border-white/10 hover:border-blue-500/30 transition-all group">
              
              <div className="px-4 py-3 bg-black/30 border-b border-white/5 rounded-lg text-white font-medium">
                 {assessment.name}
              </div>
              
              <div className="px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold text-center">
                 {assessment.weight}<span className="text-white/40 ml-1">%</span>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assessment.mark === 0 && !assessment.completed ? "" : assessment.mark}
                  className={`w-full px-4 py-3 border focus:border-blue-500 rounded-xl font-mono outline-none transition-all pr-8 text-center bg-black/50 text-white shadow-inner font-bold ${markInvalid ? "border-red-500 focus:border-red-500" : "border-white/20"}`}
                  placeholder="Mark"
                  onChange={(event) => {
                    const val = event.target.value;
                    const num = Number(val);
                    if (val !== "" && (isNaN(num) || num < 0 || num > 100)) return;
                    updateAssessment(assessment.id, "mark", val);
                    if (!assessment.completed && val !== "") {
                      updateAssessment(assessment.id, "completed", true);
                    }
                    if (assessment.completed && val === "") {
                      updateAssessment(assessment.id, "completed", false);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value !== "") {
                      const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      updateAssessment(assessment.id, "mark", v);
                    }
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-white/40">%</span>
                {markInvalid && <p className="text-red-400 text-[10px] font-bold mt-1 text-center">0 – 100</p>}
              </div>
              
              <label className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none ${assessment.completed ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-black/30 border-white/10 text-white/50 hover:bg-white/5"}`}>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-blue-500 border-white/10 bg-black/50 cursor-pointer"
                  checked={assessment.completed}
                  onChange={(event) => updateAssessment(assessment.id, "completed", event.target.checked)}
                />
                <span className="font-bold text-sm uppercase tracking-wider">{assessment.completed ? "Done" : "Pending"}</span>
              </label>

            </div>
            );
          })}
        </div>

        {/* Save button */}
        {onSaveMarks && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onSaveMarks}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving ? "Saving..." : "Save Marks"}
            </button>
          </div>
        )}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="glass-dark rounded-3xl p-8 border hover:border-blue-500/20 transition-all flex flex-col justify-between">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            Performance Trajectory
          </h3>
          <div className="space-y-5">
            {whatIfVisuals.map((assessment) => (
              <div key={assessment.id} className="grid grid-cols-[140px_1fr_45px] gap-4 items-center">
                <span className="text-sm font-semibold truncate text-white/70" title={assessment.name}>{assessment.name || "Task"}</span>
                <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                  {assessment.completed ? (
                    <div className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: `${Math.min(100, assessment.actualMark)}%` }} />
                  ) : (
                    <div className="absolute top-0 left-0 h-full bg-linear-to-r from-orange-500/60 to-amber-400/80 rounded-full" style={{ width: `${Math.min(100, assessment.neededMark)}%` }} />
                  )}
                </div>
                <strong className={`text-sm font-mono text-right ${assessment.completed ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {assessment.completed ? `${assessment.actualMark.toFixed(0)}%` : `${assessment.neededMark.toFixed(0)}%`}
                </strong>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/10 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-cyan-400"><div className="w-3 h-3 rounded-full bg-linear-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>Actual Result</div>
            <div className="flex items-center gap-2 text-amber-500"><div className="w-3 h-3 rounded-full bg-linear-to-r from-orange-500/60 to-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>Target Needed</div>
          </div>
        </div>

        {/* AI Projection Summary */}
        <div className="glass-dark rounded-3xl p-8 border hover:border-purple-500/20 transition-all flex flex-col relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-xl font-bold mb-6 text-white z-10">AI Projection</h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-6 z-10">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
               <p className="text-lg leading-relaxed text-white/80 font-medium">
                {whatIfResult.alreadyReached
                  ? `Incredible! You have already firmly secured the target overall mark of `
                  : whatIfResult.isImpossible
                    ? `Warning: To reach `
                    : `To safely reach `}
                <span className="text-white font-black text-xl">{whatIfConfig.targetOverallMark}%</span>
                {whatIfResult.alreadyReached
                  ? ` for this module. You can focus your energy elsewhere.`
                  : whatIfResult.isImpossible
                    ? `, mathematically you would need ${whatIfResult.requiredAverage.toFixed(1)}% in the remaining assessments, which exceeds 100%. Consider adjusting your target.`
                    : ` in ${whatIfConfig.moduleName || "this module"}, you must severely lock in and average `}
                {!whatIfResult.alreadyReached && !whatIfResult.isImpossible && (
                  <span className="text-blue-400 font-bold text-xl">{whatIfResult.requiredAverage.toFixed(1)}%</span>
                )}
                {!whatIfResult.alreadyReached && !whatIfResult.isImpossible && ` across the remaining ${whatIfResult.remainingWeight.toFixed(0)}% weight.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-white/40 mb-1 font-bold">Predicted Grade</span>
                  <span className="text-2xl font-black text-white">{whatIfResult.predictedGrade}</span>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-white/40 mb-1 font-bold">Total Weight Cast</span>
                  <span className="text-2xl font-black text-white">{whatIfResult.totalWeight.toFixed(0)}%</span>
               </div>
            </div>

            {whatIfResult.nextAssessment && (
               <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-widest text-blue-400/80 font-bold mb-1">Incoming Priority</span>
                    <strong className="text-white">"{whatIfResult.nextAssessment.name || "Assessment"}"</strong> requires ≈ <span className="text-blue-400 font-black">{Math.max(0, Math.min(100, whatIfResult.requiredAverage)).toFixed(1)}%</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}

export default WhatIfSection;
