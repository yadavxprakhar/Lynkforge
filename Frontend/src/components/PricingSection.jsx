import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStoreContext } from "../contextApi/ContextApi";
import { easeSmooth, tapScale } from "../utils/motionVariants";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import { extractApiErrorMessage } from "../utils/apiError";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function usePlans(t) {
  return useMemo(
    () => [
      {
        name: t("pricing.plan.starter.name"),
        price: { kind: "free" },
        blurb: t("pricing.plan.starter.blurb"),
        features: [
          { label: t("pricing.plan.starter.feat1"), included: true },
          { label: t("pricing.plan.starter.feat2"), included: true },
          { label: t("pricing.plan.starter.feat3"), included: true },
          { label: t("pricing.plan.starter.feat4"), included: false },
          { label: t("pricing.plan.starter.feat5"), included: false },
          { label: t("pricing.plan.starter.feat6"), included: false },
          { label: t("pricing.plan.starter.feat7"), included: false },
          { label: t("pricing.plan.starter.feat8"), included: false },
        ],
        tone:
          "border-slate-200 bg-white/95 dark:border-white/[0.1] dark:bg-[rgb(21_31_53)]",
        cta: t("pricing.plan.starter.cta"),
      },
      {
        name: t("pricing.plan.pro.name"),
        price: { kind: "paid", monthlyUsd: 1 },
        blurb: t("pricing.plan.pro.blurb"),
        features: [
          { label: t("pricing.plan.pro.feat1"), included: true },
          { label: t("pricing.plan.pro.feat2"), included: true },
          { label: t("pricing.plan.pro.feat3"), included: true },
          { label: t("pricing.plan.pro.feat4"), included: true },
          { label: t("pricing.plan.pro.feat5"), included: true },
          { label: t("pricing.plan.pro.feat6"), included: true },
          { label: t("pricing.plan.pro.feat7"), included: true },
          { label: t("pricing.plan.pro.feat8"), included: false },
        ],
        tone:
          "border-black bg-white ring-1 ring-black/10 shadow-[0_22px_60px_-40px_rgba(255,255,255,0.06)] dark:border-white dark:bg-neutral-900 dark:ring-white/10",
        cta: t("pricing.plan.pro.cta"),
        featured: true,
      },
      {
        name: t("pricing.plan.business.name"),
        price: { kind: "paid", monthlyUsd: 2 },
        blurb: t("pricing.plan.business.blurb"),
        features: [
          { label: t("pricing.plan.business.feat1"), included: true },
          { label: t("pricing.plan.business.feat2"), included: true },
          { label: t("pricing.plan.business.feat3"), included: true },
          { label: t("pricing.plan.business.feat4"), included: true },
          { label: t("pricing.plan.business.feat5"), included: true },
          { label: t("pricing.plan.business.feat6"), included: true },
          { label: t("pricing.plan.business.feat7"), included: true },
          { label: t("pricing.plan.business.feat8"), included: true },
        ],
        tone:
          "border-slate-200 bg-white/95 dark:border-white/[0.1] dark:bg-[#0A0A0A]",
        cta: t("pricing.plan.business.cta"),
      },
    ],
    [t],
  );
}

const USD_TO_INR = 83; // simple display conversion (can be replaced with real FX later)
const ANNUAL_DISCOUNT = 0.17;

function formatMoney(amount, currency, localeTag) {
  const symbol = currency === "INR" ? "₹" : "$";
  const loc = localeTag?.replace(/_/g, "-") || "en";
  const formatted = Math.round(amount).toLocaleString(loc, { maximumFractionDigits: 0 });
  return `${symbol}${formatted}`;
}

