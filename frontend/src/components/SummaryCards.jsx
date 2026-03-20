const Card = ({ title, value, sub, borderColor, shadowStyle, delay, glowClass }) => {
  return (
    <div
      className={`relative p-4 hover-lift animate-slide-up ${delay || ''} w-56 h-56 mx-auto rounded-full border flex flex-col items-center justify-center text-center`}
      style={{ borderColor, boxShadow: shadowStyle }}
    >
      <div className={`absolute inset-0 rounded-full blur-[40px] pointer-events-none opacity-20 ${glowClass}`}></div>
      <div className="text-sm font-bold tracking-wide uppercase text-white/50 relative z-10">{title}</div>
      <div className="mt-2 text-5xl font-black tracking-tight text-white relative z-10">{value}</div>
      {sub ? <div className="mt-2 text-xs font-bold text-white/70 relative z-10 px-2">{sub}</div> : null}
    </div>
  );
};

export default function SummaryCards({ currentGpa, targetGpa, gap }) {
  const currentVal = Number(currentGpa ?? 0);
  const targetVal = Number(targetGpa ?? 0);
  const gapVal = Number(gap ?? 0);

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Card
        title="Current GPA (Est)"
        value={currentVal.toFixed(2)}
        sub="Based on CA + baseline final"
        borderColor="rgba(239,68,68,0.4)"
        shadowStyle="inset 0 0 20px rgba(239,68,68,0.05), 0 0 30px rgba(239,68,68,0.1)"
        delay="stagger-1"
        glowClass="bg-red-500"
      />
      <Card
        title="Target GPA"
        value={targetVal.toFixed(2)}
        sub="Your goal for this semester"
        borderColor="rgba(34,197,94,0.4)"
        shadowStyle="inset 0 0 20px rgba(34,197,94,0.05), 0 0 30px rgba(34,197,94,0.1)"
        delay="stagger-2"
        glowClass="bg-green-500"
      />
      <Card
        title="Gap"
        value={(gapVal >= 0 ? `+${gapVal.toFixed(2)}` : gapVal.toFixed(2))}
        sub={gapVal <= 0 ? "You are on track 🎉" : "Improvement needed"}
        borderColor="rgba(59,130,246,0.4)"
        shadowStyle="inset 0 0 20px rgba(59,130,246,0.05), 0 0 30px rgba(59,130,246,0.1)"
        delay="stagger-3"
        glowClass="bg-[#3b82f6]"
      />
    </div>
  );
}