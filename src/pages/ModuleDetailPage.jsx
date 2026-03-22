import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getModule, postMarks } from "../utils/api";

function gradeToGPA(pct) {
  if (pct >= 90) return 4.0; if (pct >= 80) return 3.7;
  if (pct >= 75) return 3.3; if (pct >= 70) return 3.0;
  if (pct >= 65) return 2.7; if (pct >= 60) return 2.3;
  if (pct >= 55) return 2.0; if (pct >= 50) return 1.7;
  return 0.0;
}
function gpaLabel(gpa) {
  if (gpa >= 3.7) return "First Class";   if (gpa >= 3.3) return "Upper Second";
  if (gpa >= 3.0) return "Lower Second";  if (gpa >= 2.0) return "Pass";
  return "Below Pass";
}
function calculateCAMark(mod, marks) {
  const lab  = (parseFloat(marks.labMark)  || 0) * mod.labWeight  / 100;
  const quiz = (parseFloat(marks.quizMark) || 0) * mod.quizWeight / 100;
  const mid  = (parseFloat(marks.midMark)  || 0) * mod.midWeight  / 100;
  return Math.round((lab + quiz + mid) * 100) / 100;
}
function calculateExamNeeded(target, ca, examW) {
  return Math.round(((target - ca) / (examW / 100)) * 100) / 100;
}