function computePrice(planPrice, billing, currency, t, localeTag) {
  if (!planPrice || planPrice.kind === "free") {
    return { main: t("pricing.free"), sub: "" };
  }
  const monthlyUsd = planPrice.monthlyUsd ?? 0;
  const annualUsd = monthlyUsd * 12 * (1 - ANNUAL_DISCOUNT);
  const usdAmount = billing === "annual" ? annualUsd : monthlyUsd;
  const amount = currency === "INR" ? usdAmount * USD_TO_INR : usdAmount;

  return {
    main: formatMoney(amount, currency, localeTag),
    sub:
      billing === "annual" ? t("pricing.perYear") : t("pricing.perMonth"),
  };
}

function PlanCard({ plan, onClick, billing, currency, localeTag }) {
  const { t } = useTranslation();
  const price = computePrice(plan.price, billing, currency, t, localeTag);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const cardStyle = plan.featured
    ? "border-black bg-white dark:border-white dark:bg-neutral-900 ring-2 ring-black/10 shadow-[0_22px_60px_-40px_rgba(0,0,0,0.2)] dark:ring-white/10"
    : "";

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px 0px" }}
      transition={{ duration: 0.45, ease: easeSmooth }}
      className={`lx-glow-card relative flex h-full flex-col gap-6 p-6 ${cardStyle}`}
    >
      {plan.featured ? (
        <div className="absolute -top-3 left-6 rounded-full border border-black/35 bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black dark:border-white/35 dark:bg-white/10 dark:text-white">
          {t("pricing.mostPopular")}
        </div>
      ) : null}

      <div className="space-y-2">
        <h3 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
          {plan.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-[#94a3b8]">{plan.blurb}</p>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
          {price.main}
        </div>
        {plan.price.kind === "paid" ? (
          <div className="pb-1 text-sm font-medium text-slate-500 dark:text-[#64748b]">
            {price.sub}
          </div>
        ) : null}
      </div>

      <ul className="space-y-3">
        {plan.features.map(({ label, included }) => (
          <li
            key={label}
            className={[
              "flex items-start gap-2 text-sm",
              included
                ? "text-slate-700 dark:text-[#cbd5e1]"
                : "text-slate-500/85 line-through decoration-slate-400/50 dark:text-[#64748b]",
            ].join(" ")}
          >
            <span
              className={[
                "mt-0.5 inline-flex size-5 items-center justify-center rounded-md border",
                included
                  ? "border-neutral-200/40 bg-neutral-50/50 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  : "border-slate-200/40 bg-transparent text-slate-400 dark:border-white/[0.06] dark:text-slate-600",
              ].join(" ")}
              aria-hidden
            >
              {included ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            </span>
            <span className="leading-relaxed">{label}</span>
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        onClick={onClick}
        {...tapScale}
        className={[
          "mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300",
          plan.featured
            ? "lx-btn-primary"
            : "lx-btn-secondary dark:!bg-slate-950/35 dark:hover:!bg-white/[0.06]",
        ].join(" ")}
      >
        {plan.cta}
        <ArrowRight className="size-[1.05rem]" aria-hidden />
      </motion.button>
    </motion.div>
  );
}

const PricingSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { token } = useStoreContext();
  const [billing, setBilling] = useState("monthly"); // monthly | annual
  const [currency, setCurrency] = useState("INR"); // INR | USD

  const goStart = () => navigate(token ? "/dashboard" : "/register");

  const displayedPlans = usePlans(t);
  const localeTag = i18n.resolvedLanguage || i18n.language || "en";

  const startCheckout = async (planName) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (currency !== "USD") {
      toast.error(t("pricing.paymentsUsdOnly"));
      return;
    }
    if (billing !== "monthly") {
      toast.error(t("pricing.monthlyOnlyForNow"));
      return;
    }

    const ok = await loadRazorpayScript();
    if (!ok) {
      toast.error(t("pricing.paymentSdkLoadFailed"));
      return;
    }

    const planKey = planName?.toLowerCase().includes("business") ? "business" : "pro";

    try {
      const res = await api.post(
        "/api/payments/razorpay/subscription",
        { plan: planKey, interval: "monthly" },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const { keyId, subscriptionId } = res?.data ?? {};
      if (!keyId || !subscriptionId) {
        toast.error(t("pricing.paymentInitFailed"));
        return;
      }

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "Lynkforge",
        description: `${planKey.toUpperCase()} plan (monthly)`,
        handler: () => {
          toast.success(t("pricing.paymentStarted"));
          navigate("/dashboard");
        },
        modal: {
          ondismiss: () => {},
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || t("pricing.paymentInitFailed"));
    }
  };

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="mt-20 sm:mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          id="pricing-title"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.45, ease: easeSmooth }}
          className="text-2xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-[2rem]"
        >
          {t("pricing.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.42, delay: 0.03, ease: easeSmooth }}
          className="mt-3 text-[0.95rem] leading-relaxed text-slate-600 dark:text-[#94a3b8]"
        >
          {t("pricing.subtitle")}
        </motion.p>
      </div>      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px 0px" }}
        transition={{ duration: 0.45, ease: easeSmooth }}
        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center"
      >
        {/* Billing segmented slider */}
        <div className="relative flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-white/[0.04]">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${
              billing === "monthly"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t("pricing.monthly")}
            {billing === "monthly" && (
              <motion.span
                layoutId="billing-toggle-pill"
                className="absolute inset-0 z-[-1] rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
              billing === "annual"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t("pricing.annual")}
            <span className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-black dark:text-white">
              {t("pricing.savePct")}
            </span>
            {billing === "annual" && (
              <motion.span
                layoutId="billing-toggle-pill"
                className="absolute inset-0 z-[-1] rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Currency segmented slider */}
        <div className="relative flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-white/[0.04]">
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${
              currency === "INR"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            INR
            {currency === "INR" && (
              <motion.span
                layoutId="currency-toggle-pill"
                className="absolute inset-0 z-[-1] rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${
              currency === "USD"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            USD
            {currency === "USD" && (
              <motion.span
                layoutId="currency-toggle-pill"
                className="absolute inset-0 z-[-1] rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {displayedPlans.map((p) => (
          <PlanCard
            key={p.name}
            plan={p}
            onClick={() => {
              if (p.price.kind === "free") return goStart();
              return startCheckout(p.name);
            }}
            billing={billing}
            currency={currency}
            localeTag={localeTag}
          />
        ))}
      </div>

      {/* Inspired CTA panel (glassmorphic gradient like reference) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px 0px" }}
        transition={{ duration: 0.5, ease: easeSmooth }}
        className="lx-glass-card relative mt-24 overflow-hidden rounded-3xl border border-slate-200/50 bg-white/70 backdrop-blur-md px-7 py-12 text-center shadow-[0_30px_80px_-52px_rgba(0,0,0,0.15)] dark:border-white/[0.08] dark:bg-slate-950/45 dark:shadow-[0_30px_80px_-52px_rgba(0,0,0,0.5)] sm:mt-28 sm:px-10"
      >
        <div aria-hidden className="lx-stars-pan absolute inset-0 opacity-[0.25]" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.03)_0%,transparent_52%)]"
        />
        <div className="relative z-[1] mx-auto max-w-2xl space-y-4">
          <p className="mx-auto inline-flex items-center justify-center rounded-full border border-slate-200/60 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-white/[0.14] dark:bg-white/[0.06] dark:text-white/80">
            {t("pricing.ctaPanelBadge")}
          </p>
          <h3 className="text-2xl font-extrabold tracking-tight text-[#0f172a] dark:text-white sm:text-[2rem]">
            {t("pricing.ctaPanelTitle")}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">
            {t("pricing.ctaPanelSub")}
          </p>
          <motion.button
            type="button"
            onClick={goStart}
            {...tapScale}
            className="lx-btn-primary mx-auto inline-flex rounded-xl px-10 py-3.5 text-[0.95rem]"
          >
            {t("pricing.ctaPanelButton")}
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default PricingSection;

