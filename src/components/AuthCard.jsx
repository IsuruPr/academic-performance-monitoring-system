import { useMemo, useState } from "react";
import { LogIn, UserPlus, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { C, UNIVERSITIES, SEMESTERS, inputCls, inputErrorCls, labelCls, btnPrimary } from "../constants";
import { apiFetch, setToken, setUser } from "../api/client";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[A-Za-z ]+$/, "Name cannot contain numbers or symbols")
  .refine((v) => !v.includes("@"), "Name cannot contain @");

const emailSchema = z.string().trim().email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  university: z.string().trim().min(1, "Select university"),
  semester: z.string().trim().min(1, "Select semester"),
});

export default function AuthCard() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", university: "", semester: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const activeSchema = useMemo(() => (mode === "login" ? loginSchema : signupSchema), [mode]);

  const validation = useMemo(() => activeSchema.safeParse(form), [activeSchema, form]);
  const fieldErrors = useMemo(() => {
    if (validation.success) return {};
    const out = {};
    for (const issue of validation.error.issues) {
      const key = issue.path?.[0];
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }, [validation]);

  const showError = (field) => Boolean(touched[field] && fieldErrors[field]);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const submit = async () => {
    setServerError("");
    setTouched((t) => ({
      ...t,
      name: true,
      email: true,
      password: true,
      university: true,
      semester: true,
    }));
    setLoading(true);
    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation error");
        const res = await apiFetch("/api/auth/login", { method: "POST", body: parsed.data });
        setToken(res.token || "");
        setUser(res.user || null);
        navigate("/app/dashboard", { replace: true });
      } else {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation error");
        const res = await apiFetch("/api/auth/register", {
          method: "POST",
          body: {
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            university: parsed.data.university,
            currentSemester: parsed.data.semester,
          },
        });
        setToken(res.token || "");
        setUser(res.user || null);
        navigate("/onboarding", { replace: true });
      }
    } catch (e) {
      setServerError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:"linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 50%,#E0E7FF 100%)" }}>

      <div style={{ position:"fixed",top:-80,left:-80,width:320,height:320,borderRadius:"50%",background:"rgba(37,99,235,0.08)",pointerEvents:"none" }}/>
      <div style={{ position:"fixed",bottom:-60,right:-60,width:260,height:260,borderRadius:"50%",background:"rgba(99,102,241,0.07)",pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, padding:"0 16px" }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ background:`linear-gradient(135deg,${C.navy},${C.blue})` }}>
            <GraduationCap size={32} color="white"/>
          </div>
          <h1 className="text-2xl font-bold" style={{ color:C.navy, fontFamily:"Georgia,serif" }}>
            Academic Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color:C.sub }}>Historical GPA Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden" style={{ background:C.white }}>

          {/* Tabs */}
          <div className="flex">
            {["login","signup"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-3.5 text-sm font-semibold transition"
                style={{
                  background: mode===m ? C.white : C.mist,
                  color: mode===m ? C.blue : C.sub,
                  borderBottom: mode===m ? `2px solid ${C.blue}` : `2px solid ${C.border}`
                }}>
                {m==="login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-7 space-y-4">
            {mode === "signup" && (
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={`${inputCls} ${showError("name") ? inputErrorCls : ""}`}
                  placeholder="e.g. Kamal Perera"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                />
                {showError("name") && <div className="text-xs mt-1" style={{ color: "#EF4444" }}>{fieldErrors.name}</div>}
              </div>
            )}

            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                className={`${inputCls} ${showError("email") ? inputErrorCls : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
              {showError("email") && <div className="text-xs mt-1" style={{ color: "#EF4444" }}>{fieldErrors.email}</div>}
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={`${inputCls} ${showError("password") ? inputErrorCls : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              />
              {showError("password") && <div className="text-xs mt-1" style={{ color: "#EF4444" }}>{fieldErrors.password}</div>}
            </div>

            {mode==="signup" && <>
              <div>
                <label className={labelCls}>University</label>
                <select
                  className={`${inputCls} ${showError("university") ? inputErrorCls : ""}`}
                  value={form.university}
                  onChange={(e) => setField("university", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, university: true }))}
                >
                  <option value="">Select your university</option>
                  {UNIVERSITIES.map(u => <option key={u}>{u}</option>)}
                </select>
                {showError("university") && <div className="text-xs mt-1" style={{ color: "#EF4444" }}>{fieldErrors.university}</div>}
              </div>
              <div>
                <label className={labelCls}>Current Semester</label>
                <select
                  className={`${inputCls} ${showError("semester") ? inputErrorCls : ""}`}
                  value={form.semester}
                  onChange={(e) => setField("semester", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, semester: true }))}
                >
                  <option value="">Select current semester</option>
                  {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </select>
                {showError("semester") && <div className="text-xs mt-1" style={{ color: "#EF4444" }}>{fieldErrors.semester}</div>}
              </div>
            </>}

            <div className="pt-2 space-y-3">
              {serverError && <div className="text-xs" style={{ color:"#EF4444" }}>{serverError}</div>}
              <button className={btnPrimary} onClick={submit} disabled={loading}>
                {mode==="login" ? <LogIn size={16}/> : <UserPlus size={16}/>}
                {loading ? "Please wait..." : (mode==="login" ? "Sign In" : "Create Account")}
              </button>
              <p className="text-center text-xs" style={{ color:C.sub }}>
                {mode==="login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setMode(mode==="login" ? "signup" : "login")}
                  className="font-semibold" style={{ color:C.blue }}>
                  {mode==="login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color:C.sub }}>
          ITPM Project · Member 01 · Historical Analytics
        </p>
      </div>
    </div>
  );
}