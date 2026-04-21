export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large slow drifting orbs */}
      <div
        style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          top: '-10%', left: '-15%',
          animation: 'driftA 18s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          bottom: '-10%', right: '-10%',
          animation: 'driftB 22s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute', width: 350, height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)',
          top: '40%', left: '55%',
          animation: 'driftC 16s ease-in-out infinite alternate',
        }}
      />

      {/* Small floating particles */}
      {[
        { w: 3, top: '15%', left: '20%', delay: '0s', dur: '8s' },
        { w: 2, top: '70%', left: '10%', delay: '1.5s', dur: '10s' },
        { w: 4, top: '30%', left: '75%', delay: '3s', dur: '7s' },
        { w: 2, top: '80%', left: '60%', delay: '0.5s', dur: '12s' },
        { w: 3, top: '55%', left: '85%', delay: '2s', dur: '9s' },
        { w: 2, top: '10%', left: '50%', delay: '4s', dur: '11s' },
        { w: 3, top: '90%', left: '35%', delay: '1s', dur: '8s' },
        { w: 2, top: '45%', left: '5%', delay: '2.5s', dur: '13s' },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.w, height: p.w,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            top: p.top, left: p.left,
            animation: `floatUp ${p.dur} ease-in-out infinite`,
            animationDelay: p.delay,
            boxShadow: `0 0 ${p.w * 3}px rgba(255,255,255,0.4)`,
          }}
        />
      ))}

      {/* Subtle grid lines */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
