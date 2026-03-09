import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }
        return old + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]">

      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500 blur-[220px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600 blur-[220px] opacity-30 animate-pulse"></div>
      </div>

      {/* Caja principal */}
      <div className="relative flex flex-col items-center justify-center
                      w-[640px] max-w-[92vw]
                      px-20 py-20
                      rounded-3xl
                      border border-white/10
                      bg-white/5
                      backdrop-blur-xl
                      shadow-[0_0_120px_rgba(34,211,238,0.25)]">

        {/* Logo */}
        <img
          src="/logo.png"
          alt="DiamondGrid"
          className="w-[420px] max-w-full drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]
                     animate-[pulse_3s_ease-in-out_infinite]"
        />

        {/* Texto */}
        <p className="mt-10 text-lg text-white/80 tracking-wide">
          Cargando catálogo y módulos...
        </p>

        {/* Barra */}
        <div className="mt-8 w-[420px] max-w-full h-[10px] rounded-full bg-white/10 overflow-hidden border border-white/10">

          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>

        </div>

        {/* porcentaje */}
        <p className="mt-4 text-base font-bold text-cyan-300 tracking-wider">
          {progress}%
        </p>

      </div>
    </div>
  );
}