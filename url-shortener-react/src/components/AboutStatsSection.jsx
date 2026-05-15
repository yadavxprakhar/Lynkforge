import { motion, useInView, useReducedMotion } from "framer-motion";
import { easeSmooth } from "../utils/motionVariants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const statValues = ["12,000+", "1,500,000+", "1,500+"];

function parseTarget(value) {
  const hasPlus = value.includes("+");
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return { target: Number.isFinite(numeric) ? numeric : 0, hasPlus };
}

const AboutStatsSection = () => {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });

  const stats = useMemo(
    () => [
      {
        label: t("about.stats.powering"),
        value: statValues[0],
        caption: t("about.stats.links"),
      },
      {
        label: t("about.stats.serving"),
        value: statValues[1],
        caption: t("about.stats.clicks"),
      },
      {
        label: t("about.stats.trustedBy"),
        value: statValues[2],
        caption: t("about.stats.happyCustomers"),
      },
    ],
    [t],
  );

  const formatNumber = useMemo(() => {
    const loc = i18n.resolvedLanguage?.replace(/_/g, "-") ?? "en";
    return (n) =>
      new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(Math.round(n));
  }, [i18n.resolvedLanguage]);

  const targets = useMemo(() => stats.map((s) => parseTarget(s.value)), [stats]);
  const [display, setDisplay] = useState(() => targets.map(() => 0));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(targets.map((tt) => tt.target));
      return;
    }

    const durationMs = 1900;
    const start = performance.now();
    let raf = 0;

    const tick = (now) => {
      const tEase = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - tEase, 3);
      setDisplay(targets.map((tt) => tt.target * eased));
      if (tEase < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, targets]);

  return (
    <section aria-label={t("about.stats.ariaLabel")} className="mt-16 sm:mt-20">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px 0px" }}
        transition={{ duration: 0.45, ease: easeSmooth }}
        className="grid gap-10 rounded-3xl border border-slate-200 bg-white/90 px-6 py-12 text-center shadow-soft dark:border-white/[0.1] dark:bg-[rgb(21_31_53_/_0.55)] sm:grid-cols-3 sm:gap-6 sm:px-10"
      >
        {stats.map((s, idx) => (
          <div key={s.label} className="space-y-2">
            <div className="text-sm font-bold tracking-tight text-[#2563eb] dark:text-[#60a5fa]">
              {s.label}
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-[#2563eb] dark:text-[#60a5fa] sm:text-[2.25rem]">
              {formatNumber(display[idx])}
              {targets[idx].hasPlus ? "+" : ""}
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-[#cbd5e1]">
              {s.caption}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default AboutStatsSection;
