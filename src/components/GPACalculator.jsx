import { useMemo, useState } from "react";
import { Calculator, Plus, Trash2, RefreshCw, Info } from "lucide-react";
import { z } from "zod";
import { C, GRADES, GRADE_POINTS, classifyGPA, inputCls, labelCls } from "../constants";
import { apiFetch } from "../api/client";

const moduleSchema = z.object({
  name: z.string().trim().min(1, "Module name required").max(120),
  credits: z.coerce.number().finite().min(0.5).max(60),
  grade: z.enum(["A+","A","A-","B+","B","B-","C+","C","C-","D","F"]),
});

export default function GPACalculator() {
  const [modules, setModules] = useState([
    { id:1, name:"", credits:"", grade:"" },
    { id:2, name:"", credits:"", grade:"" },
    { id:3, name:"", credits:"", grade:"" },
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const addModule    = () => setModules([...modules, { id:Date.now(), name:"", credits:"", grade:"" }]);
  const removeModule = id => modules.length > 1 && setModules(modules.filter(m => m.id !== id));
  const update       = (id, field, val) => setModules(modules.map(m => m.id===id ? {...m,[field]:val} : m));

  const cleanModules = useMemo(
    () => modules.map((m) => ({ name: m.name, credits: m.credits, grade: m.grade })),
    [modules]
  );

  const calculate = async () => {
    setErrorMsg("");
    setSaveMsg("");
    setLoading(true);
    try {
      const parsed = z.array(moduleSchema).min(1).max(40).safeParse(cleanModules);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation error");
      const res = await apiFetch("/api/gpa/calculate", { method: "POST", body: { modules: parsed.data } });
      setResult({ gpa: Number(res.gpa).toFixed(2), totalCredits: res.totalCredits, modules: parsed.data.length });
    } catch (e) {
      setResult({ error: true });
      setErrorMsg(e.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setModules([
      { id:1, name:"", credits:"", grade:"" },
      { id:2, name:"", credits:"", grade:"" },
      { id:3, name:"", credits:"", grade:"" },
    ]);
    setResult(null);
    setErrorMsg("");
    setSaveMsg("");
    setSemesterName("");
  };

  const pred = result && !result.error ? classifyGPA(parseFloat(result.gpa)) : null;

  const save = async () => {
    setSaveMsg("");
    setErrorMsg("");
    setSaveLoading(true);
    try {
      const name = semesterName.trim();
      if (!name) throw new Error("Semester name is required");
      const parsed = z.array(moduleSchema).min(1).max(40).safeParse(cleanModules);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation error");
      await apiFetch("/api/gpa/semester", { method: "POST", body: { semesterName: name, modules: parsed.data } });
      setSaveMsg("Saved successfully");
    } catch (e) {
      setErrorMsg(e.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding:"28px", background:"#F0F5FB" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:C.navy, fontFamily:"Georgia,serif" }}>
            GPA Calculator
          </h1>
          <p className="text-xs mt-0.5" style={{ color:C.sub }}>
            Calculate your semester or cumulative GPA
          </p>
        </div>
        <button onClick={reset}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition hover:bg-blue-50"
          style={{ color:C.blue, border:`1px solid ${C.sky}` }}>
          <RefreshCw size={13}/> Reset
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns:"1fr 280px" }}>

        {/* Input Card */}
        <div className="rounded-2xl shadow-lg overflow-hidden" style={{ background:C.white }}>
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor:C.border }}>
            <span className="font-semibold text-sm" style={{ color:C.navy }}>Module Grades</span>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background:C.mist, color:C.blue }}>
              {modules.length} module{modules.length!==1 ? "s" : ""}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-3 px-1" style={{ gridTemplateColumns:"1fr 90px 110px 36px" }}>
              <span className={labelCls}>Module Name</span>
              <span className={labelCls}>Credits</span>
              <span className={labelCls}>Grade</span>
              <span/>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {modules.map((m, i) => (
                <div key={m.id} className="grid gap-3 items-center"
                  style={{ gridTemplateColumns:"1fr 90px 110px 36px" }}>
                  <input className={inputCls} placeholder={`Module ${i+1}`}
                    value={m.name} onChange={e => update(m.id,"name",e.target.value)}/>
                  <input type="number" min="1" max="6" className={inputCls} placeholder="3"
                    value={m.credits} onChange={e => update(m.id,"credits",e.target.value)}/>
                  <select className={inputCls} value={m.grade}
                    onChange={e => update(m.id,"grade",e.target.value)}>
                    <option value="">Grade</option>
                    {GRADES.map(g => (
                      <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>
                    ))}
                  </select>
                  <button onClick={() => removeModule(m.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                    style={{ color:modules.length>1 ? "#EF4444" : C.border }}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addModule}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition hover:bg-blue-50"
              style={{ color:C.blue, border:`1.5px dashed ${C.sky}` }}>
              <Plus size={15}/> Add Module
            </button>

            <button
              className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg"
              style={{ background:`linear-gradient(135deg,${C.navy},${C.blue})` }}
              onClick={calculate}
              disabled={loading}>
              <Calculator size={16}/> Calculate GPA
            </button>
            {errorMsg && <div className="text-xs mt-2" style={{ color:"#EF4444" }}>{errorMsg}</div>}
          </div>
        </div>

        {/* Result Panel */}
        <div className="flex flex-col gap-4">

          {/* GPA Result */}
          <div className="rounded-2xl shadow-lg p-6 text-center" style={{ background:C.white }}>
            {!result && (
              <div className="py-8">
                <Calculator size={40} color={C.border} style={{ margin:"0 auto 12px" }}/>
                <p className="text-sm font-medium" style={{ color:C.sub }}>Fill in your modules</p>
                <p className="text-xs mt-1" style={{ color:C.border }}>and click Calculate</p>
              </div>
            )}
            {result?.error && (
              <div className="py-6">
                <Info size={32} color={C.warn} style={{ margin:"0 auto 10px" }}/>
                <p className="text-sm font-semibold" style={{ color:C.warn }}>Missing data</p>
                <p className="text-xs mt-1" style={{ color:C.sub }}>Please fill credits & grades</p>
              </div>
            )}
            {result && !result.error && (
              <>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:C.sub }}>
                  Calculated GPA
                </div>
                <div className="text-6xl font-bold mb-1"
                  style={{ color:C.navy, fontFamily:"Georgia,serif" }}>
                  {result.gpa}
                </div>
                <div className="text-xs mb-4" style={{ color:C.sub }}>out of 4.00</div>
                <div className="w-full rounded-full h-3 mb-4 overflow-hidden"
                  style={{ background:"#E2E8F0" }}>
                  <div className="h-3 rounded-full transition-all duration-700"
                    style={{
                      width:`${(parseFloat(result.gpa)/4)*100}%`,
                      background:`linear-gradient(90deg,${C.sky},${C.blue})`
                    }}/>
                </div>
                <div className="flex justify-around text-xs">
                  <div>
                    <span style={{ color:C.sub }}>Modules</span><br/>
                    <strong style={{ color:C.navy }}>{result.modules}</strong>
                  </div>
                  <div>
                    <span style={{ color:C.sub }}>Credits</span><br/>
                    <strong style={{ color:C.navy }}>{result.totalCredits}</strong>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t" style={{ borderColor:C.border }}>
                  <label className={labelCls}>Save as semester</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Semester 5"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                  />
                  <button
                    className="mt-3 w-full text-sm font-semibold py-2.5 rounded-xl transition"
                    style={{ background: C.mist, color: C.blue, border: `1px solid ${C.sky}` }}
                    onClick={save}
                    disabled={saveLoading}
                  >
                    {saveLoading ? "Saving..." : "Save Semester"}
                  </button>
                  {saveMsg && <div className="text-xs mt-2" style={{ color:C.success }}>{saveMsg}</div>}
                </div>
              </>
            )}
          </div>

          {/* Prediction */}
          {pred && (
            <div className="rounded-2xl shadow-lg p-5 text-center" style={{ background:pred.bg }}>
              <div className="text-3xl mb-2">{pred.icon}</div>
              <div className="text-sm font-bold"
                style={{ color:pred.color, fontFamily:"Georgia,serif" }}>
                {pred.label}
              </div>
              <div className="text-xs mt-1" style={{ color:C.sub }}>Projected Graduation Class</div>
            </div>
          )}

          {/* Grade Scale */}
          <div className="rounded-2xl shadow-lg p-5" style={{ background:C.white }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color:C.sub }}>
              Grade Scale
            </div>
            {[
              ["A+ / A","4.0"],
              ["A-",    "3.7"],
              ["B+",    "3.3"],
              ["B",     "3.0"],
              ["B-",    "2.7"],
              ["C+ / C","2.0–2.3"],
            ].map(([g,p]) => (
              <div key={g} className="flex justify-between py-1.5 border-b last:border-0 text-xs"
                style={{ borderColor:C.border }}>
                <span style={{ color:C.slate }}>{g}</span>
                <span className="font-bold" style={{ color:C.navy }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}