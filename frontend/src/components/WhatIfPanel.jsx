export default function WhatIfPanel({
  subjects = [],
  selectedSubjectId,
  assumedFinal,
  onChangeSubject,
  onChangeFinal,
  liveCurrentGpa,
  liveGap
}) {
  const gapVal = Number(liveGap ?? 0);
  const isGood = gapVal <= 0;
  const isOkay = gapVal > 0 && gapVal <= 0.3;

  const msgClass = isGood ? "text-green-300 bg-green-500/20 border-green-500/30 shadow-sm shadow-green-500/10" :
    isOkay ? "text-yellow-300 bg-yellow-500/20 border-yellow-500/30 shadow-sm shadow-yellow-500/10" :
      "text-red-300 bg-red-500/20 border-red-500/30 shadow-sm shadow-red-500/10";

  const msgIcon = isGood ? "✨" : isOkay ? "🎯" : "⚠️";

  const msgText =
    isGood ? "You are on track for the target." :
      isOkay ? "Very close — small improvement needed." :
        "Need more improvement — focus on high impact subjects.";

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden animate-slide-in-right stagger-2">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <h2 className="text-xl font-extrabold text-white relative z-10">What-If Simulator</h2>
      <p className="mt-2 text-sm text-white/60 font-medium relative z-10">
        Adjust the slider to simulate a final exam mark and see its impact instantly.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 relative z-10">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Select Subject</label>
          <div className="relative">
            <select
              className="w-full rounded-2xl border border-white/10 bg-[#0B132B] px-4 py-3 font-bold text-white outline-none focus:ring-2 focus:ring-white/30 cursor-pointer shadow-inner appearance-none transition-all hover:bg-[#0B132B]/80"
              value={selectedSubjectId}
              onChange={(e) => onChangeSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId} className="bg-[#0B132B]">
                  {s.subjectName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Assumed Final Mark</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={assumedFinal}
              onChange={(e) => onChangeFinal(Number(e.target.value))}
              className="w-full flex-grow mt-2"
            />
            <div className="w-16 h-12 flex items-center justify-center bg-white text-[#0F172A] rounded-2xl font-black text-xl shadow-lg shadow-black/30">
              {assumedFinal}
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-6 px-4 py-3 rounded-2xl text-sm font-bold border ${msgClass} flex items-center gap-3 transition-colors duration-300 relative z-10`}>
        <span className="text-xl">{msgIcon}</span>
        {msgText}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">New Current GPA</div>
          <div className="text-3xl font-black text-white transition-transform group-hover:scale-105 origin-left">{Number(liveCurrentGpa ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">New Gap</div>
          <div className={`text-3xl font-black transition-transform group-hover:scale-105 origin-left ${isGood ? 'text-green-400' : isOkay ? 'text-yellow-400' : 'text-red-400'}`}>
            {gapVal >= 0 ? `+${gapVal.toFixed(2)}` : gapVal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}