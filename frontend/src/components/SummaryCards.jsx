export default function SummaryCards({ currentGpa, targetGpa, gap }) {
  const currentVal = Number(currentGpa ?? 0);
  const targetVal = Number(targetGpa ?? 0);
  const gapVal = Number(gap ?? 0);

  const isDanger = currentVal < targetVal;
  const currentClass = isDanger ? "glass-red" : "glass";
  const targetClass = "glass-green";
  const gapClass = "glass-blue";

  const Card = ({ title, value, sub, customClass, delay }) => {
    return (
      <div className={`${customClass || 'glass'} p-6 hover-lift animate-slide-up ${delay || ''}`}>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

        <div className="text-sm font-bold tracking-wide uppercase text-white/50 relative z-10">{title}</div>
        <div className="mt-3 text-5xl font-black tracking-tight text-white relative z-10">{value}</div>
        {sub ? <div className="mt-3 text-xs font-bold text-white/70 relative z-10">{sub}</div> : null}
      </div>
    );
  };

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Card
        title="Current GPA (Est)"
        value={currentVal.toFixed(2)}
        sub="Based on CA + baseline final"
        customClass={currentClass}
        delay="stagger-1"
      />
      <Card
        title="Target GPA"
        value={targetVal.toFixed(2)}
        sub="Your goal for this semester"
        customClass={targetClass}
        delay="stagger-2"
      />
      <Card
        title="Gap"
        value={(gapVal >= 0 ? `+${gapVal.toFixed(2)}` : gapVal.toFixed(2))}
        sub={gapVal <= 0 ? "You are on track 🎉" : "Improvement needed"}
        customClass={gapClass}
        delay="stagger-3"
      />
    </div>
  );
}