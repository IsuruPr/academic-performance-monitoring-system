export default function SubjectCardsGrid({
    subjects = [],
    onSimulate,
    sortBy = "priority",
    showHighRiskOnly = false,
}) {
    function getRisk(requiredFinal) {
        if (requiredFinal >= 75) return { label: "High Risk", cls: "bg-red-500/10 text-red-500 border-red-500/20 shadow-sm" };
        if (requiredFinal >= 60) return { label: "Medium", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-sm" };
        return { label: "Safe", cls: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 shadow-sm" };
    }

    const sorted = [...subjects].sort((a, b) => {
        if (sortBy === "requiredFinal") return (b.requiredFinal ?? 0) - (a.requiredFinal ?? 0);
        if (sortBy === "credits") return (b.credits ?? 0) - (a.credits ?? 0);
        if (sortBy === "difficulty") return (b.difficulty ?? 0) - (a.difficulty ?? 0);
        if (a.priorityScore != null && b.priorityScore != null) return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
        return (b.requiredFinal ?? 0) - (a.requiredFinal ?? 0);
    });

    const filtered = showHighRiskOnly
        ? sorted.filter((s) => (s.requiredFinal ?? 0) >= 75)
        : sorted;

    return (
        <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white">All Subjects</h2>
                <div className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs font-bold text-[#a3a3a3] shadow-sm border border-[#333333]">
                    {filtered.length} subjects
                </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {filtered.map((s, idx) => {
                    const risk = getRisk(s.requiredFinal ?? 0);
                    const delayClass = `stagger-${Math.min(idx + 1, 5)}`;

                    return (
                        <div
                            key={s.subjectId}
                            className={`relative overflow-hidden rounded-2xl border border-[#333333] bg-[#1a1a1a] p-5 hover-lift animate-fade-in ${delayClass} shadow-lg group hover:bg-[#232323]`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>

                            <div className="flex items-start justify-between gap-3 relative z-10">
                                <div>
                                    <div className="text-lg font-extrabold text-white">
                                        {s.subjectName}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-xl border border-[#333333] bg-[#232323] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] shadow-sm">
                                            Credits: <span className="text-white">{s.credits}</span>
                                        </span>
                                        <span className="rounded-xl border border-[#333333] bg-[#232323] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] shadow-sm">
                                            Diff: <span className="text-white">{s.difficulty}</span>
                                        </span>
                                    </div>
                                </div>

                                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${risk.cls}`}>
                                    {risk.label}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4 relative z-10">
                                <div className="rounded-xl bg-[#232323] p-3 border border-[#333333] shadow-sm text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3] mb-1">CA Marks</div>
                                    <div className="text-xl font-extrabold text-white">{s.caMarks}</div>
                                </div>
                                <div className="rounded-xl bg-[#22c55e]/10 p-3 border border-[#22c55e]/20 shadow-sm text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]/80 mb-1">Req. Final</div>
                                    <div className="text-xl font-extrabold text-[#22c55e]">{s.requiredFinal}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => onSimulate?.(s.subjectId)}
                                className="mt-5 w-full rounded-xl bg-[#22c55e] border border-[#22c55e] px-4 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#16a34a] relative z-10 shadow-sm hover:shadow uppercase tracking-wider"
                            >
                                Simulate
                            </button>
                        </div>
                    );
                })}

                {!filtered.length ? (
                    <div className="col-span-full rounded-2xl border-2 border-dashed border-[#333333] bg-[#1a1a1a] p-8 text-center text-sm font-medium text-[#a3a3a3] animate-fade-in">
                        No subjects match your filters.
                    </div>
                ) : null}
            </div>
        </div>
    );
}