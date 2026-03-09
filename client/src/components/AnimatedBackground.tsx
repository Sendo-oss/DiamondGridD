export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#07131f_0%,#040915_45%,#02050c_100%)]" />

      {/* Glow principal superior */}
      <div className="absolute left-1/2 top-[-120px] h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-cyan-400/12 blur-3xl animate-[dgPulse_10s_ease-in-out_infinite]" />

      {/* Glow secundario derecho */}
      <div className="absolute right-[-140px] top-[18%] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl animate-[dgFloatRight_15s_ease-in-out_infinite]" />

      {/* Glow inferior izquierdo */}
      <div className="absolute bottom-[-120px] left-[-120px] h-[480px] w-[480px] rounded-full bg-sky-400/10 blur-3xl animate-[dgFloatLeft_17s_ease-in-out_infinite]" />

      {/* Glow central suave */}
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/6 blur-3xl animate-[dgSoftPulse_9s_ease-in-out_infinite]" />

      {/* Grid tecnológico */}
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px)] [background-size:42px_42px]" />

      {/* Puntos pequeños */}
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(56,189,248,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />

      {/* Líneas de luz diagonales */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/3 top-0 h-full w-1/3 rotate-[18deg] bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent blur-2xl animate-[dgSweep_12s_linear_infinite]" />
        <div className="absolute -right-1/3 top-0 h-full w-1/4 -rotate-[18deg] bg-gradient-to-r from-transparent via-sky-300/10 to-transparent blur-2xl animate-[dgSweepReverse_15s_linear_infinite]" />
      </div>

      {/* Cuadros flotantes */}
      <div className="absolute left-[12%] top-[20%] h-3 w-3 border border-cyan-300/40 bg-cyan-300/10 animate-[dgBoxFloat1_12s_ease-in-out_infinite]" />
      <div className="absolute left-[22%] top-[62%] h-4 w-4 border border-sky-300/35 bg-sky-300/10 animate-[dgBoxFloat2_16s_ease-in-out_infinite]" />
      <div className="absolute right-[18%] top-[26%] h-3.5 w-3.5 border border-cyan-200/40 bg-cyan-200/10 animate-[dgBoxFloat3_13s_ease-in-out_infinite]" />
      <div className="absolute right-[28%] bottom-[18%] h-5 w-5 border border-blue-300/30 bg-blue-300/10 animate-[dgBoxFloat4_18s_ease-in-out_infinite]" />
      <div className="absolute left-[48%] top-[72%] h-2.5 w-2.5 border border-cyan-300/40 bg-cyan-300/10 animate-[dgBoxFloat5_11s_ease-in-out_infinite]" />

      {/* Viñeta */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.22)_62%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}