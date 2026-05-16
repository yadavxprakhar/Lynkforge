import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated dark backdrop: drifted gradient mesh + softly moving color orbs.
 * Respects prefers-reduced-motion (static ambient only).
 */
const AmbientDarkBackground = () => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1] min-h-full w-full bg-[radial-gradient(ellipse_110%_80%_at_50%_-20%,#312e8133_0%,#050a14_48%,#050a14_100%)]"
      />
    );
  }

  const orbTransition = {
    duration: 22,
    repeat: Infinity,
    ease: [0.45, 0.05, 0.55, 0.95],
  };

  const orbTransitionB = {
    duration: 28,
    repeat: Infinity,
    ease: [0.45, 0.05, 0.55, 0.95],
  };

  const orbTransitionC = {
    duration: 19,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1],
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] min-h-full w-full overflow-hidden"
    >
      {/* Solid base */}
      <div className="absolute inset-0 bg-[#050a14]" />

      {/* Starfield */}
      <div className="lx-starfield absolute inset-0 opacity-[0.35]" />

      {/* Slow-moving mesh */}
      <div className="lx-ambient-mesh absolute inset-0 opacity-[0.42]" />

      {/* Subtle vertical beams */}
      <div className="lx-hero-beams absolute inset-0 opacity-[0.55]" />

      {/* Soft vignette so content stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_120%,transparent_35%,#050a1488_82%,#050a14ee_100%)]" />

      {/* Primary orb — cobalt / indigo */}
      <motion.div
        className="absolute left-[-14%] top-[-26%] h-[72vmin] w-[72vmin] rounded-full bg-[radial-gradient(circle_at_38%_40%,rgba(96,165,250,0.35),transparent_62%)] blur-[92px]"
        animate={{
          x: [0, 45, -18, 0],
          y: [0, 28, -14, 0],
          opacity: [0.38, 0.58, 0.44, 0.38],
        }}
        transition={orbTransition}
      />

      {/* Secondary — deeper indigo / violet */}
      <motion.div
        className="absolute right-[-22%] top-[16%] h-[82vmin] w-[74vmin] rounded-full bg-[radial-gradient(circle_at_62%_40%,rgba(99,102,241,0.32),transparent_65%)] blur-[106px]"
        animate={{
          x: [0, -38, 22, 0],
          y: [0, 42, -20, 0],
          opacity: [0.3, 0.5, 0.35, 0.3],
        }}
        transition={orbTransitionB}
      />

      {/* Accent — teal-blue bottom glow */}
      <motion.div
        className="absolute bottom-[-32%] left-[22%] h-[62vmin] w-[94vmin] rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(56,189,248,0.18),transparent_68%)] blur-[118px]"
        animate={{
          x: [0, 24, -32, 0],
          y: [0, -18, 12, 0],
          opacity: [0.22, 0.42, 0.3, 0.22],
        }}
        transition={orbTransitionC}
      />

      {/* Horizon arc (bottom glow) */}
      <div className="lx-hero-arc absolute -bottom-[22vh] left-1/2 h-[62vh] w-[120vw] -translate-x-1/2 blur-[1px] opacity-[0.95]" />
      <div className="absolute -bottom-[18vh] left-1/2 h-[48vh] w-[110vw] -translate-x-1/2 bg-[radial-gradient(ellipse_110%_70%_at_50%_110%,rgb(255_255_255_/_0.08)_0%,transparent_45%)] opacity-[0.55]" />

      {/* Subtle film grain */}
      <div
        className="lx-grain-overlay pointer-events-none absolute inset-0 opacity-[0.038] dark:opacity-[0.055]"
      />
    </div>
  );
};

export default AmbientDarkBackground;
