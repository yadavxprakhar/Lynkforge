import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  BarChart3,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  MousePointerClick,
  Trash2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useStoreContext } from "../../contextApi/ContextApi";
import { Hourglass } from "react-loader-spinner";
import Graph from "./Graph";
import { cardHoverSpring, tapScale } from "../../utils/motionVariants";
import { fetchLinkAnalytics } from "../../hooks/useQuery";

const ShortenItem = ({
  originalUrl,
  shortUrl,
  clickCount,
  createdDate,
  onLinkDeleted,
  analyticsRange,
}) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [analyticToggle, setAnalyticToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [analyticsData, setAnalyticsData] = useState([]);

  const subDomain = import.meta.env.VITE_REACT_FRONT_END_URL.replace(
    /^https?:\/\//,
    ""
  );

  const fullShort =
    import.meta.env.VITE_REACT_FRONT_END_URL + "/s/" + `${shortUrl}`;

  const analyticsHandler = (key) => {
    if (!analyticToggle) {
      setSelectedUrl(key);
    }
    setAnalyticToggle(!analyticToggle);
  };

  const deleteHandler = async () => {
    if (
      !window.confirm(t("linkCard.deleteConfirm"))
    ) {
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete(
        `/api/urls/${encodeURIComponent(shortUrl)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      onLinkDeleted?.();
      setAnalyticToggle(false);
      setAnalyticsData([]);
    } catch {
      navigate("/error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchMyShortUrl = useCallback(async () => {
    setLoader(true);
    try {
      const startDate = analyticsRange?.startDate ?? dayjs().subtract(29, "day").format("YYYY-MM-DD");
      const endDate = analyticsRange?.endDate ?? dayjs().format("YYYY-MM-DD");
      const graphData = await fetchLinkAnalytics(token, selectedUrl, startDate, endDate);
      setAnalyticsData(graphData);
      setSelectedUrl("");
    } catch {
      navigate("/error");
    } finally {
      setLoader(false);
    }
  }, [selectedUrl, token, navigate, analyticsRange]);

  useEffect(() => {
    if (selectedUrl) {
      fetchMyShortUrl();
    }
  }, [selectedUrl, fetchMyShortUrl]);

  return (
    <motion.div
      layout={false}
      className="lx-card overflow-hidden"
      transition={cardHoverSpring}
      whileHover={reduceMotion ? undefined : { y: -2 }}
    >
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-6">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-2 text-[15px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
              to={fullShort}
            >
              <span className="truncate">{subDomain + "/s/" + shortUrl}</span>
              <ExternalLink className="size-4 shrink-0 opacity-80" aria-hidden />
            </Link>
          </div>

          <p className="break-all text-sm text-lx-muted">{originalUrl}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-lx-foreground">
            <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <MousePointerClick className="size-4" aria-hidden />
              {t("linkCard.click", { count: clickCount })}
            </span>
            <span className="inline-flex items-center gap-2 text-lx-muted">
              <Calendar className="size-4 text-lx-foreground/80" aria-hidden />
              {dayjs(createdDate).format("MMM D, YYYY")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:shrink-0 sm:justify-end">
          <CopyToClipboard
            onCopy={() => setIsCopied(true)}
            text={fullShort}
          >
            <motion.button
              type="button"
              className="lx-btn-primary inline-flex gap-2 px-5 py-2.5 text-sm"
              {...tapScale}
            >
              {isCopied ? (
                <>
                  <Check className="size-4" aria-hidden />
                  {t("linkCard.copied")}
                </>
              ) : (
                <>
                  <Copy className="size-4" aria-hidden />
                  {t("linkCard.copy")}
                </>
              )}
            </motion.button>
          </CopyToClipboard>

          <motion.button
            type="button"
            onClick={() => analyticsHandler(shortUrl)}
            className="lx-btn-secondary inline-flex gap-2 border-blue-500/25 px-5 py-2.5 text-sm text-lx-foreground dark:border-blue-500/25"
            {...tapScale}
          >
            <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" aria-hidden />
            {t("linkCard.analytics")}
          </motion.button>

          <motion.button
            type="button"
            onClick={deleteHandler}
            disabled={deleteLoading}
            className="inline-flex gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/15"
            {...tapScale}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            {deleteLoading ? t("linkCard.deleting") : t("linkCard.delete")}
          </motion.button>
        </div>
      </div>

      <Fragment>
        <div
          className={`${
            analyticToggle ? "flex" : "hidden"
          } relative min-h-[22rem] flex-col border-t border-lx-border`}
        >
          {loader ? (
            <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-3">
              <Hourglass
                visible
                height="48"
                width="48"
                ariaLabel={t("linkCard.loadingAria")}
                colors={["#2563eb", "#93c5fd"]}
              />
              <p className="text-sm text-lx-muted">{t("linkCard.loadingAnalytics")}</p>
            </div>
          ) : (
            <>
              {analyticsData.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                  <p className="text-base font-semibold text-lx-foreground">
                    {t("linkCard.emptyTitle")}
                  </p>
                  <p className="mt-2 max-w-md text-sm text-lx-muted">
                    {t("linkCard.emptySub")}
                  </p>
                </div>
              )}
              <div className="p-4 sm:p-6">
                <Graph graphData={analyticsData} />
              </div>
            </>
          )}
        </div>
      </Fragment>
    </motion.div>
  );
};

export default ShortenItem;
