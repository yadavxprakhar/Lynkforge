/** Shared presets — subtle, SaaS-grade motion (Stripe / Linear style). */

export const easeSmooth = [0.4, 0, 0.2, 1];

/** Section / block entrance: fade + lift */
export function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px 0px" },
    transition: { duration: 0.44, delay, ease: easeSmooth },
  };
}

/** Mount-only (hero, routes) — no viewport */
export function fadeUpMountProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.48, delay, ease: easeSmooth },
  };
}

/** Staggered lists */
export const staggerParent = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 34,
      mass: 0.85,
    },
  },
};

export const cardHoverSpring = {
  type: "spring",
  stiffness: 460,
  damping: 32,
};

export const tapScale = {
  whileTap: { scale: 0.98 },
};
