// Feature: study-timer-gamification — Stats bar component

export default function GamificationStatsBar({ level, totalXP, progressPercent, streak, totalMinutes }) {
  return (
    <div className="glass rounded-2xl p-4 border border-[#333333] mb-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Level */}
        <div className="bg-[#1a1a1a]/70 rounded-xl px-4 py-3 border border-[#333333] flex flex-col items-center">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Level</span>
          <span className="text-2xl font-black text-[#22c55e]">{level}</span>
        </div>

        {/* XP + Progress */}
        <div className="bg-[#1a1a1a]/70 rounded-xl px-4 py-3 border border-[#333333] flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">XP</span>
            <span className="text-xs font-bold text-white/60">{totalXP} xp</span>
          </div>
          <div className="w-full bg-[#333333] rounded-full h-2 mt-1">
            <div
              className="bg-[#22c55e] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-white/30 mt-1 text-right">{Math.round(progressPercent)}% to next</span>
        </div>

        {/* Streak */}
        <div className="bg-[#1a1a1a]/70 rounded-xl px-4 py-3 border border-[#333333] flex flex-col items-center">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Streak</span>
          <div className="flex items-center gap-1">
            <span className="text-xl">🔥</span>
            <span className="text-2xl font-black text-orange-400">{streak}</span>
          </div>
          <span className="text-xs text-white/30">days</span>
        </div>

        {/* Total Minutes */}
        <div className="bg-[#1a1a1a]/70 rounded-xl px-4 py-3 border border-[#333333] flex flex-col items-center">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total</span>
          <span className="text-2xl font-black text-white">{Math.round(totalMinutes)}</span>
          <span className="text-xs text-white/30">minutes</span>
        </div>
      </div>
    </div>
  );
}
