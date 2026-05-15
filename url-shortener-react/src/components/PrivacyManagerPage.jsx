import { motion } from "framer-motion";
import { easeSmooth } from "../utils/motionVariants";
import { getCookie, setCookie } from "../utils/cookies";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useStoreContext } from "../contextApi/ContextApi";
import HomeSpaceBackground from "./HomeSpaceBackground";

const STORAGE_KEY = "LYNKFORGE_PRIVACY_PREFS";

function parsePrefs(raw) {
  const parsed = JSON.parse(raw);
  return {
    required: parsed?.required !== false,
    performance: Boolean(parsed?.performance),
    advertising: Boolean(parsed?.advertising),
    social: Boolean(parsed?.social),
  };
}

function getInitialPrefs() {
  if (typeof window === "undefined") {
    return { required: true, performance: true, advertising: false, social: false };
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = getCookie(STORAGE_KEY);
    }
    if (!raw) return { required: true, performance: true, advertising: false, social: false };
    return parsePrefs(raw);
  } catch {
    return { required: true, performance: true, advertising: false, social: false };
  }
}

function ToggleRow({ title, description, value, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft dark:border-white/[0.10] dark:bg-slate-950/35">
      <div className="space-y-1">
        <div className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">{title}</div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
          {description}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={value}
        onClick={() => onChange(!value)}
        className={[
          "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors duration-200",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
          value
            ? "border-blue-500/30 bg-blue-600/25 dark:bg-blue-500/25"
            : "border-slate-300 bg-slate-200/70 dark:border-white/[0.14] dark:bg-white/[0.06]",
        ].join(" ")}
      >
        <span
          aria-hidden
          className={[
            "absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-[transform] duration-200",
            value ? "translate-x-[1.625rem]" : "translate-x-0",
            "dark:bg-[#e2e8f0] dark:ring-white/10",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

const PrivacyManagerPage = () => {
  const { t } = useTranslation();
  const { theme } = useStoreContext();
  const isDark = theme === "dark";
  const [prefs, setPrefs] = useState(getInitialPrefs);

  const summary = useMemo(() => {
    const enabled = [
      prefs.required ? t("privacyManager.summaryRequired") : null,
      prefs.performance ? t("privacyManager.summaryPerformance") : null,
      prefs.advertising ? t("privacyManager.summaryAdvertising") : null,
      prefs.social ? t("privacyManager.summarySocial") : null,
    ].filter(Boolean);
    return enabled.length ? enabled.join(", ") : t("privacyManager.summaryNone");
  }, [prefs, t]);

  useEffect(() => {
    const serialized = JSON.stringify(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
    try {
      setCookie(STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
  }, [prefs]);

  const save = () => toast.success(t("privacyManager.toastSaved"));

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
            {t("privacyManager.title")}
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            {t("privacyManager.effective")}
          </p>
          <p className="mt-6 text-[0.95rem] leading-relaxed text-slate-600 dark:text-[#94a3b8]">
            {t("privacyManager.intro")}
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-700 shadow-soft dark:border-white/[0.10] dark:bg-slate-950/35 dark:text-[#cbd5e1]">
              <div className="font-semibold text-slate-900 dark:text-[#f8fafc]">
                {t("privacyManager.currentlyEnabled")}
              </div>
              <div className="mt-1 text-slate-600 dark:text-[#94a3b8]">{summary}</div>
            </div>

            <h2 className="pt-4 text-base font-extrabold tracking-tight text-slate-900 dark:text-[#f8fafc]">
              {t("privacyManager.cookieManagement")}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
              {t("privacyManager.cookieMgmtDesc")}
            </p>

            <ToggleRow
              title={t("privacyManager.requiredTitle")}
              description={t("privacyManager.requiredDesc")}
              value={prefs.required}
              onChange={(v) => setPrefs((p) => ({ ...p, required: v }))}
            />

            <ToggleRow
              title={t("privacyManager.performanceTitle")}
              description={t("privacyManager.performanceDesc")}
              value={prefs.performance}
              onChange={(v) => setPrefs((p) => ({ ...p, performance: v }))}
            />

            <ToggleRow
              title={t("privacyManager.advertisingTitle")}
              description={t("privacyManager.advertisingDesc")}
              value={prefs.advertising}
              onChange={(v) => setPrefs((p) => ({ ...p, advertising: v }))}
            />

            <ToggleRow
              title={t("privacyManager.socialTitle")}
              description={t("privacyManager.socialDesc")}
              value={prefs.social}
              onChange={(v) => setPrefs((p) => ({ ...p, social: v }))}
            />

            <div className="pt-4">
              <button type="button" onClick={save} className="lx-btn-primary rounded-xl px-6 py-3">
                {t("privacyManager.savePreferences")}
              </button>
            </div>

            <p className="pt-4 text-xs leading-relaxed text-slate-500 dark:text-[#64748b]">
              {t("privacyManager.footerNote")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyManagerPage;
