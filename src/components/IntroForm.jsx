import { useState } from "react";
import { BookOpen, Plus, Trash2, SkipForward, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { C, GRADES, SEMESTERS, inputCls, labelCls, btnPrimary, btnGhost } from "../constants";
import { apiFetch } from "../api/client";

const schema = z.object({
  semesterName: z.string().trim().min(1),
  modules: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Module name required").max(120),
        credits: z.coerce.number().finite().min(0.5).max(60),
        grade: z.enum(["A+","A","A-","B+","B","B-","C+","C","C-","D","F"]),
      })
    )
    .min(1, "Add at least one module"),
});

export default function IntroForm() {
  const [semester, setSemester] = useState("Semester 1");
  const [modules, setModules] = useState([{ id:1, name:"", credits:"", grade:"" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addModule    = () => setModules([...modules, { id:Date.now(), name:"", credits:"", grade:"" }]);
  const removeModule = id => modules.length > 1 && setModules(modules.filter(m => m.id !== id));
  const update       = (id, field, val) => setModules(modules.map(m => m.id===id ? {...m,[field]:val} : m));

  const saveAndGo = async () => {
    setError("");
    setLoading(true);
    try {
      const parsed = schema.safeParse({
        semesterName: semester,
        modules: modules.map((m) => ({ name: m.name, credits: m.credits, grade: m.grade })),
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation error");
      await apiFetch("/api/gpa/semester", { method: "POST", body: parsed.data });
      navigate("/app/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const skip = () => navigate("/app/dashboard", { replace: true });

  return (
    <div className="min-h-screen flex items-center justify-center py-10"
      style={{ background:"linear-gradient(160deg,#F0F7FF 0%,#E8F4FD 100%)" }}>
      <div style={{ width:"100%", maxWidth:600, padding:"0 16px" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
            style={{ background:`linear-gradient(135deg,${C.navy},${C.blue})` }}>
            <BookOpen size={20} color="white"/>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color:C.navy, fontFamily:"Georgia,serif" }}>
              Semester Information
            </h2>
            <p className="text-xs" style={{ color:C.sub }}>Enter your module data to get started</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl p-7 space-y-5" style={{ background:C.white }}>

          {/* Semester selector */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className={labelCls}>Semester</label>
              <select className={inputCls} value={semester} onChange={e => setSemester(e.target.value)}>
                {SEMESTERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-medium mb-0.5"
              style={{ background:C.mist, color:C.blue }}>
              {modules.length} module{modules.length!==1 ? "s" : ""}
            </span>
          </div>

          {/* Column labels */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 90px 100px 36px" }}>
            <span className={labelCls}>Module Name</span>
            <span className={labelCls}>Credits</span>
            <span className={labelCls}>Grade</span>
            <span/>
          </div>

          {/* Module rows */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {modules.map((m, i) => (
              <div key={m.id} className="grid gap-3 items-center"
                style={{ gridTemplateColumns:"1fr 90px 100px 36px" }}>
                <input className={inputCls} placeholder={`Module ${i+1}`}
                  value={m.name} onChange={e => update(m.id,"name",e.target.value)}/>
                <input type="number" className={inputCls} placeholder="3"
                  value={m.credits} onChange={e => update(m.id,"credits",e.target.value)}/>
                <select className={inputCls} value={m.grade}
                  onChange={e => update(m.id,"grade",e.target.value)}>
                  <option value="">Grade</option>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
                <button onClick={() => removeModule(m.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  style={{ color:modules.length>1 ? "#EF4444" : C.border }}>
                  <Trash2 size={15}/>
                </button>
              </div>
            ))}
          </div>

          {/* Add module */}
          <button onClick={addModule}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition hover:bg-blue-50"
            style={{ color:C.blue, border:`1.5px dashed ${C.sky}` }}>
            <Plus size={15}/> Add Module
          </button>

          {/* Actions */}
          {error && <div className="text-xs" style={{ color:"#EF4444" }}>{error}</div>}
          <div className="flex gap-3 pt-2">
            <button className={btnGhost+" flex-none"}
              style={{ width:"auto", padding:"0.625rem 1.5rem" }} onClick={skip}>
              <SkipForward size={15}/> Skip
            </button>
            <button className={btnPrimary} onClick={saveAndGo} disabled={loading}>
              {loading ? "Saving..." : "Continue to Dashboard"} <ChevronRight size={15}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}