export default function ModuleDetailPage() {
  const { id } = useParams();
  const nav    = useNavigate();
  const [mod,         setMod]         = useState(null);
  const [labMark,     setLabMark]     = useState("");
  const [quizMark,    setQuizMark]    = useState("");
  const [midMark,     setMidMark]     = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  const load = useCallback(async () => {
    const r = await getModule(id);
    setMod(r.data);
    if (r.data.marks) {
      setLabMark(r.data.marks.labMark       ?? "");
      setQuizMark(r.data.marks.quizMark     ?? "");
      setMidMark(r.data.marks.midMark       ?? "");
      setTargetGrade(r.data.marks.targetGrade ?? "");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!mod) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-border1 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const tg         = parseFloat(targetGrade) || 75;
  const currentCA  = calculateCAMark(mod, { labMark, quizMark, midMark });
  const examNeeded = calculateExamNeeded(tg, currentCA, mod.examWeight);
  const gpaImpact  = gradeToGPA(tg);
  const examStatus = examNeeded > 100 ? "unreachable" : examNeeded <= 0 ? "secured" : "achievable";

  const examColorClass = examStatus==="unreachable" ? "text-danger" : examStatus==="secured" ? "text-teal" : "text-primary";
  const examBgClass    = examStatus==="unreachable" ? "bg-danger/10 border-danger/40" : examStatus==="secured" ? "bg-teal/10 border-teal/40" : "bg-primary/10 border-primary/40";
  const examDisplay    = examStatus==="unreachable" ? "⚠ Unreachable" : examStatus==="secured" ? "✓ Secured" : `${examNeeded}%`;

  const handleSave = async () => {
    setSaving(true);
    try {
      await postMarks({ moduleId: id, labMark: parseFloat(labMark)||null, quizMark: parseFloat(quizMark)||null, midMark: parseFloat(midMark)||null, targetGrade: tg });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const inputs = [
    { label:"Lab Mark",      val:labMark,  set:setLabMark,  weight:mod.labWeight,  colorBar:"bg-primary",  colorText:"text-primary"  },
    { label:"Quiz Mark",     val:quizMark, set:setQuizMark, weight:mod.quizWeight, colorBar:"bg-teal",     colorText:"text-teal"     },
    { label:"Mid-term Mark", val:midMark,  set:setMidMark,  weight:mod.midWeight,  colorBar:"bg-primaryD", colorText:"text-primaryD" },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-10 bg-white border-b border-border1 flex items-center justify-between px-4 py-4 shadow-sm">
        <button onClick={() => nav("/")}
          className="bg-surface border border-border1 text-navy font-syne font-semibold text-sm px-3.5 py-2 rounded-xl hover:border-primary hover:text-primary transition-all">
          ‹ Back
        </button>
        <span className="font-syne font-bold text-navy text-base truncate max-w-[180px]">{mod.moduleName}</span>
        <div className="bg-surface2 border border-border1 text-primaryD font-mono text-xs font-bold px-3 py-1 rounded-full">{mod.credits} Cr</div>
      </div>

      <div className="flex justify-around mx-4 mt-3 mb-1 bg-surface border border-border1 rounded-2xl py-3 shadow-sm">
        {[{l:"Lab",v:`${mod.labWeight}%`,c:"text-primary"},{l:"Quiz",v:`${mod.quizWeight}%`,c:"text-teal"},{l:"Mid",v:`${mod.midWeight}%`,c:"text-primaryD"},{l:"Exam",v:`${mod.examWeight}%`,c:"text-border2"}].map(({l,v,c})=>(
          <div key={l} className="flex flex-col items-center gap-0.5">
            <span className={`font-mono font-extrabold text-base ${c}`}>{v}</span>
            <span className="text-[9px] text-muted uppercase tracking-wider">{l}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">📊 Live Outputs</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-3 text-center">
            <div className="text-xl mb-1">🎯</div>
            <div className="font-mono font-extrabold text-primaryD text-lg">{currentCA}%</div>
            <div className="text-[9px] text-muted uppercase tracking-wide mt-1">Current CA</div>
            <div className="text-[9px] text-muted">of {mod.labWeight+mod.quizWeight+mod.midWeight}%</div>
          </div>
          <div className={`border rounded-2xl p-3 text-center ${examBgClass}`}>
            <div className="text-xl mb-1">📝</div>
            <div className={`font-mono font-extrabold ${examColorClass} ${examDisplay.length>6?"text-sm":"text-lg"}`}>{examDisplay}</div>
            <div className="text-[9px] text-muted uppercase tracking-wide mt-1">Exam Needed</div>
            <div className={`text-[9px] ${examColorClass}`}>{examStatus==="unreachable"?"Can't reach":examStatus==="secured"?"On track!":"Min score"}</div>
          </div>
          <div className="bg-tealD/10 border border-tealD/30 rounded-2xl p-3 text-center">
            <div className="text-xl mb-1">🏆</div>
            <div className="font-mono font-extrabold text-tealD text-lg">{gpaImpact}</div>
            <div className="text-[9px] text-muted uppercase tracking-wide mt-1">GPA Impact</div>
            <div className="text-[9px] text-muted">{gpaLabel(gpaImpact)}</div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 bg-surface border border-border1 rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-bold text-primaryD mb-3">📐 Gap Formula</div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="bg-surface2 border border-border1 rounded-xl px-3 py-1.5 text-xs text-sub font-mono">(Target − CA)</span>
          <span className="text-muted text-base">÷</span>
          <span className="bg-surface2 border border-border1 rounded-xl px-3 py-1.5 text-xs text-sub font-mono">Exam Weight</span>
          <span className="text-muted text-base">=</span>
          <span className={`font-mono font-extrabold text-lg ${examColorClass}`}>{examDisplay}</span>
        </div>
        <div className="text-xs font-mono bg-surface2 rounded-xl px-3 py-2 text-muted">
          ({tg} − {currentCA}) ÷ {mod.examWeight/100} = <span className={`font-bold ${examColorClass}`}>{examDisplay}</span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-1">
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">✏️ CA Marks Entry</div>
      </div>
      <div className="mx-4 bg-surface border border-border1 rounded-2xl overflow-hidden shadow-sm">
        {inputs.map(({ label, val, set, weight, colorBar, colorText }) => {
          const contrib = val!==""?`+${((parseFloat(val)||0)/100*weight).toFixed(1)}%`:"—";
          const pct = Math.min(parseFloat(val)||0, 100);
          return (
            <div key={label} className="px-4 pt-4 pb-3 border-b border-border1 last:border-0 relative">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${colorBar} flex-shrink-0`} />
                <div>
                  <div className="font-syne font-bold text-navy text-[14px]">{label}</div>
                  <div className="text-[10px] text-muted">Weight: {weight}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input className="flex-1 bg-white border border-border1 rounded-xl px-4 py-3 text-navy font-mono text-lg outline-none focus:border-primary transition-colors"
                  type="number" min={0} max={100} placeholder="0–100"
                  value={val} onChange={e => set(e.target.value)} />
                <span className="text-xs text-muted">/100</span>
                <span className={`font-mono font-bold text-xs w-14 text-right ${val!==""?colorText:"text-muted"}`}>{contrib}</span>
              </div>
              {val!==""&&(
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border1">
                  <div className={`h-full ${colorBar} transition-all duration-500`} style={{ width:`${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
        <div className="px-4 pt-4 pb-3 bg-primary/5">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-border2 flex-shrink-0" />
            <div>
              <div className="font-syne font-bold text-navy text-[14px]">Target Grade</div>
              <div className="text-[10px] text-muted">Total % you want to achieve</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input className="flex-1 bg-white border border-border1 rounded-xl px-4 py-3 text-navy font-mono text-lg outline-none focus:border-border2 transition-colors"
              type="number" min={0} max={100} placeholder="e.g. 75"
              value={targetGrade} onChange={e => setTargetGrade(e.target.value)} />
            <span className="text-xs text-muted">%</span>
            <span className="font-mono font-bold text-xs w-14 text-right text-border2">
              {targetGrade!==""?`GPA ${gradeToGPA(parseFloat(targetGrade))}`:"—"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-gradient-to-r from-primary to-teal text-white font-syne font-extrabold text-[15px] py-4 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50 transition-all">
          {saving?"Saving…":saved?"✓ Saved!":"Save Marks"}
        </button>
      </div>
    </div>
  );
}