import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, normalizeLanguageCode } from "../i18n/languages";

/** `menuPlacement="top"` is useful near the bottom of the page (e.g. footer). */
export default function LanguageSwitcher({
  className = "",
  menuPlacement = "bottom",
}) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const canon = normalizeLanguageCode(
    i18n.resolvedLanguage || i18n.language,
  );
  const current =
    LANGUAGES.find((l) => l.code === canon) ??
    LANGUAGES.find((l) => l.code === "en");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const select = (code) => {
    void i18n.changeLanguage(code);
    setOpen(false);
  };

  const openUp = menuPlacement === "top";

  const scrollbar =
    "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/55 dark:[&::-webkit-scrollbar-thumb]:bg-white/18";

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="language-switcher-list"
        aria-label={t("aria.chooseLanguage")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white/90 px-2.5 text-sm font-bold text-[#0f172a] shadow-sm outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/55 dark:border-white/[0.14] dark:bg-[rgb(21_31_53)] dark:text-[#e2e8f0] dark:shadow-none dark:hover:bg-[rgb(26_36_56)]"
      >
        <Globe className="size-4 shrink-0 text-slate-600 dark:text-[#94a3b8]" aria-hidden />
        <span className="max-w-[2.75rem] truncate text-left tracking-wide">
          {current.short}
        </span>
        <ChevronDown
          aria-hidden
          className={[
            "size-4 shrink-0 text-slate-500 transition-transform dark:text-[#64748b]",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="language-switcher-list"
            role="listbox"
            aria-label={t("aria.languageMenu")}
            initial={{ opacity: 0, y: openUp ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUp ? 4 : -4 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className={[
              `absolute right-0 z-[60] min-w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/[0.12] dark:bg-[rgb(21_31_53)] ${scrollbar}`,
              "max-h-[min(21rem,calc(100vh-10rem))] overflow-y-auto",
              openUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            ].join(" ")}
          >
            {LANGUAGES.map((lang) => {
              const selected = lang.code === current.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(lang.code)}
                  className={[
                    "w-full px-3 py-3 text-left text-sm font-semibold leading-snug tracking-tight transition-colors",
                    selected
                      ? "bg-emerald-500/14 text-emerald-900 dark:bg-emerald-500/22 dark:text-emerald-300"
                      : "text-slate-800 hover:bg-slate-100 dark:text-[#e8edf5] dark:hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  {lang.label}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
