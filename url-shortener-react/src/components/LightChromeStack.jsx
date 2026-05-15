/**
 * Mirrors AmbientLightBackground (base + drifting mesh + veil) for local chrome only.
 * Parent must be `relative overflow-hidden`. Hidden in `.dark`.
 */
export function LightChromeAmbient({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden dark:hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="lx-light-mesh absolute inset-0 opacity-[0.68]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafc00_0%,#f8fafc_52%,rgb(226_232_240_/_0.35)_100%)] opacity-[0.62]" />
    </div>
  );
}

/** Frosted layer so nav/footer content stays readable over the mesh. */
export function LightChromeFrost({ className }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[1] backdrop-blur-xl transition-[background-color] duration-500 ease-out dark:hidden ${className ?? ""}`}
    />
  );
}
