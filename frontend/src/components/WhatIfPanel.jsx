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

  const msgClass = isGood ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    isOkay ? "text-amber-600 bg-amber-50 border-amber-200" :
      "text-rose-600 bg-rose-50 border-rose-200";

  const msgIcon = isGood ? "✨" : isOkay ? "🎯" : "⚠️";

  const msgText =
    isGood ? "You are on track for the target." :
      isOkay ? "Very close — small improvement needed." :
        "Need more improvement — focus on high impact subjects.";

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden animate-slide-in-right stagger-2">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <h2 className="text-xl font-bold text-slate-800 relative z-10">What-If Simulator</h2>
      <p className="mt-2 text-sm text-slate-500 font-medium relative z-10">
        Adjust the slider to simulate a final exam mark and see its impact instantly.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 relative z-10">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Subject</label>
          <div className="relative">
            <select
              className="w-full rounded-2xl border-0 bg-slate-100/80 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-inner appearance-none transition-all hover:bg-slate-200/80"
              value={selectedSubjectId}
              onChange={(e) => onChangeSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assumed Final Mark</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={assumedFinal}
              onChange={(e) => onChangeFinal(Number(e.target.value))}
              className="w-full flex-grow mt-2"
            />
            <div className="w-16 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-500/30">
              {assumedFinal}
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-6 px-4 py-3 rounded-2xl text-sm font-bold border shadow-sm ${msgClass} flex items-center gap-3 transition-colors duration-300 relative z-10`}>
        <span className="text-xl">{msgIcon}</span>
        {msgText}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 relative z-10">
        <div className="rounded-2xl border border-slate-100 bg-white/60 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">New Current GPA</div>
          <div className="text-3xl font-black text-slate-800 transition-transform group-hover:scale-105 origin-left">{Number(liveCurrentGpa ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/60 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">New Gap</div>
          <div className={`text-3xl font-black transition-transform group-hover:scale-105 origin-left ${isGood ? 'text-emerald-500' : isOkay ? 'text-amber-500' : 'text-rose-500'}`}>
            {gapVal >= 0 ? `+${gapVal.toFixed(2)}` : gapVal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}