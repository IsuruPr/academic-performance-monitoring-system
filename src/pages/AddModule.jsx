import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createModule } from "../utils/api";

export default function AddModulePage() {
  const [moduleName, setModuleName] = useState("");
  const [credits,    setCredits]    = useState("");
  const [labWeight,  setLabWeight]  = useState(10);
  const [quizWeight, setQuizWeight] = useState(10);
  const [midWeight,  setMidWeight]  = useState(20);
  const [examWeight, setExamWeight] = useState(60);
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");
  const nav = useNavigate();

  const total    = labWeight + quizWeight + midWeight + examWeight;
  const weightOk = total === 100;

  const handleRegister = async () => {
    if (!moduleName.trim()) return setErr("Module Name is required.");
    const c = parseFloat(credits);
    if (isNaN(c) || c < 1 || c > 10) return setErr("Credits must be 1–10.");
    if (!weightOk) return setErr(`Weights must sum to 100. Current: ${total}`);
    setErr("");
    setSaving(true);
    try {
      await createModule({ moduleName: moduleName.trim(), credits: c, labWeight, quizWeight, midWeight, examWeight });
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.error || "Something went wrong.");
    } finally { setSaving(false); }
  };

  const wFields = [
    { label:"Mid-term", val:midWeight,  set:setMidWeight,  color:"bg-teal",     text:"text-teal"     },
    { label:"Lab",      val:labWeight,  set:setLabWeight,  color:"bg-primary",  text:"text-primary"  },
    { label:"Quiz",     val:quizWeight, set:setQuizWeight, color:"bg-primaryD", text:"text-primaryD" },
    { label:"Exam",     val:examWeight, set:setExamWeight, color:"bg-border2",  text:"text-border2"  },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-10 bg-white border-b border-border1 flex items-center justify-between px-4 py-4 shadow-sm">
        <button onClick={() => nav("/")}
          className="bg-surface border border-border1 text-navy font-syne font-semibold text-sm px-3.5 py-2 rounded-xl hover:border-primary hover:text-primary transition-all">
          ‹ Back
        </button>
        <span className="font-syne font-bold text-navy text-base">Add Module</span>
        <div className="w-14" />
      </div>

      <div className="text-center px-6 pt-6 pb-4">
        <div className="text-5xl mb-3">📚</div>
        <h2 className="font-syne font-extrabold text-navy text-xl tracking-tight mb-1.5">Register Module</h2>
        <p className="text-sm text-muted">Enter module details and set the mark weightage.</p>
      </div>

      <div className="mx-4 bg-surface border border-border1 rounded-2xl p-6 shadow-md shadow-primary/5">
        <label className="block text-[10px] uppercase tracking-widest text-muted mb-1.5">Module Name</label>
        <input className="w-full bg-white border border-border1 rounded-xl px-4 py-3 text-navy font-syne text-[15px] outline-none mb-4 focus:border-primary transition-colors"
          placeholder="e.g. Data Structures & Algorithms"
          value={moduleName} onChange={e => setModuleName(e.target.value)} />

        <label className="block text-[10px] uppercase tracking-widest text-muted mb-1.5">Credits</label>
        <input className="w-full bg-white border border-border1 rounded-xl px-4 py-3 text-navy font-syne text-[15px] outline-none mb-4 focus:border-primary transition-colors"
          type="number" min={1} max={10} placeholder="e.g. 4"
          value={credits} onChange={e => setCredits(e.target.value)} />

        <label className="block text-[10px] uppercase tracking-widest text-muted mb-1.5">Mark Weightage (%)</label>
        <div className="bg-surface2 border border-border1 rounded-2xl p-4 mb-4">
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
            {wFields.map(f => (
              <div key={f.label} className={`${f.color} rounded-sm transition-all duration-300`}
                style={{ width:`${f.val}%`, minWidth:2 }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {wFields.map(f => (
              <span key={f.label} className="flex items-center gap-1.5 text-[10px] text-muted">
                <span className={`inline-block w-2 h-2 rounded-sm ${f.color}`} />
                {f.label}
              </span>
            ))}
          </div>
          {wFields.map(f => (
            <div key={f.label} className="flex items-center gap-3 py-2 border-b border-border1 last:border-0">
              <span className={`inline-block w-2 h-2 rounded-sm ${f.color} flex-shrink-0`} />
              <span className="flex-1 text-[13px] text-sub">{f.label}</span>
              <input className="w-16 bg-white border border-border1 rounded-lg py-2 text-center font-mono text-navy text-[15px] outline-none focus:border-primary transition-colors"
                type="number" min={0} max={100}
                value={f.val} onChange={e => f.set(parseInt(e.target.value) || 0)} />
              <span className="text-xs text-muted w-3.5">%</span>
            </div>
          ))}
          <div className={`text-center text-xs font-bold font-mono mt-3 py-2.5 rounded-xl
            ${weightOk ? "bg-teal/10 text-tealD" : "bg-danger/10 text-danger"}`}>
            Total: {total}% {weightOk ? "✓ Ready" : `⚠ Need ${100 - total > 0 ? "+" : ""}${100 - total}`}
          </div>
        </div>

        {err && <div className="bg-danger/10 border border-danger rounded-xl px-4 py-2.5 text-sm text-danger mb-4">{err}</div>}

        <button onClick={handleRegister} disabled={saving || !weightOk}
          className="w-full bg-gradient-to-r from-primary to-teal text-white font-syne font-extrabold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {saving ? "Registering…" : "Register Module →"}
        </button>
      </div>
    </div>
  );
}