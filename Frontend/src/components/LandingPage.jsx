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
} from "lucide-react";

import { useStoreContext } from "../contextApi/ContextApi";
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
  const { token } = useStoreContext();
  const [quickUrl, setQuickUrl] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [terminalStep, setTerminalStep] = useState("");
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureModalType, setFeatureModalType] = useState("custom");

  const goStart = () => navigate(token ? "/dashboard" : "/register");
  const goLearn = () => navigate("/about");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const shortenNow = async () => {
    const originalUrl = quickUrl.trim();
    if (!originalUrl) {
      toast.error(t("landing.toastPasteUrl"));
      return;
    }

    setQuickLoading(true);
    setTerminalStep("Connecting to API gateway...");
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

      // Start the API request
      const apiPromise = api.post(endpoint, { originalUrl }, config);

      // Simulated engineering sequence in parallel
      await new Promise((r) => setTimeout(r, 220));
      setTerminalStep("Hashing redirect path...");

      await new Promise((r) => setTimeout(r, 220));
      setTerminalStep("Optimizing DNS routing...");

      const { data: res } = await apiPromise;

      setTerminalStep("Finalizing shortlink...");
      await new Promise((r) => setTimeout(r, 180));

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
      setTerminalStep("");
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
            className="mx-auto max-w-xl text-balance text-5xl font-black leading-[1.05] tracking-tighter text-[#0f172a] sm:text-6xl lg:text-7xl lg:mx-0 lg:max-w-3xl"
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
                className="lx-glass-card rounded-xl px-3 py-4 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-700 dark:text-[#cbd5e1] border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/[0.08] dark:bg-slate-950/40"
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
          <motion.div
            onMouseMove={handleMouseMove}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="lx-glow-card relative w-full p-4 shadow-xl sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/40 dark:border-white/[0.08] pb-3">
              <span className="flex gap-1.5">
                <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-800" aria-hidden />
                <span className="size-2 rounded-full bg-neutral-400 dark:bg-neutral-700" aria-hidden />
                <span className="size-2 rounded-full bg-neutral-500 dark:bg-neutral-600" aria-hidden />
              </span>
              <span className="rounded-md bg-black/5 dark:bg-black/25 px-3 py-[3px] text-center text-[10px] font-medium tracking-wide text-slate-500 dark:text-[#64748b]">
                lynkforge.app/dashboard
              </span>
              <span className="size-2 rounded-full bg-neutral-400 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,0.25)] animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/40 bg-slate-100/50 dark:border-white/[0.08] dark:bg-black/35 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 text-black dark:text-white">
                  <LinkIcon className="size-4" aria-hidden />
                </div>
                <p className="truncate text-[11px] leading-snug text-slate-600 dark:text-[#94a3b8]">
                  very-long-example-url.com/dashboard/settings/invite…
                </p>
              </div>
              <div className="rounded-lg bg-black dark:bg-white border border-neutral-800 dark:border-neutral-200 px-3 py-2 shadow-md">
                <p className="truncate text-[11px] font-semibold text-white dark:text-black leading-snug">
                  lynkforge.app/s/your-link
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-lg border border-slate-200/40 bg-slate-100/50 p-2 dark:border-white/[0.08] dark:bg-black/35">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Total Links</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-[#f8fafc]">1,248</p>
                </div>
                <div className="rounded-lg border border-slate-200/40 bg-slate-100/50 p-2 dark:border-white/[0.08] dark:bg-black/35">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Clicks</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">+28%</p>
                    <svg className="w-10 h-4 text-neutral-500" viewBox="0 0 40 16" fill="none">
                      <path d="M0 14L8 10L16 12L24 4L32 6L40 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        </motion.div>

        {/* Partner Logo Cloud */}
        <motion.div
          {...fadeUpProps(0.12)}
          className="w-full pt-14 border-t border-slate-200/35 dark:border-white/[0.04] mt-24 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">
            TRUSTED BY ELITE ENGINEERING TEAMS WORLDWIDE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 dark:opacity-25 grayscale hover:grayscale-0 hover:opacity-75 transition duration-300">
            {[
              { name: "Acme", logo: "▲" },
              { name: "Supabase", logo: "⚡" },
              { name: "Vercel", logo: "▲" },
              { name: "Linear", logo: "⧉" },
              { name: "Stripe", logo: "💳" }
            ].map((partner, idx) => (
              <div
                key={partner.name}
                className={`flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800 dark:text-white lx-logo-float-${idx}`}
              >
                <span className="text-lg">{partner.logo}</span>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <section
          aria-labelledby="landing-features"
          className="mt-24 space-y-6 py-14 sm:mt-28 sm:py-20"
        >
        {/* Feature bar (like reference UI) */}
        <motion.div
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px 0px" }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="lx-glow-card mx-auto mb-24 max-w-6xl overflow-hidden rounded-3xl p-5 shadow-xl dark:shadow-[0_30px_90px_-70px_rgb(99_102_241_/_0.65)] sm:mb-28"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/55 bg-white/60 dark:border-white/[0.08] dark:bg-slate-900/35 px-4 py-3">
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
              className="lx-btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 min-w-[210px]"
            >
              {quickLoading ? (
                <span className="flex items-center gap-2 font-mono text-xs text-white/90">
                  <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                  {terminalStep}
                </span>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  {t("landing.shortenNow")}
                </>
              )}
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
                  "flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  "border-slate-200 bg-white/70 backdrop-blur-sm text-slate-900",
                  "dark:border-white/[0.08] dark:bg-slate-900/40 dark:text-[#e2e8f0]",
                  highlight
                    ? "ring-1 ring-black/40 dark:border-white/35 dark:bg-white/10"
                    : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex size-10 items-center justify-center rounded-xl",
                    highlight
                      ? "bg-black/10 text-black dark:bg-white/15 dark:text-white"
                      : "bg-black/[0.04] text-neutral-600 dark:bg-white/[0.06] dark:text-[#a3a3a3]",
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
          className="mt-14 grid gap-6 md:grid-cols-3 grid-cols-1"
        >
          {/* Card 1: Real-time Analytics (Double column) */}
          <motion.div
            onMouseMove={handleMouseMove}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="lx-glow-card md:col-span-2 flex flex-col justify-between p-6 cursor-default group"
          >
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#f8fafc] mt-2">
                {t("landing.cardAnalyticsTitle")}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t("landing.cardAnalyticsDesc")}
              </p>
            </div>
            <div className="relative h-28 mt-6 rounded-xl border border-slate-200/30 bg-slate-100/30 dark:border-white/[0.04] dark:bg-black/25 overflow-hidden flex items-end px-3 pb-2">
              <svg className="w-full h-16 text-neutral-800 dark:text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 28 Q 15 5, 30 20 T 60 12 T 90 2 T 100 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M0 28 Q 15 5, 30 20 T 60 12 T 90 2 T 100 8 L 100 30 L 0 30 Z" fill="url(#grad)" opacity="0.15"/>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-2 left-3 flex gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Total Hits</p>
                  <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">14,285</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Redirect SLA</p>
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-[#f8fafc]">99.99%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: QR Codes (Single column) */}
          <motion.div
            onMouseMove={handleMouseMove}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="lx-glow-card md:col-span-1 flex flex-col justify-between p-6 cursor-default group"
          >
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <QrCode className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#f8fafc] mt-2">
                QR Engine
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Instantly render high-resolution, design-tailored QR codes for any short link.
              </p>
            </div>
            <div className="relative h-28 mt-6 rounded-xl border border-slate-200/30 bg-slate-100/30 dark:border-white/[0.04] dark:bg-black/25 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
              <div className="relative size-16 rounded-xl border border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-white/5 flex items-center justify-center lx-animate-spin-qr">
                <QrCode className="size-8 text-neutral-800/60 dark:text-white/60" />
              </div>
              <div className="absolute inset-x-6 top-1/2 h-[1px] bg-neutral-300 dark:bg-neutral-800 shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
            </div>
          </motion.div>

          {/* Card 3: Passcode Protection (Single column) */}
          <motion.div
            onMouseMove={handleMouseMove}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="lx-glow-card md:col-span-1 flex flex-col justify-between p-6 cursor-default group"
          >
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <Shield className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#f8fafc] mt-2">
                Passcode Guard
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Restrict access to sensitive target endpoints with customized passcodes and access levels.
              </p>
            </div>
            <div className="relative h-28 mt-6 rounded-xl border border-slate-200/30 bg-slate-100/30 dark:border-white/[0.04] dark:bg-black/25 overflow-hidden flex flex-col justify-center px-4">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                {[1, 2, 3, 4].map(dot => (
                  <span key={dot} className="size-2 rounded-full bg-slate-400 dark:bg-white/25 animate-pulse" style={{ animationDelay: `${dot * 0.15}s` }} />
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <Shield className="size-3" />
                  Encrypted DNS
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Routing Engines (Double column) */}
          <motion.div
            onMouseMove={handleMouseMove}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="lx-glow-card md:col-span-2 flex flex-col justify-between p-6 cursor-default group"
          >
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <Link2 className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#f8fafc] mt-2">
                Smart Redirect Rules
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Route traffic based on visitor device type, geographical country region, or preferred browser languages.
              </p>
            </div>
            <div className="relative h-28 mt-6 rounded-xl border border-slate-200/30 bg-slate-100/30 dark:border-white/[0.04] dark:bg-black/25 overflow-hidden flex flex-col justify-center px-4 gap-2">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200/20 dark:border-white/[0.04] pb-1.5">
                <span className="flex items-center gap-1">📱 Mobile User</span>
                <span className="text-neutral-500 dark:text-neutral-300">➜</span>
                <span>iOS App Store</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200/20 dark:border-white/[0.04] pb-1.5">
                <span className="flex items-center gap-1">🇺🇸 US Region</span>
                <span className="text-neutral-500 dark:text-neutral-300">➜</span>
                <span>us-west-gateway.app</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">⏳ link_expiry</span>
                <span className="text-neutral-500 dark:text-neutral-300">➜</span>
                <span className="text-neutral-500 dark:text-neutral-300 font-mono">expired_route</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        </section>

        <PricingSection />
        <FaqSection />
      </div>
    </div>
  );
};

export default LandingPage;
