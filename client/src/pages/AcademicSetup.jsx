import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getCurriculum, generateBlankSemesters } from "../data/curriculum";


// Quick helper to get integer value of semester for ordering
/* eslint-disable-next-line no-unused-vars */
const getSemIndex = (name) => {
  const match = name.match(/Year\s*(\d+)\s*Semester\s*(\d+)/i);
  if (!match) return 0;
  return parseInt(match[1]) * 10 + parseInt(match[2]);
};

export default function AcademicSetup({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [user, setUser] = useState(null);
  
  // Step 1: selection
  const [currentSemesterName, setCurrentSemesterName] = useState("");
  
  // Step 2: grades entry
  const [semestersData, setSemestersData] = useState([]);
  
  const [step, setStep] = useState(1);

  // All possible semesters for standard 4-year degree
  const allSemesterNames = [
    "Year 1 Semester 1", "Year 1 Semester 2",
    "Year 2 Semester 1", "Year 2 Semester 2",
    "Year 3 Semester 1", "Year 3 Semester 2",
    "Year 4 Semester 1", "Year 4 Semester 2",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // We need university and degree program from the user object
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (e) {
        if (e.response?.status === 401 && onLogout) {
          onLogout();
          navigate("/login");
        } else {
          setError("Failed to load user profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, onLogout]);

  const handleStartSetup = () => {
    if (!currentSemesterName) {
      setError("Please select your current semester.");
      return;
    }
    setError("");
    
    // Determine how many semesters they have completed (prior to current)
    const currentIdx = allSemesterNames.indexOf(currentSemesterName);
    const semestersToFill = currentIdx >= 0 ? currentIdx + 1 : 1; 
    // We allow them to fill current semester too (as ongoing)

    // Check if we have predefined curriculum
    const curriculum = getCurriculum(user?.university, user?.degreeProgram);
    
    let generatedSemesters = [];
    if (curriculum && curriculum.length > 0) {
      // take slice matching their progress
      generatedSemesters = curriculum.slice(0, semestersToFill);
      // fill missing if degree had less semesters predefined
      if (generatedSemesters.length < semestersToFill) {
         const extra = generateBlankSemesters(semestersToFill - generatedSemesters.length);
         // adjust titles
         generatedSemesters = [...generatedSemesters, ...extra.map((e, i) => {
             const name = allSemesterNames[generatedSemesters.length + i];
             return { ...e, semesterName: name };
         })];
      }
    } else {
      // Blank curriculum for unknown university
      const blank = generateBlankSemesters(semestersToFill);
      generatedSemesters = blank.map((b, i) => ({ ...b, semesterName: allSemesterNames[i] }));
    }

    setSemestersData(generatedSemesters);
    setStep(2);
  };

  const updateModule = (semIndex, modIndex, field, value) => {
    if (field === "credits") {
      const num = Number(value);
      if (value !== "" && (isNaN(num) || num < 0 || num > 300)) return;
    }
    const newData = [...semestersData];
    newData[semIndex].modules[modIndex][field] = value;
    setSemestersData(newData);
  };

  const addModule = (semIndex) => {
    const newData = [...semestersData];
    newData[semIndex].modules.push({ code: "", name: "", credits: 3, grade: "" });
    setSemestersData(newData);
  };

  const removeModule = (semIndex, modIndex) => {
    const newData = [...semestersData];
    newData[semIndex].modules.splice(modIndex, 1);
    setSemestersData(newData);
  };

  const calculateGradePoint = (grade) => {
    const scale = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "E": 0.0, "F": 0.0 };
    return scale[grade] ?? 0;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      let totalCreditsAll = 0;
      let totalPointsAll = 0;

      // Format for backend
      const formattedSemesters = semestersData.map((sem, idx) => {
        let semCredits = 0;
        let semPoints = 0;
        
        const validModules = sem.modules.filter(m => m.name.trim() !== "");
        
        validModules.forEach(m => {
          const creds = Number(m.credits) || 0;
          if (m.grade) {
             semCredits += creds;
             semPoints += (creds * calculateGradePoint(m.grade));
          }
        });

        const semGpa = semCredits > 0 ? (semPoints / semCredits) : 0;
        totalCreditsAll += semCredits;
        totalPointsAll += semPoints;

        return {
          key: `sem-${idx+1}`,
          title: sem.semesterName,
          year: sem.year || Math.ceil((idx+1)/2),
          modules: validModules,
          semesterCredits: semCredits,
          semesterGpa: semGpa,
          targetGpa: 3.5 // default target
        };
      });

      const cgpa = totalCreditsAll > 0 ? (totalPointsAll / totalCreditsAll) : 0;

      await api.put("/profile", {
        faculty: "Various",
        program: user?.degreeProgram || "Unknown",
        semesters: formattedSemesters,
        totalCredits: totalCreditsAll,
        cgpa: cgpa,
        wgpa: cgpa,
        supportTools: { habits: [], events: [], whatIfPlans: [] }
      });

      // Saving current semester preference
      const currentSemKey = `sem-${semestersData.length}`;
      localStorage.setItem("selectedSemesterId", currentSemKey);
      
      navigate("/");
    } catch (e) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#080808] p-4 text-white font-sans overflow-x-hidden pt-10 pb-20 relative">
      {/* Blurred background overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/[0.06] blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.05] blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-white/50 text-sm">
            Let's setup your academic profile for <span className="font-bold text-white/80">{user?.university}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center mb-6 font-semibold shadow-lg">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 max-w-md mx-auto shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Where are you currently at?</h2>
            
            <div className="space-y-4 mb-8">
              <label className="block text-sm font-semibold text-white/60 ml-1">Current Semester</label>
              <select 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-green-500 transition-colors font-medium appearance-none"
                value={currentSemesterName}
                onChange={e => setCurrentSemesterName(e.target.value)}
              >
                <option value="">-- Select Semester --</option>
                {allSemesterNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleStartSetup}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-extrabold uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all transform hover:scale-[1.02]"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-8">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Modules & Grades</h2>
                <p className="text-white/50 text-sm mt-1">Review the pre-filled subjects or add your own.</p>
              </div>
              <button onClick={() => setStep(1)} className="text-sm font-semibold text-white/40 hover:text-white transition-colors">
                ← Back
              </button>
            </div>

            {semestersData.map((sem, semIndex) => (
              <div key={semIndex} className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                  {sem.semesterName}
                </h3>
                
                <div className="space-y-3">
                  {/* Headers */}
                  <div className="hidden md:grid grid-cols-10 gap-3 text-xs font-bold text-white/40 uppercase tracking-widest px-2 mb-2">
                    <div className="col-span-6">Module Name</div>
                    <div className="col-span-2 text-center">Credits</div>
                    <div className="col-span-2 text-center">Grade</div>
                  </div>

                  {sem.modules.map((mod, modIndex) => (
                    <div key={modIndex} className="grid grid-cols-1 md:grid-cols-10 gap-3 items-center group bg-[#161616] p-3 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                      <div className="col-span-6">
                        <input type="text" placeholder="Module Name" value={mod.name} onChange={e => updateModule(semIndex, modIndex, 'name', e.target.value)} className="w-full bg-transparent border-b border-white/10 focus:border-green-500 px-2 py-2 text-sm text-white font-medium outline-none" />
                      </div>
                      <div className="col-span-2 flex flex-col justify-center items-center">
                        <input
                          type="number" min="0" max="300" placeholder="CR"
                          value={mod.credits || ""}
                          onChange={e => updateModule(semIndex, modIndex, 'credits', e.target.value)}
                          onBlur={e => {
                            if (e.target.value !== "") {
                              const v = Math.min(300, Math.max(0, Number(e.target.value) || 0));
                              updateModule(semIndex, modIndex, 'credits', v);
                            }
                          }}
                          className={`w-16 bg-transparent border-b px-2 py-2 text-sm text-center text-white outline-none ${Number(mod.credits) < 0 || Number(mod.credits) > 300 ? "border-red-500" : "border-white/10 focus:border-green-500"}`}
                        />
                        {(Number(mod.credits) < 0 || Number(mod.credits) > 300) && (
                          <span className="text-red-400 text-[9px] font-bold mt-0.5">0–300</span>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <select value={mod.grade} onChange={e => updateModule(semIndex, modIndex, 'grade', e.target.value)} className="w-20 bg-[#222] border border-white/10 rounded-md px-2 py-1.5 text-sm text-white outline-none focus:border-green-500 appearance-none text-center cursor-pointer">
                          <option value="">---</option>
                          {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E", "F"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => removeModule(semIndex, modIndex)} className="text-red-500/50 hover:text-red-500 bg-red-500/10 p-1.5 rounded-md transition-colors" title="Remove Module">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button onClick={() => addModule(semIndex)} className="mt-5 text-sm font-bold text-green-500/80 hover:text-green-400 flex items-center gap-1 transition-colors px-2">
                  <span>+</span> Add Custom Module
                </button>
              </div>
            ))}

            <div className="flex justify-end pt-6 border-t border-white/10">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 hover:bg-green-400 text-black font-extrabold px-10 py-4 rounded-xl shadow-[0_10px_30px_rgba(34,197,94,0.2)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest flex items-center gap-3"
              >
                {saving ? "Saving Profile..." : "Complete Setup & Enter Dashboard"}
                {!saving && <span>→</span>}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
