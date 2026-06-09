import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { easeSmooth } from "../utils/motionVariants";
import { LightChromeAmbient, LightChromeFrost } from "./LightChromeStack";
import { useStoreContext } from "../contextApi/ContextApi";
import LanguageSwitcher from "./LanguageSwitcher";

function GitHubIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.649.5.5 5.65.5 12.051c0 5.086 3.292 9.389 7.862 10.913.574.107.783-.246.783-.547 0-.271-.013-1.179-.018-2.137-3.243.694-3.927-1.377-3.927-1.377-.53-1.344-1.296-1.702-1.296-1.702-1.061-.722.08-.708.08-.708 1.173.082 1.789 1.2 1.789 1.2 1.042 1.783 2.734 1.267 3.399.969.105-.754.407-1.267.74-1.558-2.589-.292-5.311-1.291-5.311-5.751 0-1.271.46-2.31 1.214-3.125-.122-.293-.526-1.472.115-3.065 0 0 .99-.312 3.243 1.194a11.28 11.28 0 0 1 2.952-.396c1.002.005 2.012.135 2.952.396 2.25-1.506 3.238-1.194 3.238-1.194.644 1.593.24 2.772.118 3.065.757.815 1.212 1.854 1.212 3.125 0 4.471-2.727 5.455-5.325 5.74.418.359.792 1.065.792 2.152 0 1.555-.014 2.807-.014 3.189 0 .31.208.658.787.546A10.54 10.54 0 0 0 23.5 12.05C23.5 5.65 18.351.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.602 0 4.266 2.371 4.266 5.456v6.285ZM5.337 7.433a2.067 2.067 0 1 1 0-4.134 2.067 2.067 0 0 1 0 4.134ZM7.119 20.452H3.554V9h3.565v11.452Z" />
    </svg>
  );
}

const mutedLink =
  "text-[0.8125rem] font-medium text-slate-600 transition-colors hover:text-[#2563eb] dark:text-[#94a3b8] dark:hover:text-[#cbd5f5]";

const sectionHeading =
  "text-xs font-bold uppercase tracking-[0.12em] text-[#0f172a] dark:text-[#f8fafc]";

const iconBtnClasses =
  "flex size-10 items-center justify-center rounded-lg border border-transparent text-[#475569] transition-all duration-200 hover:border-white/12 hover:bg-white/[0.06] hover:text-[#2563eb] dark:text-[#94a3b8] dark:hover:text-[#cbd5f5]";

const Footer = () => {
  const { t } = useTranslation();
  const { token } = useStoreContext();

  const productLinks = useMemo(
    () => [
      { to: "/", labelKey: "nav.home" },
      { to: "/about", labelKey: "nav.about" },
      { to: "/#pricing", labelKey: "nav.pricing" },
      { to: "/privacy", labelKey: "nav.privacy" },
      {
        to: token ? "/dashboard" : "/login",
        labelKey: "nav.dashboard",
      },
    ],
    [token],
  );

  const legalLinks = useMemo(
    () => [
      { to: "/terms", labelKey: "footer.termsOfService" },
      { to: "/privacy", labelKey: "footer.privacyPolicy" },
      { to: "/cookie", labelKey: "footer.cookiePolicy" },
      { to: "/accessibility", labelKey: "footer.accessibility" },
      { to: "/privacy-manager", labelKey: "footer.privacyManager" },
    ],
    [],
  );

  const accountLinks = useMemo(
    () =>
      token
        ? [{ to: "/dashboard", labelKey: "nav.dashboard" }]
        : [
            { to: "/login", labelKey: "auth.login" },
            { to: "/register", labelKey: "auth.signup" },
          ],
    [token],
  );

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px 0px" }}
      transition={{ duration: 0.45, ease: easeSmooth }}
      className="relative z-[1] mt-auto overflow-hidden border-t border-[#e2e8f0] bg-transparent shadow-[inset_0_1px_0_rgb(255_255_255/_0.82),0_-20px_50px_-40px_rgb(37_99_235/_0.08)] motion-safe:transition-[border-color,box-shadow,color] motion-safe:duration-[480ms] dark:border-white/[0.08] dark:bg-[#090e18] dark:shadow-none"
    >
      <LightChromeAmbient />
      <LightChromeFrost className="bg-gradient-to-b from-white/[0.72] via-[#f8fafc]/82 to-[#eef2f9]/92 backdrop-blur-md dark:hidden" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-b from-[#070b14]/80 to-[#070b14] dark:block"
      />

      <div className="relative z-[2] lx-footer-inner">
        <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-3 justify-self-center lg:justify-self-start"
            >
              <img
                src="/images/lynkforge-logo.png"
                alt=""
                className="size-11 object-contain brightness-105"
                width={44}
                height={44}
              />
              <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-[#60a5fa] dark:to-[#a78bfa]">
                Lynkforge
              </span>
            </Link>
            <p className="mx-auto max-w-[16rem] text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] md:mx-0 lg:max-w-none">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="text-center lg:text-left">
            <p className={sectionHeading}>{t("footer.product")}</p>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Product links">
              {productLinks.map(({ to, labelKey }) => (
                <Link key={to} to={to} className={mutedLink}>
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center lg:text-left">
            <p className={sectionHeading}>{t("footer.account")}</p>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Account links">
              {accountLinks.map(({ to, labelKey }) => (
                <Link key={to} to={to} className={mutedLink}>
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center lg:text-left">
            <p className={sectionHeading}>{t("footer.legal")}</p>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Legal links">
              {legalLinks.map(({ to, labelKey }) => (
                <Link key={to} to={to} className={mutedLink}>
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center lg:text-left lg:justify-self-end">
            <p className={sectionHeading}>{t("footer.connect")}</p>
            <div className="mt-5 flex justify-center gap-5 lg:justify-start">
              <a
                href="https://www.linkedin.com/in/prakharyxdev/"
                target="_blank"
                rel="noopener noreferrer"
                className={iconBtnClasses}
                aria-label={t("footer.linkedin")}
              >
                <LinkedInIcon className="size-5 text-current" />
              </a>
              <a
                href="https://github.com/yadavxprakhar/Lynkforge---A-URL-Shortner-App"
                target="_blank"
                rel="noopener noreferrer"
                className={iconBtnClasses}
                aria-label={t("footer.github")}
              >
                <GitHubIcon className="size-5 text-current" />
              </a>
              <a
                href="mailto:yadavxprakhar@gmail.com"
                className={iconBtnClasses}
                aria-label={t("footer.email")}
              >
                <Mail className="size-5" aria-hidden strokeWidth={1.75} />
              </a>
            </div>

            <div className="mt-8 space-y-3 text-center lg:text-left">
              <p className={sectionHeading}>{t("footer.language")}</p>
              <div className="flex justify-center lg:justify-start">
                <LanguageSwitcher menuPlacement="top" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-[#cbd5e1]/90 pt-8 text-center dark:border-white/[0.08]">
          <p className="text-sm text-slate-500 dark:text-[#64748b]">
            {t("footer.copyright", { year: 2026 })}
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
