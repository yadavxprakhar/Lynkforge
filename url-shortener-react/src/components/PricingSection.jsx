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
          "border-blue-500/30 bg-white/95 ring-1 ring-blue-500/15 shadow-[0_22px_60px_-40px_rgb(37_99_235_/_0.35)] dark:border-blue-500/35 dark:bg-[rgb(18_26_46)] dark:ring-blue-400/15",
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
          "border-slate-200 bg-white/95 dark:border-white/[0.1] dark:bg-[rgb(21_31_53)]",
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px 0px" }}
      transition={{ duration: 0.45, ease: easeSmooth }}
      className={[
        "relative flex h-full flex-col gap-6 rounded-2xl border p-6 shadow-soft",
        plan.tone,
      ].join(" ")}
    >
      {plan.featured ? (
        <div className="absolute -top-3 left-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:border-blue-400/30 dark:bg-blue-500/14 dark:text-blue-300">
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
                  ? "border-slate-200 bg-slate-50 text-slate-900 dark:border-white/[0.12] dark:bg-slate-950/55 dark:text-[#e2e8f0]"
                  : "border-slate-200/70 bg-transparent text-slate-400 dark:border-white/[0.08] dark:text-[#475569]",
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px 0px" }}
        transition={{ duration: 0.45, ease: easeSmooth }}
        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-soft dark:border-white/[0.12] dark:bg-slate-950/20">
          <span
            className={[
              "text-sm font-semibold",
              billing === "monthly"
                ? "text-slate-900 dark:text-[#f8fafc]"
                : "text-slate-500 dark:text-[#94a3b8]",
            ].join(" ")}
          >
            {t("pricing.monthly")}
          </span>
          <button
            type="button"
            aria-label={t("pricing.billingToggle")}
            aria-pressed={billing === "annual"}
            onClick={() => setBilling((b) => (b === "monthly" ? "annual" : "monthly"))}
            className={[
              "relative h-8 w-14 rounded-full border transition-colors duration-200",
              billing === "annual"
                ? "border-emerald-500/30 bg-emerald-500/25"
                : "border-slate-300 bg-slate-200/80 dark:border-white/[0.14] dark:bg-white/[0.06]",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "absolute top-1/2 left-0.5 size-6 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-[transform] duration-200",
                billing === "annual" ? "translate-x-6" : "translate-x-0",
                "dark:bg-[#e2e8f0] dark:ring-white/10",
              ].join(" ")}
            />
          </button>
          <span
            className={[
              "text-sm font-semibold",
              billing === "annual"
                ? "text-slate-900 dark:text-[#f8fafc]"
                : "text-slate-500 dark:text-[#94a3b8]",
            ].join(" ")}
          >
            {t("pricing.annual")}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {t("pricing.savePct")}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-soft dark:border-white/[0.12] dark:bg-slate-950/20">
          <span className="text-sm font-semibold text-slate-900 dark:text-[#f8fafc]">
            {currency}
          </span>
          <button
            type="button"
            onClick={() => setCurrency((c) => (c === "INR" ? "USD" : "INR"))}
            className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-[#94a3b8] dark:hover:bg-white/[0.10]"
          >
            {t("pricing.switchCurrency")}
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

      {/* Inspired CTA panel (starry gradient like reference) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px 0px" }}
        transition={{ duration: 0.5, ease: easeSmooth }}
        className="relative mt-24 overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_140%_120%_at_50%_0%,rgb(99_102_241_/_0.42)_0%,rgb(59_130_246_/_0.18)_32%,transparent_68%),linear-gradient(180deg,rgb(9_14_24)_0%,rgb(6_10_20)_100%)] px-7 py-12 text-center shadow-[0_30px_80px_-52px_rgb(99_102_241_/_0.55)] dark:border-white/[0.1] sm:mt-28 sm:px-10"
      >
        <div aria-hidden className="lx-stars-pan absolute inset-0 opacity-[0.42]" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgb(255_255_255_/_0.10)_0%,transparent_52%)]"
        />
        <div className="relative z-[1] mx-auto max-w-2xl space-y-4">
          <p className="mx-auto inline-flex items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
            {t("pricing.ctaPanelBadge")}
          </p>
          <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
            {t("pricing.ctaPanelTitle")}
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
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

