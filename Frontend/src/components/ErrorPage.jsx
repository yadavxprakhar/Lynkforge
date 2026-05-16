import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUpMountProps, tapScale } from "../utils/motionVariants";

const ErrorPage = ({ message, variant = "generic" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const title =
    variant === "notFound" ? t("error.notFoundTitle") : t("error.title");
  const body =
    message ??
    (variant === "notFound" ? t("error.notFoundPage") : t("error.unexpected"));

  return (
    <div className="lx-error-shell">
      <motion.div
        {...fadeUpMountProps(0.06)}
        className="lx-card flex flex-col items-center gap-8 px-10 py-14 sm:max-w-lg sm:p-16"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/11 text-red-600 shadow-md shadow-red-900/[0.06] ring-1 ring-red-900/[0.04] dark:text-red-400 dark:shadow-none dark:ring-0">
          <AlertTriangle className="size-9" aria-hidden />
        </div>
        <div className="space-y-3">
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-lx-foreground sm:text-[2rem]">
            {title}
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-lx-muted">{body}</p>
        </div>
        <motion.button
          type="button"
          onClick={() => navigate("/")}
          className="lx-btn-primary px-10"
          {...tapScale}
        >
          {t("error.backHome")}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
