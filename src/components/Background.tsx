export function Background() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <div
        data-orb="1"
        className="absolute rounded-full orb-float-1"
        style={{
          width: 340,
          height: 340,
          top: -100,
          left: -80,
          background: 'radial-gradient(circle, var(--bg-glow-1), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="2"
        className="absolute rounded-full orb-float-2"
        style={{
          width: 280,
          height: 280,
          top: 60,
          right: -60,
          background: 'radial-gradient(circle, var(--bg-glow-2), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="3"
        className="absolute rounded-full orb-float-3"
        style={{
          width: 240,
          height: 240,
          bottom: -80,
          left: '20%',
          background: 'radial-gradient(circle, var(--bg-glow-3), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="4"
        className="absolute rounded-full orb-float-4"
        style={{
          width: 200,
          height: 200,
          top: '30%',
          left: '40%',
          background: 'radial-gradient(circle, var(--bg-glow-4), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="5"
        className="absolute rounded-full orb-float-5"
        style={{
          width: 180,
          height: 180,
          bottom: '10%',
          right: '25%',
          background: 'radial-gradient(circle, var(--bg-glow-5), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
