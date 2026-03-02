export default function SummaryCards({ currentGpa, targetGpa, gap }) {
  const gapVal = Number(gap ?? 0);

  const gapTone =
    gapVal <= 0
      ? "from-emerald-500 to-green-400 text-white shadow-green-500/30"
      : gapVal <= 0.3
        ? "from-amber-400 to-orange-400 text-white shadow-orange-500/30"
        : "from-red-500 to-rose-400 text-white shadow-red-500/30";

  const Card = ({ title, value, sub, customClass, delay }) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl hover-lift animate-slide-up bg-white border border-white/40 ${customClass} ${delay}`}>
      {/* Decorative gradient orb */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

      <div className={`text-sm font-medium ${customClass ? 'text-white/80' : 'text-slate-500'}`}>{title}</div>
      <div className="mt-2 text-4xl font-bold tracking-tight">{value}</div>
      {sub ? <div className={`mt-2 text-xs font-medium ${customClass ? 'text-white/90' : 'text-slate-400'}`}>{sub}</div> : null}
    </div>
  );

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Card
        title="Current GPA (Est)"
        value={currentGpa?.toFixed?.(2) ?? currentGpa ?? "-"}
        sub="Based on CA + baseline final"
        delay="stagger-1"
      />
      <Card
        title="Target GPA"
        value={targetGpa?.toFixed?.(2) ?? targetGpa ?? "-"}
        sub="Your goal for this semester"
        delay="stagger-2"
      />
      <Card
        title="Gap"
        value={(gapVal >= 0 ? `+${gapVal.toFixed(2)}` : gapVal.toFixed(2))}
        sub={gapVal <= 0 ? "You are on track 🎉" : "Improvement needed"}
        customClass={`bg-gradient-to-br ${gapTone}`}
        delay="stagger-3"
      />
    </div>
  );
}