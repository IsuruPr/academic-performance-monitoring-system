import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

export default function SemesterSelect() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [semesters, setSemesters] = useState([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(`${API_BASE}/api/semesters`);
                if (!res.ok) throw new Error("Failed to load semesters");
                const data = await res.json();

                setSemesters(data);
                if (data?.[0]?.id) setSelected(data[0].id);
            } catch (e) {
                setErr(e.message || "Error loading semesters");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function onContinue() {
        if (!selected) return;
        localStorage.setItem("selectedSemesterId", selected);
        navigate("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                <div className="glass rounded-3xl p-8 relative overflow-hidden text-center shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>

                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Welcome to</div>
                    <h1 className="text-3xl font-extrabold text-gradient mb-2 pb-1">
                        Academic GPS
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mb-8">
                        Select your current semester to continue.
                    </p>

                    {loading ? (
                        <div className="mt-6 text-sm font-bold text-blue-600 flex items-center justify-center gap-2 animate-pulse">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-150"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-300"></div>
                        </div>
                    ) : err ? (
                        <div className="mt-6 text-sm font-bold text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100">{err}</div>
                    ) : (
                        <div className="mt-6 text-left stagger-2 animate-fade-in">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Current Semester</label>
                            <div className="relative mt-2">
                                <select
                                    className="w-full rounded-2xl border-0 bg-slate-100/80 px-4 py-3.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-inner appearance-none transition-all hover:bg-slate-200/80"
                                    value={selected}
                                    onChange={(e) => setSelected(e.target.value)}
                                >
                                    {semesters.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name ?? s.id}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>

                            <button
                                onClick={onContinue}
                                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 hover-lift flex items-center justify-center gap-2 group"
                            >
                                Access Dashboard
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}