import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Link2, QrCode, Shield, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import toast from "react-hot-toast";
import { tapScale } from "../utils/motionVariants";
import { useStoreContext } from "../contextApi/ContextApi";

function isoLocalToLocalDateTime(value) {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

const HomeAdvancedShortenModal = ({ open, onClose, feature = "custom" }) => {
  const { token } = useStoreContext();
  const { t, i18n } = useTranslation();

  const meta = useMemo(() => {
    const byFeature = {
      custom: { title: t("landing.featCustom"), Icon: Link2 },
      password: { title: t("landing.featPassword"), Icon: Shield },
      expiry: { title: t("landing.featExpiry"), Icon: CalendarClock },
      qr: { title: t("landing.featQr"), Icon: QrCode },
    };
    return byFeature[feature] ?? byFeature.custom;
  }, [feature, t, i18n.language]);

  const [loading, setLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [qrPngBase64, setQrPngBase64] = useState(null);
  const [shortUrl, setShortUrl] = useState(null);

  const wantsQr = useMemo(() => feature === "qr", [feature]);

  const submit = async () => {
    if (!originalUrl.trim()) {
      toast.error(t("advancedShorten.toastPasteUrl"));
      return;
    }
    setLoading(true);
    setQrPngBase64(null);
    setShortUrl(null);
    try {
      const payload = {
        originalUrl: originalUrl.trim(),
        customAlias: feature === "custom" ? customAlias.trim() : customAlias.trim() || undefined,
        password: feature === "password" ? password : password || undefined,
        expiresAt: feature === "expiry" ? isoLocalToLocalDateTime(expiresAt) : expiresAt ? isoLocalToLocalDateTime(expiresAt) : null,
        generateQrCode: wantsQr,
      };

      const { data } = await api.post("/api/urls/shorten/advanced", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const dto = data?.url ?? data;
      const short = `${import.meta.env.VITE_REACT_FRONT_END_URL + "/s/" + dto.shortUrl}`;
      setShortUrl(short);
      if (data?.qrCodePngBase64) setQrPngBase64(data.qrCodePngBase64);

      await navigator.clipboard.writeText(short);
      toast.success(t("advancedShorten.toastCopied"));
    } catch (err) {
      const message = err?.response?.data?.message;
      toast.error(message || t("advancedShorten.toastFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/[0.10] bg-[rgb(15_22_36_/_0.92)] shadow-[0_40px_120px_-70px_rgb(0_0_0_/_0.9)]"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/12 text-[#93c5fd]">
                  <meta.Icon className="size-5" aria-hidden />
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight text-white">{meta.title}</div>
                  <div className="text-xs text-white/65">
                    {t("advancedShorten.loggedInSubtitle")}
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                aria-label={t("common.close")}
                onClick={onClose}
                {...tapScale}
                className="absolute right-4 top-4 rounded-xl p-2 text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-5" />
              </motion.button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                  {t("advancedShorten.destinationUrl")}
                </label>
                <input
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.10] bg-slate-950/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/35"
                  placeholder={t("advancedShorten.destinationPlaceholder")}
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                />
              </div>

              {feature === "custom" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                    {t("advancedShorten.customAlias")}
                  </label>
                  <input
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.10] bg-slate-950/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/35"
                    placeholder={t("advancedShorten.customAliasPlaceholder")}
                    spellCheck={false}
                  />
                  <p className="text-xs text-white/45">{t("advancedShorten.customAliasHint")}</p>
                </div>
              ) : null}

              {feature === "password" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                    {t("advancedShorten.password")}
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.10] bg-slate-950/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/35"
                    placeholder={t("advancedShorten.passwordPlaceholder")}
                    type="password"
                  />
                  <p className="text-xs text-white/45">{t("advancedShorten.passwordHint")}</p>
                </div>
              ) : null}

              {feature === "expiry" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                    {t("advancedShorten.expiration")}
                  </label>
                  <input
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.10] bg-slate-950/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/35"
                    type="datetime-local"
                  />
                  <p className="text-xs text-white/45">{t("advancedShorten.expiryHint")}</p>
                </div>
              ) : null}

              {feature === "qr" ? (
                <p className="text-sm text-white/70">{t("advancedShorten.qrIntro")}</p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  disabled={loading}
                  onClick={submit}
                  {...tapScale}
                  className="lx-btn-primary w-full rounded-2xl py-3"
                >
                  {loading ? t("advancedShorten.creating") : t("advancedShorten.createCopy")}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  {...tapScale}
                  className="lx-btn-secondary w-full rounded-2xl py-3 dark:!bg-white/[0.08] dark:!text-white dark:!border-white/[0.12] dark:hover:!bg-white/[0.12]"
                >
                  {t("common.close")}
                </motion.button>
              </div>

              {shortUrl ? (
                <div className="rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
                    {t("advancedShorten.shortLinkLabel")}
                  </div>
                  <div className="mt-2 break-all text-sm font-semibold text-white">{shortUrl}</div>
                  {qrPngBase64 ? (
                    <div className="mt-4 flex items-center justify-center rounded-2xl bg-white p-4">
                      <img
                        src={`data:image/png;base64,${qrPngBase64}`}
                        alt={t("advancedShorten.qrAlt")}
                        className="h-44 w-44"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default HomeAdvancedShortenModal;
