function ImpactBar({ value }) {
  const v = Number(value ?? 0);
  const max = 400; // just for scaling
  const pct = Math.min(100, Math.round((v / max) * 100));
  const tone =
    v < 50 ? "from-[#16A34A]/80 to-[#16A34A]" : v < 150 ? "from-[#FACC15]/80 to-[#FACC15]" : "from-[#DC2626]/80 to-[#DC2626]";

  return (
    <div className="w-full">
      <div className="h-2.5 w-full rounded-full bg-white/10 shadow-inner overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} shadow-sm transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/50">Impact: <span className="text-white/80">{v.toFixed?.(1) ?? v}</span></div>
    </div>
  );
}

export default function PriorityList({ items = [] }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-white">Study Priorities</h2>
        <span className="bg-white/10 border border-white/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/80 shadow-inner">Focus on high-impact</span>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-sm font-bold text-white/50 text-center py-4 bg-white/5 rounded-2xl border border-white/10 p-4">No priority data</div>
        ) : (
          items.map((s, idx) => {
            const delayClass = `stagger-${Math.min(idx + 1, 5)}`;
            return (
              <div key={s.subjectId ?? idx} className={`rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-lg animate-slide-in-right ${delayClass}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#0F172A] text-xs font-bold leading-none shadow-md">
                        {idx + 1}
                      </div>
                      <div className="font-extrabold text-white text-base">{s.subjectName}</div>
                      <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 border border-white/10">
                        CR: {s.credits}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-white/60 font-medium flex flex-wrap items-center gap-2">
                      <span>Required Final:</span>
                      <span className="text-lg font-extrabold text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-lg border border-[#3b82f6]/20">
                        {s.requiredFinal}
                      </span>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">
                        CA: {s.caMarks}
                      </span>
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