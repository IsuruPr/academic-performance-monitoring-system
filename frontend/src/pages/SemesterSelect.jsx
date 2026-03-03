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
        <div className="min-h-screen relative overflow-hidden flex items-center p-6 font-sans">
            <div className="mx-auto w-full max-w-7xl pt-24 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">

                {/* Left Column matching the reference image */}
                <div className="animate-slide-in-right text-left flex flex-col justify-center max-w-xl">
                    <h1 className="text-6xl sm:text-7xl lg:text-[5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-6 mt-12">
                        Simple.<br />Smart.<br /><span className="text-[#22c55e]">Success.</span>
                    </h1>
                    <p className="text-sm sm:text-base font-medium text-white/50 max-w-md mb-10 leading-relaxed">
                        Navigate your academic journey with advanced insights, targeted goals, and intelligent semester optimization.
                    </p>
                    <button className="rounded-lg border-2 border-[#22c55e] bg-transparent text-[#22c55e] px-8 py-4 text-sm font-bold hover:bg-[#22c55e] hover:text-black transition-all w-fit uppercase tracking-wider">
                        Explore our services
                    </button>
                </div>

                {/* Right Column: Functional Form Block inside new dark glass style */}
                <div className="w-full max-w-md mx-auto relative z-10 animate-slide-up">
                    <div className="glass rounded-3xl p-10 relative overflow-hidden shadow-2xl bg-[#1a1a1a]">

                        <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Welcome to</div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 pb-1 tracking-tight">
                            AcadamiX Dashboard
                        </h2>
                        <p className="text-sm font-medium text-white/70 mb-8">
                            Select your current semester to begin your simulation.
                        </p>

                        {loading ? (
                            <div className="mt-8 text-sm font-bold text-white flex gap-2 animate-pulse">
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                <div className="w-2.5 h-2.5 bg-white rounded-full animation-delay-150"></div>
                                <div className="w-2.5 h-2.5 bg-white rounded-full animation-delay-300"></div>
                            </div>
                        ) : err ? (
                            <div className="mt-8 text-sm font-bold text-red-200 bg-red-900/30 px-5 py-4 rounded-2xl border border-red-500/20">{err}</div>
                        ) : (
                            <div className="mt-8 text-left stagger-2 animate-fade-in">
                                <label className="text-[11px] font-bold text-white/70 ml-2">SELECT SEMESTER</label>
                                <div className="relative mt-3">
                                    <select
                                        className="w-full rounded-xl border border-[#333333] bg-[#232323] px-5 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-[#22c55e] cursor-pointer appearance-none transition-all hover:bg-[#2a2a2a]"
                                        value={selected}
                                        onChange={(e) => setSelected(e.target.value)}
                                    >
                                        <option value="" disabled className="text-[#0F172A]">Choose</option>
                                        {semesters.map((s) => (
                                            <option key={s.id} value={s.id} className="text-[#0F172A]">
                                                {s.name ?? s.id}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-white/50">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>

                                <button
                                    onClick={onContinue}
                                    className="mt-8 w-full rounded-xl bg-[#22c55e] px-6 py-4 font-black text-black shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40 hover:bg-[#16a34a] flex items-center justify-center gap-2 group transition-all uppercase tracking-widest"
                                >
                                    Access System
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}