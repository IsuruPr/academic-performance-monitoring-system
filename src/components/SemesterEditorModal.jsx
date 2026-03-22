import { useMemo, useState } from "react";
import { z } from "zod";
import { X, Plus, Trash2, Save, AlertTriangle } from "lucide-react";
import { apiFetch } from "../api/client";
import { C, GRADES, inputCls, labelCls, btnPrimary, btnGhost } from "../constants";

const moduleSchema = z.object({
  name: z.string().trim().min(1, "Module name required").max(120),
  credits: z.coerce.number().finite().min(0.5).max(60),
  grade: z.enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]),
});

const schema = z.object({
  semesterName: z.string().trim().min(1, "Semester name is required").max(64),
  modules: z.array(moduleSchema).min(1, "Add at least one module").max(40),
});

export default function SemesterEditorModal({ semester, onClose, onSaved, onDeleted }) {
  const initial = useMemo(() => {
    const semName = semester?.semesterName || "";
    const mods = Array.isArray(semester?.modules) ? semester.modules : [];
    return {
      semesterName: semName,
      modules: mods.map((m) => ({
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        name: m?.name || "",
        credits: m?.credits ?? "",
        grade: m?.grade || "",
      })),
    };
  }, [semester]);

  const [semesterName, setSemesterName] = useState(initial.semesterName);
  const [modules, setModules] = useState(initial.modules.length ? initial.modules : [
    { id: String(Date.now()), name: "", credits: "", grade: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const cleanModules = useMemo(
    () => modules.map((m) => ({ name: m.name, credits: m.credits, grade: m.grade })),
    [modules]
  );

  const addModule = () =>
    setModules((ms) => [...ms, { id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), name: "", credits: "", grade: "" }]);

  const removeModule = (id) => setModules((ms) => (ms.length > 1 ? ms.filter((m) => m.id !== id) : ms));

  const update = (id, field, val) => setModules((ms) => ms.map((m) => (m.id === id ? { ...m, [field]: val } : m)));

  const save = async () => {
    setError("");
    const parsed = schema.safeParse({ semesterName, modules: cleanModules });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Validation error");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/gpa/semester", { method: "POST", body: parsed.data });
      await onSaved?.();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!semester?.semesterName) return;
    setError("");
    setDeleting(true);
    try {
      await apiFetch(`/api/gpa/semester/${encodeURIComponent(semester.semesterName)}`, { method: "DELETE" });
      await onDeleted?.();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" style={{ background: C.white }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>Edit Semester</div>
            <div className="text-xs mt-0.5" style={{ color: C.sub }}>Update credits/grades anytime</div>
          </div>
          <button
            className="w-9 h-9 rounded-lg transition hover:bg-slate-100 flex items-center justify-center"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Semester name</label>
            <input className={inputCls} value={semesterName} onChange={(e) => setSemesterName(e.target.value)} />
          </div>

          <div className="grid gap-3 px-1" style={{ gridTemplateColumns: "1fr 100px 120px 36px" }}>
            <span className={labelCls}>Module Name</span>
            <span className={labelCls}>Credits</span>
            <span className={labelCls}>Grade</span>
            <span />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {modules.map((m, i) => (
              <div key={m.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "1fr 100px 120px 36px" }}>
                <input className={inputCls} placeholder={`Module ${i + 1}`} value={m.name} onChange={(e) => update(m.id, "name", e.target.value)} />
                <input className={inputCls} type="number" min="0.5" step="0.5" placeholder="3" value={m.credits} onChange={(e) => update(m.id, "credits", e.target.value)} />
                <select className={inputCls} value={m.grade} onChange={(e) => update(m.id, "grade", e.target.value)}>
                  <option value="">Grade</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeModule(m.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  style={{ color: modules.length > 1 ? "#EF4444" : C.border }}
                  aria-label="Remove module"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addModule}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition hover:bg-blue-50"
            style={{ color: C.blue, border: `1.5px dashed ${C.sky}` }}
          >
            <Plus size={15} /> Add Module
          </button>

          {error && (
            <div className="flex items-start gap-2 text-xs p-3 rounded-xl" style={{ background: "#FEF2F2", color: "#B91C1C" }}>
              <AlertTriangle size={14} style={{ marginTop: 1 }} />
              <div>{error}</div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: C.border }}>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button
            className={btnPrimary}
            onClick={save}
            disabled={saving}
            style={{ background: saving ? "#2563EB" : undefined, opacity: saving ? 0.85 : 1 }}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition"
            style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
            onClick={del}
            disabled={deleting || !semester?.semesterName}
            title="Delete this semester"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

