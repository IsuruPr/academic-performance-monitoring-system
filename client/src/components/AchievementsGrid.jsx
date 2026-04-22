// Feature: study-timer-gamification — Achievements grid component
import { ACHIEVEMENTS } from '../utils/gamificationEngine.js';

export default function AchievementsGrid({ unlockedIds }) {
  return (
    <div className="glass rounded-3xl p-6 border border-[#333333] mt-8">
      <h2 className="text-xl font-extrabold text-white mb-1">Achievements</h2>
      <p className="text-sm text-white/40 mb-5">Unlock badges by reaching study milestones</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 flex flex-col items-center text-center border transition-all ${
                unlocked
                  ? 'bg-[#1a1a1a] border-[#22c55e]/30 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
                  : 'bg-[#111111] border-[#2a2a2a] opacity-40'
              }`}
            >
              <span className="text-3xl mb-2">{unlocked ? ach.icon : '🔒'}</span>
              <span className={`text-xs font-bold leading-tight ${unlocked ? 'text-white' : 'text-white/50'}`}>
                {ach.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
