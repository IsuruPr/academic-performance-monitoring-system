import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

export default function SemesterSelect() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [semesters, setSemesters] = useState([]);
    const [selected, setSelected] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Step management: "semester" | "targetGpa"
    const [step, setStep] = useState("semester");
    const [targetGpa, setTargetGpa] = useState("3.5");
    const [gpaError, setGpaError] = useState("");

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

    function onSemesterContinue() {
        if (!selected) return;
        setStep("targetGpa");
    }

    function onFinalContinue() {
        const val = parseFloat(targetGpa);
        if (isNaN(val) || val < 0 || val > 4) {
            setGpaError("Please enter a valid GPA between 0.0 and 4.0");
            return;
        }
        setGpaError("");
        localStorage.setItem("selectedSemesterId", selected);
        localStorage.setItem("targetGpa", val.toFixed(2));
        navigate("/dashboard");
    }

    // Quick-select GPA presets
    const gpaPresets = [
        { label: "2.0", value: "2.0", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
        { label: "2.5", value: "2.5", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
        { label: "3.0", value: "3.0", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
        { label: "3.5", value: "3.5", color: "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10" },
        { label: "4.0", value: "4.0", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 font-sans">

            <div className="mx-auto w-full max-w-md pt-8 relative z-10 flex flex-col items-center">

                {/* Centered heading above card */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
                        Simple. Smart.<br /><span className="text-[#22c55e]">Success.</span>
                    </h1>
                    <p className="text-sm font-medium text-white/50 leading-relaxed">
                        Navigate your academic journey with advanced insights and intelligent semester optimization.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${step === "semester" ? "text-[#22c55e]" : "text-white/40"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === "semester" ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]" : "border-white/20 bg-white/5 text-white/40"}`}>1</span>
                        Semester
                    </div>
                    <div className="w-8 h-px bg-white/20"></div>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${step === "targetGpa" ? "text-[#22c55e]" : "text-white/40"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === "targetGpa" ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]" : "border-white/20 bg-white/5 text-white/40"}`}>2</span>
                        Target GPA
                    </div>
                </div>

                {/* Form Card */}
                <div className="w-full animate-slide-up">
                    <div className="glass rounded-3xl p-10 relative overflow-hidden shadow-2xl bg-[#1a1a1a]">

                        {/* STEP 1: Semester Select */}
                        {step === "semester" && (
                            <>
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
                                            <div
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className={`relative z-50 w-full rounded-xl border bg-[#232323] px-5 py-4 font-bold text-white outline-none cursor-pointer transition-all flex items-center justify-between hover:bg-[#2a2a2a] ${dropdownOpen ? 'border-[#22c55e] ring-1 ring-[#22c55e]' : 'border-[#333333]'}`}
                                            >
                                                <span>
                                                    {selected
                                                        ? (semesters.find((s) => s.id === selected)?.name ?? selected)
                                                        : "Choose"}
                                                </span>
                                                <svg className={`w-5 h-5 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180 text-[#22c55e]' : ''} fill-current`} viewBox="0 0 20 20">
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                                </svg>
                                            </div>

                                            {dropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                                    <div className="absolute z-50 mt-2 w-full rounded-2xl border border-[#333333] bg-[#1a1a1a] shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden origin-top scale-100 opacity-100 transition-all duration-200">
                                                        <div className="max-h-60 overflow-y-auto w-full custom-scrollbar py-2">
                                                            {semesters.map((s) => (
                                                                <div
                                                                    key={s.id}
                                                                    onClick={() => {
                                                                        setSelected(s.id);
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                    className={`px-5 py-3 cursor-pointer font-bold transition-all text-sm flex items-center gap-3
                                                                        ${selected === s.id
                                                                            ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                                                            : 'bg-transparent text-white/70 hover:bg-[#333333] hover:text-white'
                                                                        }
                                                                    `}
                                                                >
                                                                    {selected === s.id && (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
                                                                    )}
                                                                    <span className={selected !== s.id ? "ml-4" : ""}>{s.name ?? s.id}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={onSemesterContinue}
                                            className="mt-8 w-full rounded-xl bg-[#22c55e] px-6 py-4 font-black text-black shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40 hover:bg-[#16a34a] flex items-center justify-center gap-2 group transition-all uppercase tracking-widest"
                                        >
                                            Next: Set Target GPA
                                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* STEP 2: Target GPA Input */}
                        {step === "targetGpa" && (
                            <div className="animate-fade-in">
                                <button
                                    onClick={() => setStep("semester")}
                                    className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                    Back
                                </button>

                                <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Step 2 of 2</div>
                                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                                    What's your <span className="text-[#22c55e]">Target GPA?</span>
                                </h2>
                                <p className="text-sm font-medium text-white/60 mb-6">
                                    For <span className="text-white font-bold">{semesters.find(s => s.id === selected)?.name ?? selected}</span>. This drives all recommendations and required final mark calculations.
                                </p>

                                {/* GPA Presets */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {gpaPresets.map(p => (
                                        <button
                                            key={p.value}
                                            onClick={() => { setTargetGpa(p.value); setGpaError(""); }}
                                            className={`px-4 py-1.5 rounded-full border text-sm font-extrabold transition-all hover:scale-105 ${parseFloat(targetGpa) === parseFloat(p.value) ? p.color + " scale-105" : "border-white/10 text-white/50 bg-white/5 hover:bg-white/10 hover:text-white"}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {/* GPA Slider */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Target GPA</label>
                                        <span className="text-2xl font-black text-[#22c55e]">{parseFloat(targetGpa || 0).toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        value={parseFloat(targetGpa) || 0}
                                        onChange={(e) => { setTargetGpa(e.target.value); setGpaError(""); }}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-white/30 font-bold mt-1">
                                        <span>0.0</span>
                                        <span>1.0</span>
                                        <span>2.0</span>
                                        <span>3.0</span>
                                        <span>4.0</span>
                                    </div>
                                </div>

                                {/* Manual Input */}
                                <div className="relative mb-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        value={targetGpa}
                                        onChange={(e) => { setTargetGpa(e.target.value); setGpaError(""); }}
                                        placeholder="e.g. 3.5"
                                        className={`w-full rounded-xl border px-5 py-4 font-bold text-white bg-[#232323] outline-none transition-all focus:ring-1 ${gpaError ? 'border-red-500 ring-red-500' : 'border-[#333333] focus:border-[#22c55e] focus:ring-[#22c55e]'}`}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">/ 4.0</span>
                                </div>

                                {gpaError && <p className="text-red-400 text-xs font-bold mb-3 ml-1">{gpaError}</p>}

                                <button
                                    onClick={onFinalContinue}
                                    className="mt-6 w-full rounded-xl bg-[#22c55e] px-6 py-4 font-black text-black shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40 hover:bg-[#16a34a] flex items-center justify-center gap-2 group transition-all uppercase tracking-widest"
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