import { useReducedMotion } from "framer-motion";
import HomeShaderBackground from "./HomeShaderBackground";

const Globe = () => {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 520"
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lx-globe-stroke" x1="0" y1="0" x2="1200" y2="0">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
          <stop offset="18%" stopColor="#60a5fa" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.58" />
          <stop offset="82%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lx-globe-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(600 520) rotate(-90) scale(460 760)">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.34" />
          <stop offset="28%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#050a14" stopOpacity="0" />
        </radialGradient>
        <filter id="lx-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.9 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* big soft glow */}
      <path
        d="M-120 520C80 248 360 120 600 120C840 120 1120 248 1320 520H-120Z"
        fill="url(#lx-globe-glow)"
        opacity="0.95"
      />

      {/* horizon rim */}
      <path
        d="M40 520C208 310 404 210 600 210C796 210 992 310 1160 520"
        stroke="url(#lx-globe-stroke)"
        strokeWidth="2.6"
        filter="url(#lx-soft-glow)"
        opacity="0.9"
      />

      {/* latitude arcs */}
      {[
        { y: 320, o: 0.38, w: 1.3 },
        { y: 360, o: 0.28, w: 1.2 },
        { y: 400, o: 0.22, w: 1.1 },
        { y: 440, o: 0.18, w: 1.05 },
      ].map((a) => (
        <path
          key={a.y}
          d={`M140 520C280 ${a.y} 460 ${a.y - 30} 600 ${a.y - 30}C740 ${
            a.y - 30
          } 920 ${a.y} 1060 520`}
          stroke="url(#lx-globe-stroke)"
          strokeWidth={a.w}
          opacity={a.o}
        />
      ))}

      {/* longitude arcs */}
      {[
        { x: 430, o: 0.22 },
        { x: 510, o: 0.18 },
        { x: 600, o: 0.24 },
        { x: 690, o: 0.18 },
        { x: 770, o: 0.22 },
      ].map((m) => (
        <path
          key={m.x}
          d={`M${m.x} 520C${m.x - 40} 408 ${m.x - 60} 300 ${m.x} 220C${
            m.x + 60
          } 300 ${m.x + 40} 408 ${m.x} 520`}
          stroke="url(#lx-globe-stroke)"
          strokeWidth="1.05"
          opacity={m.o}
        />
      ))}
    </svg>
  );
};

const HomeSpaceBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden">
      {/* shader-like backdrop (subtle, behind stars) */}
      <HomeShaderBackground className="mix-blend-screen" />

      {/* animated stars (very visible) */}
      <div
        className={[
          "absolute inset-0",
          "lx-stars-pan",
          "opacity-[0.72]",
          reduceMotion ? "animate-none" : "",
        ].join(" ")}
      />

      {/* slight fog for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgb(99_102_241_/_0.28)_0%,transparent_52%)] opacity-[0.75]" />

      {/* half-globe horizon */}
      <div className="absolute -bottom-[26vh] left-1/2 h-[64vh] w-[120vw] -translate-x-1/2 opacity-[0.98]">
        <Globe />
      </div>
    </div>
  );
};

export default HomeSpaceBackground;

