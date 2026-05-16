import { motion } from "framer-motion";
import { useStoreContext } from "../contextApi/ContextApi";
import { easeSmooth } from "../utils/motionVariants";
import HomeSpaceBackground from "./HomeSpaceBackground";

const AccessibilityPage = () => {
  const { theme } = useStoreContext();
  const isDark = theme === "dark";

  return (
    <div className="relative w-full">
      {isDark ? <HomeSpaceBackground /> : null}

      <div className="lx-page-inner lx-section-y">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeSmooth }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
            Accessibility Statement
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            Effective May 3, 2026
          </p>

        <div className="mt-8 space-y-6 text-[0.95rem] leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
          <p>
            Lynkforge is committed to making our website and services accessible to everyone,
            including people with disabilities. We aim to provide an inclusive experience across
            devices and assistive technologies.
          </p>
          <p>
            We continually work to improve accessibility and usability. If you have difficulty
            viewing content, navigating the site, or completing any action, please let us know so we
            can help and improve.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 text-sm text-slate-700 shadow-soft dark:border-white/[0.10] dark:bg-slate-950/35 dark:text-[#cbd5e1]">
            <div className="font-semibold text-slate-900 dark:text-[#f8fafc]">Contact</div>
            <div className="mt-1">
              Email us via the address listed in the footer, or open an issue/support request from
              our GitHub repository link in the footer.
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccessibilityPage;

