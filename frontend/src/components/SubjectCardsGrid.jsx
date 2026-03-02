export default function SubjectCardsGrid({
    subjects = [],
    onSimulate,
    sortBy = "priority",
    showHighRiskOnly = false,
}) {
    function getRisk(requiredFinal) {
        if (requiredFinal >= 75) return { label: "High Risk", cls: "bg-red-50 text-red-600 border-red-200/50 shadow-sm shadow-red-100" };
        if (requiredFinal >= 60) return { label: "Medium", cls: "bg-amber-50 text-amber-600 border-amber-200/50 shadow-sm shadow-amber-100" };
        return { label: "Safe", cls: "bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm shadow-emerald-100" };
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
                <h2 className="text-xl font-bold text-slate-800">All Subjects</h2>
                <div className="px-3 py-1 bg-white/60 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200/50">
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
                            className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-5 hover-lift animate-fade-in ${delayClass} backdrop-blur-[2px]`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="flex items-start justify-between gap-3 relative z-10">
                                <div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {s.subjectName}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-xl border border-slate-200/60 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                                            Credits: <span className="text-slate-900">{s.credits}</span>
                                        </span>
                                        <span className="rounded-xl border border-slate-200/60 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                                            Diff: <span className="text-slate-900">{s.difficulty}</span>
                                        </span>
                                    </div>
                                </div>

                                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${risk.cls}`}>
                                    {risk.label}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4 relative z-10">
                                <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100/50 shadow-sm text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">CA Marks</div>
                                    <div className="text-xl font-extrabold text-slate-700">{s.caMarks}</div>
                                </div>
                                <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100/50 shadow-sm text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 mb-1">Req. Final</div>
                                    <div className="text-xl font-extrabold text-blue-600">{s.requiredFinal}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => onSimulate?.(s.subjectId)}
                                className="mt-5 w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 relative z-10 shadow-sm hover:shadow"
                            >
                                Simulate
                            </button>
                        </div>
                    );
                })}

                {!filtered.length ? (
                    <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm font-medium text-slate-500 animate-fade-in">
                        No subjects match your filters.
                    </div>
                ) : null}
            </div>
        </div>
    );
}