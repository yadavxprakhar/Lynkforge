import { motion } from "framer-motion";
import { useStoreContext } from "../contextApi/ContextApi";
import { easeSmooth } from "../utils/motionVariants";
import HomeSpaceBackground from "./HomeSpaceBackground";

const CookiePage = () => {
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
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            Effective May 3, 2026
          </p>

        <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              1) What cookies are
            </h2>
            <p>
              Cookies are small text files stored on your device. We may also use similar technologies
              (like local storage or pixels) to help operate the service and understand usage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              2) How Lynkforge uses cookies
            </h2>
            <p>We use cookies for:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Strictly necessary</span>
                : security, session handling, and core functionality.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Preferences</span>
                : remembering settings (for example, theme).
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Performance/analytics</span>
                : understanding how the site is used and improving reliability.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              3) Third‑party cookies
            </h2>
            <p>
              Some analytics or infrastructure providers may set their own cookies. We don’t sell your
              personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              4) Your choices
            </h2>
            <p>
              You can control cookies through your browser settings (block, delete, or limit third‑party
              cookies). If you block necessary cookies, parts of Lynkforge may not function correctly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              5) Updates
            </h2>
            <p>
              We may update this Cookie Policy from time to time. When we do, we’ll update the effective
              date above.
            </p>
          </section>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePage;

