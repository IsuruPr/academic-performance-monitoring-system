import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden p-6 font-sans selection:bg-[#22c55e] selection:text-black">
      
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
              
              {/* Box 1 (Wide) */}
              <div className="md:col-span-2 relative p-10 glass-dark hover:border-[#22c55e]/50 transition-colors group flex flex-col justify-end">
                 <div className="absolute top-0 right-0 p-10 text-[#22c55e] opacity-20 group-hover:opacity-100 transition-opacity">
                   <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                 </div>
                 <h3 className="text-4xl font-black text-white mb-3 relative z-10 tracking-tight">AI Performance Optimization</h3>
                 <p className="text-white/50 font-medium relative z-10 text-xl max-w-lg leading-relaxed text-balance">Our neural engine analyzes your credit history and study intervals to recommend actionable steps.</p>
              </div>

              {/* Box 2 (Tall-ish) */}
              <div className="relative p-10 glass-dark hover:border-blue-500/50 transition-colors flex flex-col items-center justify-center text-center group">
                 <div className="w-20 h-20 rounded-full bg-blue-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Study Sessions</h3>
                 <p className="text-base text-white/50 font-medium">Deep work timers engineered for 100% focus.</p>
              </div>

              {/* Box 3 */}
              <div className="relative p-10 glass-dark hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center text-center group">
                 <div className="w-20 h-20 rounded-full bg-purple-500/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Data Analytics</h3>
                 <p className="text-base text-white/50 font-medium">Crystal clear visualizations of your trajectory.</p>
              </div>

               {/* Box 4 (Wide) */}
               <div className="md:col-span-2 relative p-10 glass-dark hover:border-rose-500/50 transition-colors group">
                 <div className="absolute inset-0 bg-linear-to-r from-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="flex flex-col h-full justify-center lg:w-2/3 relative z-10">
                   <h3 className="text-4xl font-black text-white mb-3 tracking-tight">GPA Forecasting</h3>
                   <p className="text-white/50 font-medium text-xl leading-relaxed text-balance">Input target grades, predict distinct outcomes dynamically, and take control of your graduation metrics before it's too late.</p>
                 </div>
                 <div className="absolute right-[-10%] bottom-[-20%] w-[350px] h-[350px] text-rose-500/10 group-hover:text-rose-500/20 transition-colors pointer-events-none">
                     <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
