function ImpactBar({ value }) {
  const v = Number(value ?? 0);
  const max = 400; // just for scaling
  const pct = Math.min(100, Math.round((v / max) * 100));
  const tone =
    v < 50 ? "from-emerald-400 to-green-500" : v < 150 ? "from-amber-400 to-orange-400" : "from-red-400 to-rose-500";

  return (
    <div className="w-full">
      <div className="h-2.5 w-full rounded-full bg-slate-100 shadow-inner overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} shadow-sm transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Impact: <span className="text-slate-600">{v.toFixed?.(1) ?? v}</span></div>
    </div>
  );
}

export default function PriorityList({ items = [] }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Study Priorities</h2>
        <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-inner">Focus on high-impact</span>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-sm font-medium text-slate-500 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 p-4">No priority data</div>
        ) : (
          items.map((s, idx) => {
            const delayClass = `stagger-${Math.min(idx + 1, 5)}`;
            return (
              <div key={s.subjectId ?? idx} className={`rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md animate-slide-in-right ${delayClass}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold leading-none shadow-md">
                        {idx + 1}
                      </div>
                      <div className="font-bold text-slate-800 text-base">{s.subjectName}</div>
                      <span className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200/50">
                        CR: {s.credits}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 font-medium">
                      Required Final: <span className="text-lg font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 ml-1">{s.requiredFinal}</span>
                      <span className="ml-3 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">CA: {s.caMarks}</span>
                    </div>
                  </div>

                  <div className="sm:w-56 w-full pt-2 sm:pt-0">
                    <ImpactBar value={s.impactScore} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}