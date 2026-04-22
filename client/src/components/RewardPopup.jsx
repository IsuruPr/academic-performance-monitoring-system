// Feature: study-timer-gamification — Reward popup component
import { ACHIEVEMENTS } from '../utils/gamificationEngine.js';

export default function RewardPopup({ result, onStartNew, onDismiss }) {
  const { xpEarned, level, streak, leveledUp, newAchievements } = result;

  const getAchievement = (id) => ACHIEVEMENTS.find((a) => a.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative bg-[#121212] border border-[#333333] rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden animate-slide-up">

        {/* Glow */}
        <div className="absolute inset-0 bg-[#22c55e]/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <span className="text-4xl">🎉</span>
        </div>

        <h2 className="relative z-10 text-2xl font-extrabold text-white mb-1">Session Complete!</h2>

        {/* XP earned */}
        <div className="relative z-10 flex items-center gap-2 mt-3 mb-2">
          <span className="text-3xl font-black text-[#22c55e]">+{xpEarned} XP</span>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-4 mt-2 mb-4">
          <div className="bg-[#1a1a1a] rounded-xl px-4 py-2 border border-[#333333] flex flex-col items-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Level</span>
            <span className="text-xl font-black text-[#22c55e]">{level}</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl px-4 py-2 border border-[#333333] flex flex-col items-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Streak</span>
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span className="text-xl font-black text-orange-400">{streak}</span>
            </div>
          </div>
        </div>

        {/* Level-up banner */}
        {leveledUp && (
          <div className="relative z-10 w-full bg-[#22c55e]/10 border border-[#22c55e]/40 rounded-xl px-4 py-3 mb-4 animate-fade-in">
            <span className="text-sm font-black text-[#22c55e] uppercase tracking-wider">⬆ Level Up! You reached Level {level}</span>
          </div>
        )}

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <div className="relative z-10 w-full mb-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">New Achievements</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {newAchievements.map((id) => {
                const ach = getAchievement(id);
                return ach ? (
                  <div key={id} className="bg-[#1a1a1a] border border-[#22c55e]/30 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">{ach.icon}</span>
                    <span className="text-xs font-bold text-white">{ach.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={onStartNew}
          className="relative z-10 w-full rounded-xl bg-[#22c55e] px-6 py-3 font-black text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
        >
          Start New Session
        </button>
        <button
          onClick={onDismiss}
          className="relative z-10 mt-3 text-xs text-white/40 hover:text-white transition-colors font-bold uppercase tracking-wider"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
