import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-16 p-6 font-sans selection:bg-[#22c55e] selection:text-black animate-fade-in">
      
      <div className="max-w-6xl mx-auto relative z-10 pt-20 lg:pt-32 pb-12 flex flex-col items-center">
        {/* Typographic Hero */}
        <div className="text-center max-w-5xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 stagger-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-widest uppercase">AcadamiX V2.0 Engine Live</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black text-white leading-[1.05] mb-8 tracking-tighter stagger-2 drop-shadow-2xl">
            Redefine Your<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#22c55e] via-green-400 to-emerald-200">
              Future.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-medium max-w-3xl mx-auto leading-relaxed mb-12 stagger-3 text-balance">
            The hyper-intelligent operating system for your academics. Uncover hidden insights, master time management, and push your GPA to its absolute limit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 stagger-4 w-full sm:w-auto">
            <button
              onClick={() => navigate("/select-semester")}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-[#22c55e] text-black font-extrabold text-lg hover:bg-[#1fb355] hover:scale-[1.03] transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3 uppercase tracking-widest group"
            >
              Initialize System
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>

        {/* Bento Box Features Grid */}
        <div className="w-full mt-32 stagger-5 relative z-10 px-2 lg:px-0">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
              <div 
                onClick={() => navigate("/forecasting")}
                className="md:col-span-2 relative p-10 glass-dark cursor-pointer hover:border-[#22c55e]/50 transition-all hover:-translate-y-1 group flex flex-col justify-end"
              >
                 <div className="absolute top-0 right-0 p-10 text-[#22c55e] opacity-20 group-hover:opacity-100 transition-opacity">
                   <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                 </div>
                 <h3 className="text-4xl font-black text-white mb-3 relative z-10 tracking-tight">History Prediction</h3>
                 <p className="text-white/50 font-medium relative z-10 text-xl max-w-lg leading-relaxed text-balance">Track and forecast your academic trajectory using advanced neural data modeling.</p>
              </div>

              {/* Card 2: CA Analyzer */}
              <div 
                onClick={() => navigate("/whatif")}
                className="relative p-10 glass-dark cursor-pointer hover:border-blue-500/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center text-center group"
              >
                 <div className="w-20 h-20 rounded-full bg-blue-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">CA Analyzer</h3>
                 <p className="text-base text-white/50 font-medium">Deep-dive into continuous assessments.</p>
              </div>

              {/* Card 3: Risk Analyzer */}
              <div 
                onClick={() => navigate("/risk-analyzer")}
                className="relative p-10 glass-dark hover:border-orange-500/50 cursor-pointer transition-colors flex flex-col items-center justify-center text-center group"
              >
                 <div className="w-20 h-20 rounded-full bg-orange-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Risk Analyzer</h3>
                 <p className="text-base text-white/50 font-medium">Identify modules where you are most at risk.</p>
              </div>

              {/* Card 4: Habit Tracker */}
              <div 
                onClick={() => navigate("/warnings")}
                className="relative p-10 glass-dark cursor-pointer hover:border-purple-500/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center text-center group"
              >
                 <div className="w-20 h-20 rounded-full bg-purple-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Habit Tracker</h3>
                 <p className="text-base text-white/50 font-medium">Consistent study routines built for focus.</p>
              </div>

               {/* Card 5: Final Marks Analyzer */}
               <div 
                onClick={() => navigate("/final-analyzer")}
                className="relative p-10 glass-dark hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-1 flex flex-col items-center justify-center text-center group"
              >
                 <div className="absolute inset-0 bg-linear-to-r from-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-inherit pointer-events-none"></div>
                 <div className="w-20 h-20 rounded-full bg-rose-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                   <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Final Marks Analyzer</h3>
                 <p className="text-base text-white/50 font-medium group-hover:text-rose-400 transition-colors relative z-10">Click to analyze desired end goals & select semester.</p>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
