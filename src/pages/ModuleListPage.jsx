import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllModules, deleteModule } from "../utils/api";

export default function ModuleListPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = useCallback(async () => {
    try {
      const r = await getAllModules();
      setModules(r.data.modules);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this module?")) return;
    await deleteModule(id);
    load();
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center justify-between px-5 pt-7 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center font-syne font-extrabold text-white text-lg shadow-lg shadow-primary/30">
            GE
          </div>
          <div>
            <div className="font-syne font-extrabold text-xl text-navy tracking-tight">Gap Engine</div>
            <div className="text-[10px] text-muted tracking-wide mt-0.5">CA Tracker & Exam Planner</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal tracking-widest bg-teal/10 border border-teal/25 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-2 pb-2 text-[10px] uppercase tracking-widest text-muted">
        <span>My Modules</span>
        <span className="w-2 h-2 rounded-full bg-primary" />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-2 border-border1 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && modules.length === 0 && (
        <div className="mx-4 text-center bg-surface border border-dashed border-border1 rounded-2xl p-10">
          <div className="text-5xl mb-3">📚</div>
          <p className="font-bold text-navy mb-1">No modules yet</p>
          <p className="text-sm text-muted">Tap "+ Add Module" to get started</p>
        </div>
      )}

      <div className="flex flex-col gap-2.5 px-4">
        {modules.map(mod => {
          const s = mod.stats;
          const examColor = !s ? "text-muted"
            : s.examStatus === "unreachable" ? "text-danger"
            : s.examStatus === "secured"     ? "text-teal"
            : "text-primary";
          const examDisplay = !s ? "—"
            : s.examStatus === "unreachable" ? "⚠ Unreachable"
            : s.examStatus === "secured"     ? "✓ Secured"
            : `${s.examNeeded}%`;

          return (
            <div key={mod._id}
              onClick={() => nav(`/module/${mod._id}`)}
              className="flex items-stretch bg-surface border border-border1 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary hover:translate-x-1 hover:shadow-md hover:shadow-primary/10">
              <div className="w-1 bg-gradient-to-b from-primary to-teal flex-shrink-0" />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <div className="font-syne font-bold text-navy text-[15px] mb-0.5">{mod.moduleName}</div>
                    <div className="text-[10px] text-muted">
                      {mod.credits} Cr · Lab {mod.labWeight}% · Quiz {mod.quizWeight}% · Mid {mod.midWeight}% · Exam {mod.examWeight}%
                    </div>
                  </div>
                  <button onClick={e => handleDelete(e, mod._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted text-xs border border-transparent hover:border-danger hover:text-danger hover:bg-danger/10 transition-all">
                    ✕
                  </button>
                </div>
                {s ? (
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-muted uppercase tracking-wider">Current CA</span>
                      <span className="font-mono text-primaryD font-bold text-[13px]">{s.currentCA}%</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-muted uppercase tracking-wider">Exam Needed</span>
                      <span className={`font-mono font-bold text-[13px] ${examColor}`}>{examDisplay}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-muted uppercase tracking-wider">GPA Impact</span>
                      <span className="font-mono text-tealD font-bold text-[13px]">{s.gpaImpact}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted italic">Tap to enter CA marks →</p>
                )}
              </div>
              <div className="text-border2 text-2xl flex items-center pr-3">›</div>
            </div>
          );
        })}
      </div>

      <button onClick={() => nav("/add")}
        className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-teal text-white font-syne font-extrabold text-[15px] px-10 py-4 rounded-full shadow-xl shadow-primary/40 hover:scale-105 transition-all duration-200 whitespace-nowrap z-50">
        + Add Module
      </button>
    </div>
  );
}