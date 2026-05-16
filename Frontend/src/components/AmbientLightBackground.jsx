import { useReducedMotion } from "framer-motion";

/** Soft light-mode backdrop — drifting mesh aligned with Lynkforge cool blues. */
const AmbientLightBackground = () => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1] min-h-full w-full bg-[#f8fafc]"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] min-h-full w-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="lx-light-mesh absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafc00_0%,#f8fafc_52%,rgb(226_232_240_/_0.35)_100%)] opacity-70" />
    </div>
  );
};

export default AmbientLightBackground;
