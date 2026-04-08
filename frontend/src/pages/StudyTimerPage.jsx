import { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StudyTimerPage() {
  const [inputMinutes, setInputMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  
  // Track continuous studied seconds before pausing/stopping to save accurately
  const [accStudiedSeconds, setAccStudiedSeconds] = useState(0); 
  const timerRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("acadamiX_study_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const saveSessionsToLocal = (updatedSessions) => {
    setSessions(updatedSessions);
    localStorage.setItem("acadamiX_study_sessions", JSON.stringify(updatedSessions));
  };

  const handleStart = () => {
    if (!isRunning) {
      if (!isPaused) {
        setTimeLeft(inputMinutes * 60);
        setAccStudiedSeconds(0);
      }
      setIsRunning(true);
      setIsPaused(false);
      setSessionStartTime(Date.now());
    }
  };

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      if (sessionStartTime) {
         const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
         setAccStudiedSeconds(prev => prev + Math.max(0, elapsed));
      }
      setSessionStartTime(null);
    }
  };

  const saveCurrentSession = (secondsToSave) => {
    if (secondsToSave >= 60) {
      const today = new Date().toISOString().split('T')[0];
      const newSession = {
        date: today,
        minutes: secondsToSave / 60
      };
      saveSessionsToLocal([...sessions, newSession]);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    let extra = 0;
    if (sessionStartTime && isRunning) {
        extra = Math.floor((Date.now() - sessionStartTime) / 1000);
    }
    const totalStudied = accStudiedSeconds + Math.max(0, extra);
    saveCurrentSession(totalStudied);
    setTimeLeft(inputMinutes * 60);
    setSessionStartTime(null);
    setAccStudiedSeconds(0);
  };

  const handleTimerFinish = () => {
    setIsRunning(false);
    setIsPaused(false);
    let extra = 0;
    if (sessionStartTime) {
        extra = Math.floor((Date.now() - sessionStartTime) / 1000);
    }
    const totalStudied = accStudiedSeconds + Math.max(0, extra);
    saveCurrentSession(totalStudied);
    
    // Show in-app completion popup
    setCompletedMinutes(Math.round(totalStudied / 60));
    setShowCompletionPopup(true);

    // Also send desktop notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Study Session Complete! 🎉", {
        body: "Great job! Your study time has been recorded.",
      });
    }
    
    setSessionStartTime(null);
    setAccStudiedSeconds(0);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, sessionStartTime, accStudiedSeconds]);

  // Use useEffect to keep timeLeft synced with input if not running or paused
  useEffect(() => {
      if (!isRunning && !isPaused) {
          setTimeLeft(inputMinutes * 60);
      }
  }, [inputMinutes, isRunning, isPaused]);

  // Chart data processing
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getLast7Days();
  
  const weeklyDataMap = weekDates.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  sessions.forEach(s => {
    if (weeklyDataMap[s.date] !== undefined) {
      weeklyDataMap[s.date] += s.minutes;
    }
  });

  const chartData = {
    labels: weekDates.map(d => {
       const dateObj = new Date(d);
       return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'Study Time (Minutes)',
        data: weekDates.map(d => Math.round(weeklyDataMap[d])),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    }
  };

  const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) {
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white pt-16">
      <div className="mx-auto max-w-6xl p-6 relative z-10 animate-fade-in">
        
        <div className="mb-8 flex flex-col gap-1 stagger-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            Study <span className="text-[#22c55e]">Timer</span>
          </h1>
          <p className="text-sm font-medium text-white/60">
            Track your focus sessions and analyze your study patterns
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 animate-slide-up stagger-2">
           {/* Timer Panel */}
           <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center border-[#333333] shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
             
             <div className="relative z-10 w-full flex flex-col items-center">
                 {/* Circle display */}
                 <div className="w-64 h-64 rounded-full border-8 border-[#22c55e]/20 flex items-center justify-center relative mb-8">
                     {isRunning && (
                         <div className="absolute inset-[-4px] rounded-full border-4 border-transparent border-t-[#22c55e] border-r-[#22c55e] animate-spin-slow"></div>
                     )}
                     <span className="text-6xl font-black text-white font-mono tracking-tighter shadow-sm">{formatTime(timeLeft)}</span>
                 </div>
                 
                 {/* Inputs & Controls */}
                 {!isRunning && !isPaused && (
                     <div className="flex items-center gap-3 mb-8">
                         <label className="text-sm font-bold text-white/60">Set Minutes:</label>
                         <input 
                             type="number" 
                             min="1" 
                             max="300" 
                             value={inputMinutes}
                             onChange={(e) => setInputMinutes(Number(e.target.value))}
                             className="w-20 rounded-xl border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-center text-lg font-bold text-white outline-none focus:ring-2 focus:ring-[#22c55e]"
                         />
                     </div>
                 )}

                 <div className="flex gap-4">
                     {!isRunning ? (
                         <button 
                             onClick={handleStart}
                             className="rounded-xl bg-[#22c55e] px-8 py-3 font-bold text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
                         >
                             {isPaused ? "Resume" : "Start"}
                         </button>
                     ) : (
                         <button 
                             onClick={handlePause}
                             className="rounded-xl bg-[#eab308] px-8 py-3 font-bold text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
                         >
                             Pause
                         </button>
                     )}
                     
                     {(isRunning || isPaused) && (
                         <button 
                             onClick={handleStop}
                             className="rounded-xl bg-[#ef4444] px-8 py-3 font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
                         >
                             Stop
                         </button>
                     )}
                 </div>
                 
                 {/* Manual Add Session */}
                 {(!isRunning && !isPaused) && (
                     <div className="mt-8 text-xs text-white/40">
                         Time is automatically saved when stopped or finished.
                     </div>
                 )}
             </div>
           </div>

           {/* Chart Panel */}
           <div className="glass rounded-3xl p-8 border-[#333333] shadow-lg flex flex-col justify-between relative">
             <div>
                 <h2 className="text-xl font-extrabold text-white mb-2">Weekly Analysis</h2>
                 <p className="text-sm font-medium text-white/60 mb-6">Your study time over the last 7 days</p>
             </div>
             
             <div className="flex-1 w-full flex items-center justify-center p-2 rounded-xl bg-[#1a1a1a]/50 border border-[#333333] min-h-[250px]">
                 <Bar data={chartData} options={chartOptions} />
             </div>

             <div className="mt-6 flex justify-between text-sm font-bold text-white/70">
                 <div className="bg-[#232323] rounded-xl px-4 py-2 border border-[#333333]">
                    Today: <span className="text-white text-lg ml-1">{Math.round(weeklyDataMap[weekDates[6]] || 0)}</span> min
                 </div>
                 <div className="bg-[#232323] rounded-xl px-4 py-2 border border-[#333333]">
                    Total (7d): <span className="text-[#22c55e] text-lg ml-1">{Math.round(Object.values(weeklyDataMap).reduce((a,b)=>a+b,0))}</span> min
                 </div>
             </div>
           </div>
        </div>
      </div>

      {/* Completion Popup Modal */}
      {showCompletionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
          <div className="relative bg-[#121212] border border-[#333333] rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Glow background */}
            <div className="absolute inset-0 bg-[#22c55e]/5 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Icon */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <span className="text-4xl">🎉</span>
            </div>

            {/* Text */}
            <h2 className="relative z-10 text-2xl font-extrabold text-white mb-2">Session Complete!</h2>
            <p className="relative z-10 text-white/60 text-sm font-medium mb-6">
              Great work! You studied for
            </p>
            <div className="relative z-10 text-5xl font-black text-[#22c55e] mb-1">
              {completedMinutes}
            </div>
            <div className="relative z-10 text-sm font-bold text-white/40 uppercase tracking-widest mb-8">
              minutes recorded
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                setShowCompletionPopup(false);
                setTimeLeft(inputMinutes * 60);
              }}
              className="relative z-10 w-full rounded-xl bg-[#22c55e] px-6 py-3 font-black text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
            >
              Start New Session
            </button>
            <button
              onClick={() => setShowCompletionPopup(false)}
              className="relative z-10 mt-3 text-xs text-white/40 hover:text-white transition-colors font-bold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
