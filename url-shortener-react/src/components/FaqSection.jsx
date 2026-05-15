import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { easeSmooth } from "../utils/motionVariants";

const FAQ_KEYS = [
  "whatOffer",
  "trackPerf",
  "whatIsShortener",
  "whyUse",
  "customPassword",
  "qrCodes",
  "guestUse",
  "privacyLegal",
];

const FaqSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mt-24 pb-6 sm:mt-28 sm:pb-10"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px 0px" }}
            transition={{ duration: 0.45, ease: easeSmooth }}
            className="text-2xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-[2rem]"
          >
            {t("faq.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px 0px" }}
            transition={{ duration: 0.42, delay: 0.04, ease: easeSmooth }}
            className="mt-3 text-[0.95rem] leading-relaxed text-slate-600 dark:text-[#94a3b8]"
          >
            {t("faq.subtitle")}
          </motion.p>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2">
          {FAQ_KEYS.map((faqKey, index) => {
            const q = t(`faq.items.${faqKey}.q`);
            const a = t(`faq.items.${faqKey}.a`);
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faqKey}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px 0px" }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: easeSmooth }}
                className="rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-white/[0.1] dark:bg-[rgb(21_31_53_/_0.85)]"
              >
                <button
                  type="button"
                  id={`faq-trigger-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => toggle(index)}
                  className="flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left sm:px-5 sm:py-5"
                >
                  <span
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#2563eb] dark:border-white/[0.12] dark:bg-slate-950/50 dark:text-[#60a5fa]"
                    aria-hidden
                  >
                    <HelpCircle className="size-[1.125rem]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block text-[0.9375rem] font-bold leading-snug text-[#0f172a] dark:text-[#f8fafc]">
                      {q}
                    </span>
                  </span>
                  <span
                    className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors dark:border-white/[0.12] dark:text-[#94a3b8]"
                    aria-hidden
                  >
                    {isOpen ? (
                      <Minus className="size-4" strokeWidth={2} />
                    ) : (
                      <Plus className="size-4" strokeWidth={2} />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: easeSmooth }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 px-4 pb-4 pl-[3.25rem] pr-12 pt-1 text-sm leading-relaxed text-slate-600 dark:border-white/[0.06] dark:text-[#94a3b8] sm:px-5 sm:pb-5 sm:pl-[3.75rem] sm:pr-14">
                        {a}
                        {index === FAQ_KEYS.length - 1 ? (
                          <span className="mt-2 block">
                            <Link
                              to="/privacy"
                              className="font-semibold text-[#2563eb] underline-offset-2 hover:underline dark:text-[#60a5fa]"
                            >
                              {t("footer.privacyPolicy")}
                            </Link>
                            <span aria-hidden>, </span>
                            <Link
                              to="/terms"
                              className="font-semibold text-[#2563eb] underline-offset-2 hover:underline dark:text-[#60a5fa]"
                            >
                              {t("footer.termsOfService")}
                            </Link>
                            <span aria-hidden>, </span>
                            <Link
                              to="/cookie"
                              className="font-semibold text-[#2563eb] underline-offset-2 hover:underline dark:text-[#60a5fa]"
                            >
                              {t("footer.cookiePolicy")}
                            </Link>
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
