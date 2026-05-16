import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Link as LinkIcon,
  Link2,
  QrCode,
  Shield,
  CalendarClock,
  Sparkles,
  Share2,
  SquarePen,
} from "lucide-react";

import Card from "./Card";
import { useStoreContext } from "../contextApi/ContextApi";
import HomeSpaceBackground from "./HomeSpaceBackground";
import PricingSection from "./PricingSection";
import FaqSection from "./FaqSection";
import api from "../api/api";
import toast from "react-hot-toast";
import HomeAdvancedShortenModal from "./HomeAdvancedShortenModal";
import {
  fadeUpMountProps,
  fadeUpProps,
  staggerParent,
  tapScale,
} from "../utils/motionVariants";

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, theme } = useStoreContext();
  const isDark = theme === "dark";
  const [quickUrl, setQuickUrl] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureModalType, setFeatureModalType] = useState("custom");

  const goStart = () => navigate(token ? "/dashboard" : "/register");
  const goLearn = () => navigate("/about");

  const shortenNow = async () => {
    const originalUrl = quickUrl.trim();
    if (!originalUrl) {
      toast.error(t("landing.toastPasteUrl"));
      return;
    }

    setQuickLoading(true);
    try {
      const endpoint = token ? "/api/urls/shorten" : "/api/urls/public/shorten-once";
      const config = token
        ? {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          };

      const { data: res } = await api.post(endpoint, { originalUrl }, config);

      const shortenUrl = `${import.meta.env.VITE_REACT_FRONT_END_URL + "/s/" + `${res.shortUrl}`}`;
      await navigator.clipboard.writeText(shortenUrl);
      toast.success(t("landing.toastCopied"));
      setQuickUrl("");
    } catch (err) {
      const status = err?.response?.status;
      if (!token && (status === 401 || status === 403)) {
        toast.error(t("landing.toastLoginMore"));
        navigate("/login");
        return;
      }
      toast.error(t("landing.toastShortenFail"));
    } finally {
      setQuickLoading(false);
    }
  };

  const openFeature = (type) => {
    if (!token) {
      toast.error(t("landing.toastLoginFeature"));
      navigate("/login");
      return;
    }
    setFeatureModalType(type);
    setFeatureModalOpen(true);
  };

  return (
    <div className="relative w-full pb-24 pt-12 sm:pt-16 lg:pb-28">
      {isDark ? <HomeSpaceBackground /> : null}
      <div className="lx-page-inner">
        <HomeAdvancedShortenModal
          open={featureModalOpen}
          feature={featureModalType}
          onClose={() => setFeatureModalOpen(false)}
        />
        <motion.div
          {...fadeUpMountProps(0)}
          className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-16 xl:gap-24"
        >
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.span
            {...fadeUpProps(0.02)}
            className="lx-badge mx-auto lg:mx-0"
          >
            {t("landing.heroBadge")}
          </motion.span>

          <motion.h1
            {...fadeUpProps(0.06)}
            className="mx-auto max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0f172a] sm:text-5xl lg:mx-0 lg:max-w-2xl"
          >
            <span className="dark:text-[#f8fafc]">{t("landing.heroTitle1")} </span>
            <span className="lx-text-brand-gradient">{t("landing.heroTitle2")}</span>
          </motion.h1>

          <motion.p
            {...fadeUpProps(0.1)}
            className="mx-auto max-w-lg text-[1rem] leading-relaxed text-slate-600 dark:text-[#94a3b8] lg:mx-0"
          >
            {t("landing.heroSubtitle")}
          </motion.p>

          <motion.div
            {...fadeUpProps(0.14)}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <motion.button
              type="button"
              className="lx-btn-primary inline-flex gap-2 rounded-xl px-8 py-3.5 text-[0.9375rem]"
              onClick={goStart}
              {...tapScale}
            >
              {t("landing.getStarted")}
              <ArrowRight className="size-[1.125rem]" aria-hidden />
            </motion.button>
            <motion.button
              type="button"
              className="lx-btn-outline-hero px-8 py-3.5"
              onClick={goLearn}
              {...tapScale}
            >
              {t("landing.learnMore")}
            </motion.button>
          </motion.div>

          <motion.div
            {...fadeUpProps(0.18)}
            className="mx-auto grid max-w-md grid-cols-3 gap-3 pt-2 sm:max-w-xl lg:mx-0"
          >
            {[
              [t("landing.stat1a"), t("landing.stat1b")],
              [t("landing.stat2a"), t("landing.stat2b")],
              [t("landing.stat3a"), t("landing.stat3b")],
            ].map(([a, b]) => (
              <div
                key={a}
                className="rounded-xl border border-slate-200 bg-white/95 px-3 py-4 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-700 shadow-soft dark:border-white/[0.1] dark:bg-[rgb(21_31_53)] dark:text-[#cbd5e1]"
              >
                <div>{a}</div>
                <div className="mt-0.5 font-normal lowercase text-slate-500 dark:text-[#64748b]">
                  {b}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          {...fadeUpProps(0.08)}
          className="relative flex w-full max-w-[348px] flex-1 justify-center lg:max-w-[360px] lg:justify-end"
        >
          {/* Product preview — downsized to sit closer to hero heading scale */}
          <div className="relative w-full rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#151d2f] via-[#0f1624] to-[#0c111d] p-4 shadow-[0_22px_48px_-18px_rgb(0_0_0_/_0.6)] ring-1 ring-white/[0.05] dark:border-white/[0.12] sm:p-5">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
              <span className="flex gap-1">
                <span className="size-2 rounded-full bg-[#ec6b5f]" aria-hidden />
                <span className="size-2 rounded-full bg-[#f4bf4f]" aria-hidden />
                <span className="size-2 rounded-full bg-[#61c554]" aria-hidden />
              </span>
              <span className="flex-1 rounded-md bg-black/25 py-[3px] text-center text-[10px] font-medium tracking-wide text-[#64748b]">
                lynkforge.app
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/18 text-[#93c5fd]">
                  <LinkIcon className="size-4" aria-hidden />
                </div>
                <p className="truncate text-[11px] leading-snug text-[#94a3b8]">
                  very-long-example-url.com/dashboard/settings/invite…
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-3 py-2 shadow-md shadow-blue-950/35">
                <p className="truncate text-[11px] font-semibold text-white leading-snug">
                  lynkforge.app/s/your-link
                </p>
              </div>
              <div className="relative flex justify-center pt-4 pb-1">
                <div className="absolute inset-x-10 top-[32%] h-24 rounded-[2rem] bg-blue-500/10 blur-[28px]" aria-hidden />
                <img
                  className="relative z-[1] h-auto w-[min(100%,152px)] object-contain drop-shadow-[0_14px_32px_-10px_rgb(59_130_246_/_0.4)] sm:w-[168px]"
                  src="/images/lynkforge-logo.png"
                  alt=""
                  width={176}
                  height={176}
                />
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>

        <section
          aria-labelledby="landing-features"
          className="mt-24 space-y-6 py-14 sm:mt-28 sm:py-20"
        >
        {/* Feature bar (like reference UI) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px 0px" }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto mb-24 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft dark:border-white/[0.1] dark:bg-[rgb(15_22_36_/_0.72)] dark:shadow-[0_30px_90px_-70px_rgb(99_102_241_/_0.65)] sm:mb-28 sm:p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 dark:border-white/[0.1] dark:bg-slate-950/35">
              <LinkIcon className="size-4 text-slate-500 dark:text-[#94a3b8]" aria-hidden />
              <input
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#e2e8f0] dark:placeholder:text-[#64748b]"
                placeholder={t("landing.featurePlaceholder")}
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
              />
            </div>
            <motion.button
              type="button"
              onClick={shortenNow}
              disabled={quickLoading}
              {...tapScale}
              className="lx-btn-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 dark:!bg-white/[0.10] dark:!text-white dark:!border-white/[0.14] dark:hover:!bg-white/[0.14]"
            >
              <Sparkles className="size-4" aria-hidden />
              {quickLoading ? t("landing.shortening") : t("landing.shortenNow")}
            </motion.button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Link2, labelKey: "landing.featCustom", type: "custom" },
              { Icon: Shield, labelKey: "landing.featPassword", type: "password" },
              { Icon: CalendarClock, labelKey: "landing.featExpiry", type: "expiry" },
              {
                Icon: QrCode,
                labelKey: "landing.featQr",
                type: "qr",
                highlight: true,
              },
            ].map(({ Icon, labelKey, type, highlight }) => (
              <button
                type="button"
                key={labelKey}
                onClick={() => openFeature(type)}
                className={[
                  "flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-transform duration-200 hover:-translate-y-0.5",
                  "border-slate-200 bg-white/95 text-slate-900",
                  "dark:border-white/[0.10] dark:bg-slate-950/30 dark:text-[#e2e8f0]",
                  highlight
                    ? "ring-1 ring-amber-400/35 dark:border-amber-400/35 dark:bg-[rgb(62_39_31_/_0.55)]"
                    : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex size-10 items-center justify-center rounded-xl",
                    highlight
                      ? "bg-amber-400/18 text-amber-500 dark:bg-amber-400/18 dark:text-amber-300"
                      : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/12 dark:text-[#93c5fd]",
                  ].join(" ")}
                >
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="text-sm font-semibold">{t(labelKey)}</div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.h2
          id="landing-features"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto max-w-2xl text-center text-2xl font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-[1.875rem]"
        >
          {t("landing.featuresHeading")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{
            duration: 0.42,
            delay: 0.05,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="mx-auto max-w-xl text-center text-[0.9375rem] leading-relaxed text-slate-600 dark:text-[#94a3b8]"
        >
          {t("landing.featuresSub")}
        </motion.p>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-70px 0px -80px 0px" }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card
            Icon={Link2}
            title={t("landing.cardSimpleTitle")}
            desc={t("landing.cardSimpleDesc")}
            iconShell="flex size-12 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/14 text-[#2563eb] shadow-inner shadow-blue-900/15 dark:border-blue-400/25 dark:bg-blue-950/75 dark:text-[#60a5fa]"
          />
          <Card
            Icon={BarChart3}
            title={t("landing.cardAnalyticsTitle")}
            desc={t("landing.cardAnalyticsDesc")}
            iconShell="flex size-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/14 text-emerald-600 shadow-inner shadow-emerald-900/15 dark:border-emerald-400/22 dark:bg-emerald-950/70 dark:text-emerald-400"
          />
          <Card
            Icon={SquarePen}
            title={t("landing.cardEditTitle")}
            desc={t("landing.cardEditDesc")}
            iconShell="flex size-12 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/14 text-violet-600 shadow-inner shadow-violet-900/15 dark:border-violet-400/25 dark:bg-violet-950/75 dark:text-violet-400"
          />
          <Card
            Icon={Share2}
            title={t("landing.cardShareTitle")}
            desc={t("landing.cardShareDesc")}
            iconShell="flex size-12 items-center justify-center rounded-xl border border-orange-400/35 bg-orange-500/14 text-orange-600 shadow-inner shadow-orange-950/25 dark:border-orange-400/22 dark:bg-[rgb(62_39_31)] dark:text-orange-400"
          />
        </motion.div>
        </section>

        <PricingSection />
        <FaqSection />
      </div>
    </div>
  );
};

export default LandingPage;
