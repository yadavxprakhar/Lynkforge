import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { easeSmooth, staggerChild, staggerParent } from "../utils/motionVariants";

const REVIEW_IDS = ["venkatesh", "dawid", "christian", "james", "lily", "michael"];

const REVIEW_NAMES = {
  venkatesh: "Venkatesh Thota",
  dawid: "Dawid Liszewski",
  christian: "Christian Bolduc",
  james: "James Holden",
  lily: "Lily Chen",
  michael: "Michael Torres",
};

const REVIEW_TONES = [
  "from-blue-600 to-indigo-600",
  "from-fuchsia-600 to-violet-600",
  "from-sky-600 to-cyan-600",
  "from-indigo-600 to-blue-600",
  "from-violet-600 to-fuchsia-600",
  "from-cyan-600 to-sky-600",
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const CustomerReviewsSection = () => {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="about-reviews" className="mt-20 sm:mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          id="about-reviews"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.45, ease: easeSmooth }}
          className="text-2xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-[2rem]"
        >
          {t("about.reviews.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.42, delay: 0.04, ease: easeSmooth }}
          className="mt-3 text-[0.95rem] leading-relaxed text-slate-600 dark:text-[#94a3b8]"
        >
          {t("about.reviews.subtitle")}
        </motion.p>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px 0px" }}
        className="mt-12 grid gap-5 md:grid-cols-3"
      >
        {REVIEW_IDS.map((id, index) => {
          const name = REVIEW_NAMES[id];
          const tone = REVIEW_TONES[index];
          return (
            <motion.article
              key={id}
              variants={staggerChild}
              className="relative flex h-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/[0.1] dark:bg-[rgb(21_31_53_/_0.85)]"
            >
              <div
                aria-hidden
                className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 dark:border-white/[0.12] dark:bg-slate-950/40 dark:text-[#94a3b8]"
              >
                <Quote className="size-4" strokeWidth={2} />
              </div>

              <p className="pr-12 text-sm leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
                {t(`about.reviews.${id}.body`)}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-2">
                <div
                  className={[
                    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r text-sm font-extrabold text-white shadow-[0_10px_28px_-18px_rgba(37,99,235,0.45)]",
                    tone,
                  ].join(" ")}
                  aria-hidden
                >
                  {initials(name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[#0f172a] dark:text-[#f8fafc]">
                    {name}
                  </div>
                  <div className="truncate text-xs font-medium text-slate-500 dark:text-[#94a3b8]">
                    {t(`about.reviews.${id}.role`)}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
};

export default CustomerReviewsSection;
