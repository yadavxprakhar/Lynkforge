import { useMemo, useState } from "react";
import Graph from "./Graph";
import { motion } from "framer-motion";
import { useStoreContext } from "../../contextApi/ContextApi";
import {
  downloadAnalyticsCsv,
  useFetchAnalyticsBreakdown,
  useFetchAnalyticsOverview,
  useFetchMyShortUrls,
} from "../../hooks/useQuery";
import ShortenPopUp from "./ShortenPopUp";
import { ArrowDownRight, ArrowUpRight, Download, Link2 } from "lucide-react";
import ShortenUrlList from "./ShortenUrlList";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import HomeSpaceBackground from "../HomeSpaceBackground";
import { fadeUpMountProps, tapScale } from "../../utils/motionVariants";
import toast from "react-hot-toast";
import { extractApiErrorMessage } from "../../utils/apiError";
import dayjs from "dayjs";

const fmt = (d) => dayjs(d).format("YYYY-MM-DD");

const DashboardLayout = () => {
  const { t } = useTranslation();
  const { token, theme } = useStoreContext();
  const navigate = useNavigate();
  const [shortenPopUp, setShortenPopUp] = useState(false);
  const isDark = theme === "dark";

  const [rangePreset, setRangePreset] = useState("30d"); // 7d | 30d | 90d | custom
  const [customStart, setCustomStart] = useState(fmt(dayjs().subtract(29, "day")));
  const [customEnd, setCustomEnd] = useState(fmt(dayjs()));

  const { startDate, endDate } = useMemo(() => {
    const end = dayjs();
    if (rangePreset === "7d") {
      return { startDate: fmt(end.subtract(6, "day")), endDate: fmt(end) };
    }
    if (rangePreset === "90d") {
      return { startDate: fmt(end.subtract(89, "day")), endDate: fmt(end) };
    }
    if (rangePreset === "custom") {
      return { startDate: customStart, endDate: customEnd };
    }
    // default 30d
    return { startDate: fmt(end.subtract(29, "day")), endDate: fmt(end) };
  }, [rangePreset, customStart, customEnd]);

  const { isLoading, data: myShortenUrls, refetch: refetchMyUrls } =
    useFetchMyShortUrls(token, onError);

  const {
    isLoading: analyticsLoading,
    data: analytics,
    refetch: refetchAnalytics,
  } = useFetchAnalyticsOverview(token, startDate, endDate, onError);

  const {
    data: breakdown,
    isLoading: breakdownLoading,
    isError: breakdownErrored,
    error: breakdownError,
  } = useFetchAnalyticsBreakdown(token, startDate, endDate, onError);

  const breakdownForbidden =
    breakdownErrored && breakdownError?.response?.status === 403;

  const handleLinkDeleted = () => {
    refetchMyUrls();
    refetchAnalytics();
  };

  function onError() {
    navigate("/error");
  }

  return (
    <div className="relative w-full">
      {isDark ? <HomeSpaceBackground /> : null}

      <div className="lx-page-inner lx-dashboard-shell">
        {analyticsLoading ? (
          <div className="space-y-10">
            <div className="space-y-2">
              <div className="h-9 w-40 rounded-xl bg-slate-200/70 animate-pulse dark:bg-white/[0.08]" />
              <div className="h-4 w-72 rounded-lg bg-slate-200/60 animate-pulse dark:bg-white/[0.06]" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="lx-card p-5"
                >
                  <div className="h-3 w-24 rounded bg-slate-200/70 animate-pulse dark:bg-white/[0.08]" />
                  <div className="mt-3 h-8 w-28 rounded bg-slate-200/70 animate-pulse dark:bg-white/[0.08]" />
                  <div className="mt-2 h-4 w-32 rounded bg-slate-200/60 animate-pulse dark:bg-white/[0.06]" />
                </div>
              ))}
            </div>

            <div className="lx-card relative min-h-[23rem] overflow-hidden p-5 sm:min-h-[25rem] sm:p-8">
              <div className="h-full w-full rounded-2xl bg-slate-200/60 animate-pulse dark:bg-white/[0.06]" />
            </div>

            <div className="flex items-center justify-center">
              <Loader />
            </div>
          </div>
        ) : (
          <div className="space-y-14">
          <motion.header {...fadeUpMountProps(0.03)} className="space-y-2">
            <h1 className="text-[1.85rem] font-extrabold tracking-tight text-lx-foreground sm:text-[2rem]">
              {t("dashboard.title")}
            </h1>
            <p className="max-w-prose text-[0.9375rem] leading-relaxed text-lx-muted">
              {t("dashboard.subtitle")}
            </p>
          </motion.header>

          <motion.div {...fadeUpMountProps(0.06)} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.9375rem] font-semibold text-lx-foreground">
                {t("dashboard.activity", { start: startDate, end: endDate })}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "7d", labelKey: "dashboard.preset7" },
                  { id: "30d", labelKey: "dashboard.preset30" },
                  { id: "90d", labelKey: "dashboard.preset90" },
                  { id: "custom", labelKey: "dashboard.presetCustom" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setRangePreset(b.id)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wide transition",
                      rangePreset === b.id
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white dark:border-white/[0.12] dark:bg-slate-950/20 dark:text-[#94a3b8] dark:hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    {t(b.labelKey)}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const blob = await downloadAnalyticsCsv(token, startDate, endDate);
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `lynkforge-clicks_${startDate}_to_${endDate}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      const msg = extractApiErrorMessage(err);
                      if (err?.response?.status === 403) {
                        toast.error(msg || t("dashboard.exportForbidden"));
                        return;
                      }
                      toast.error(msg || t("dashboard.exportFailed"));
                      onError();
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-600 transition hover:bg-white dark:border-white/[0.12] dark:bg-slate-950/20 dark:text-[#94a3b8] dark:hover:bg-white/[0.06]"
                >
                  <Download className="size-4" aria-hidden />
                  {t("dashboard.exportCsv")}
                </button>
              </div>
            </div>

            {rangePreset === "custom" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-[#94a3b8]">
                  {t("dashboard.start")}
                  <input
                    type="date"
                    value={customStart}
                    max={customEnd}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-soft outline-none dark:border-white/[0.12] dark:bg-slate-950/25 dark:text-[#e2e8f0]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-[#94a3b8]">
                  {t("dashboard.end")}
                  <input
                    type="date"
                    value={customEnd}
                    min={customStart}
                    max={fmt(dayjs())}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-soft outline-none dark:border-white/[0.12] dark:bg-slate-950/25 dark:text-[#e2e8f0]"
                  />
                </label>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lx-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-lx-muted">
                  {t("dashboard.totalClicks")}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-lx-foreground">
                  {analytics?.kpis?.totalClicks ?? 0}
                </p>
                <p className="mt-1 text-sm text-lx-muted">
                  {analytics?.kpis?.previousTotalClicks != null ? (
                    <>
                      {t("dashboard.vsPrev")} {analytics.kpis.previousTotalClicks}{" "}
                      <span
                        className={[
                          "inline-flex items-center gap-1 font-semibold",
                          (analytics.kpis.percentChange ?? 0) >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        ].join(" ")}
                      >
                        {(analytics.kpis.percentChange ?? 0) >= 0 ? (
                          <ArrowUpRight className="size-4" aria-hidden />
                        ) : (
                          <ArrowDownRight className="size-4" aria-hidden />
                        )}
                        {Math.abs(analytics.kpis.percentChange ?? 0).toFixed(0)}%
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="lx-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-lx-muted">
                  {t("dashboard.clicksToday")}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-lx-foreground">
                  {analytics?.kpis?.clicksToday ?? 0}
                </p>
                <p className="mt-1 text-sm text-lx-muted">{t("dashboard.today")}</p>
              </div>

              <div className="lx-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-lx-muted">
                  {t("dashboard.activeLinks")}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-lx-foreground">
                  {analytics?.kpis?.activeLinks ?? 0}
                </p>
                <p className="mt-1 text-sm text-lx-muted">
                  {t("dashboard.totalLinksOwned")}
                </p>
              </div>

              <div className="lx-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-lx-muted">
                  {t("dashboard.topLink")}
                </p>
                <p className="mt-2 truncate text-lg font-extrabold tracking-tight text-lx-foreground">
                  {analytics?.kpis?.topLink?.shortUrl ?? "—"}
                </p>
                <p className="mt-1 text-sm text-lx-muted">
                  {analytics?.kpis?.topLink
                    ? t("dashboard.clicksShort", {
                        count: analytics.kpis.topLink.clicks,
                      })
                    : t("dashboard.noClicksYet")}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUpMountProps(0.08)} className="relative">
            <div className="lx-card relative min-h-[23rem] overflow-hidden p-5 sm:min-h-[25rem] sm:p-8">
              {(analytics?.graphData?.length ?? 0) === 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                  <p className="text-base font-semibold text-lx-foreground sm:text-lg">
                    {t("dashboard.noDataTitle")}
                  </p>
                  <p className="mt-2 max-w-md text-[0.9375rem] text-lx-muted">
                    {t("dashboard.noDataSub", { start: startDate, end: endDate })}
                  </p>
                </div>
              )}
              <Graph graphData={analytics?.graphData ?? []} />
            </div>
          </motion.div>

          <motion.div {...fadeUpMountProps(0.09)} className="grid gap-6 lg:grid-cols-2">
            <div className="lx-card p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-extrabold tracking-tight text-lx-foreground">
                  {t("dashboard.topReferrers")}
                </h2>
                <p className="text-xs font-semibold text-lx-muted">
                  {t("dashboard.range")}
                </p>
              </div>

              {breakdownLoading ? (
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full rounded bg-slate-200/60 animate-pulse dark:bg-white/[0.06]"
                    />
                  ))}
                </div>
              ) : breakdownForbidden ? (
                <p className="mt-5 text-sm text-lx-muted">
                  {t("dashboard.breakdownNeedsPro")}
                </p>
              ) : (breakdown?.topReferrers?.length ?? 0) === 0 ? (
                <p className="mt-5 text-sm text-lx-muted">
                  {t("dashboard.noReferrerData")}
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {breakdown.topReferrers.map((r) => (
                    <div key={r.key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-lx-foreground">
                          {r.key}
                        </p>
                        <p className="shrink-0 text-sm font-bold text-lx-foreground">
                          {r.clicks}
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200/70 dark:bg-white/[0.06]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                          style={{
                            width: `${
                              Math.min(
                                100,
                                (r.clicks /
                                  Math.max(
                                    1,
                                    breakdown.topReferrers?.[0]?.clicks ?? 1
                                  )) *
                                  100
                              ) || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lx-card p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-extrabold tracking-tight text-lx-foreground">
                  {t("dashboard.devices")}
                </h2>
                <p className="text-xs font-semibold text-lx-muted">
                  {t("dashboard.range")}
                </p>
              </div>

              {breakdownLoading ? (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl bg-slate-200/60 animate-pulse dark:bg-white/[0.06]"
                    />
                  ))}
                </div>
              ) : breakdownForbidden ? (
                <p className="mt-5 text-sm text-lx-muted">
                  {t("dashboard.breakdownNeedsPro")}
                </p>
              ) : (breakdown?.devices?.length ?? 0) === 0 ? (
                <p className="mt-5 text-sm text-lx-muted">
                  {t("dashboard.noDeviceData")}
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {breakdown.devices.map((d) => (
                    <div
                      key={d.key}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft dark:border-white/[0.12] dark:bg-slate-950/20"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-lx-muted">
                        {d.key}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold tracking-tight text-lx-foreground">
                        {d.clicks}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            {...fadeUpMountProps(0.1)}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-[0.9375rem] text-lx-muted">
              {(myShortenUrls?.length ?? 0) > 0
                ? t("dashboard.linkCount", { count: myShortenUrls.length })
                : t("dashboard.noLinksYetText")}
            </p>
            <motion.button
              type="button"
              className="lx-btn-primary self-start sm:self-auto"
              onClick={() => setShortenPopUp(true)}
              {...tapScale}
            >
              {t("dashboard.createShortUrl")}
            </motion.button>
          </motion.div>

          <div>
            {!isLoading && (myShortenUrls?.length ?? 0) === 0 ? (
              <motion.div
                {...fadeUpMountProps(0.12)}
                className="lx-card flex flex-col items-center justify-center gap-4 px-8 py-20 text-center"
              >
                <Link2
                  className="size-9 text-blue-600 dark:text-blue-400"
                  aria-hidden
                />
                <p className="text-base font-semibold text-lx-foreground">
                  {t("dashboard.emptyTitle")}
                </p>
                <p className="max-w-md text-[0.9375rem] leading-relaxed text-lx-muted">
                  {t("dashboard.emptySub")}
                </p>
              </motion.div>
            ) : (
              <ShortenUrlList
                data={myShortenUrls}
                onLinkDeleted={handleLinkDeleted}
                analyticsRange={{ startDate, endDate }}
              />
            )}
          </div>
        </div>
      )}

      <ShortenPopUp
        refetch={refetchMyUrls}
        open={shortenPopUp}
        setOpen={setShortenPopUp}
      />
      </div>
    </div>
  );
};

export default DashboardLayout;
