import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStoreContext } from "../contextApi/ContextApi";


/** Same pattern as [portfolio Navbar](https://github.com/yadavxprakhar/portfolio-website/blob/main/components/layout/Navbar.tsx): spring layoutId pill + hover/tap scale. */
const MotionLink = motion(Link);

const mobileContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.052,
      delayChildren: 0.06,
    },
  },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

function navLinkTone(isActive) {
  return isActive
    ? "relative z-10 font-semibold text-black dark:text-white"
    : "relative z-10 font-medium text-slate-600 transition-colors duration-200 hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]";
}

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, setToken, theme, toggleTheme } = useStoreContext();
  const path = useLocation().pathname;
  const [open, setOpen] = useState(false);


  const onLogOutHandler = () => {
    setToken(null);
    localStorage.removeItem("JWT_TOKEN");
    setOpen(false);
    navigate("/login");
  };

  const mainNav = useMemo(
    () => [
      { key: "home", to: "/", labelKey: "nav.home" },
      { key: "pricing", to: "/#pricing", labelKey: "nav.pricing" },
      { key: "about", to: "/about", labelKey: "nav.about" },
      { key: "privacy", to: "/privacy", labelKey: "nav.privacy" },
      {
        key: "dashboard",
        to: token ? "/dashboard" : "/login",
        labelKey: "nav.dashboard",
      },
    ],
    [token],
  );



  return (
    <header
      className="lx-nav-dock"
    >
      <div className="relative z-[2] mx-auto flex w-full items-center justify-between">
        {/* Logo — hover / tap spring like portfolio */}
        <MotionLink
          to="/"
          whileHover={{ scale: 1.045 }}
          whileTap={{ scale: 0.96 }}
          className="group z-[1] flex min-w-0 shrink-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35 dark:focus-visible:ring-white/35"
          onClick={() => setOpen(false)}
        >
          <img
            src="/images/lynkforge-logo.png"
            alt=""
            className="size-10 shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            width={40}
            height={40}
          />
          <span className="truncate bg-gradient-to-r from-black via-slate-800 to-slate-600 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
            Lynkforge
          </span>
        </MotionLink>

        {/* Center — pills + migrating layoutId (portfolio pattern) */}
        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:flex"
          aria-label={t("aria.mainNav")}
        >
          <ul className="flex items-center gap-1 lg:gap-2">
            {mainNav.map(({ to: href, key, labelKey }) => {
              const label = t(labelKey);
              const active =
                key === "dashboard" ? path === "/dashboard" : path === href;
              return (
                <li key={key}>
                  <MotionLink
                    to={href}
                    onClick={() => setOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative block rounded-full px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35 dark:focus-visible:ring-white/35 ${navLinkTone(active)}`}
                  >
                    <span className="relative z-10">{label}</span>
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="lynkforge-nav-pill"
                          className="absolute inset-0 z-0 rounded-full bg-black/10 dark:bg-white/12"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </MotionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right */}
        <div className="z-[1] ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            onClick={toggleTheme}
            className="relative overflow-hidden rounded-lg p-2.5 text-lx-muted outline-none ring-offset-white transition-colors duration-200 hover:bg-black/[0.04] hover:text-[#0f172a] focus-visible:ring-2 focus-visible:ring-black/35 dark:hover:bg-white/[0.08] dark:hover:text-[#e2e8f0] dark:ring-offset-[#0f172a]"
            aria-label={
              theme === "dark" ? t("aria.themeToLight") : t("aria.themeToDark")
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex"
              >
                {theme === "dark" ? (
                  <Sun className="size-[1.375rem]" aria-hidden />
                ) : (
                  <Moon className="size-[1.375rem]" aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {!token ? (
            <>
              <MotionLink
                to="/login"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="lx-btn-nav-login hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35 dark:focus-visible:ring-white/35 md:inline-flex"
                onClick={() => setOpen(false)}
              >
                {t("auth.login")}
              </MotionLink>
              <MotionLink
                to="/register"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="lx-btn-primary hidden rounded-xl px-5 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35 dark:focus-visible:ring-white/35 md:inline-flex"
                onClick={() => setOpen(false)}
              >
                {t("auth.signup")}
              </MotionLink>
            </>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLogOutHandler}
              className="lx-btn-secondary hidden rounded-xl px-5 py-2.5 md:inline-flex"
            >
              {t("auth.logout")}
            </motion.button>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            className="rounded-lg p-2.5 text-lx-muted outline-none transition-colors duration-200 hover:bg-black/[0.04] hover:text-[#0f172a] focus-visible:ring-2 focus-visible:ring-black/35 dark:hover:bg-white/[0.08] md:hidden dark:hover:text-[#e2e8f0]"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("aria.closeMenu") : t("aria.openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <motion.span
              key={open ? "close" : "open"}
              initial={{ rotate: -28, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </motion.span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-[2] overflow-hidden border-t border-slate-200/50 dark:border-white/[0.08] md:hidden rounded-b-2xl"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-5">
              <motion.nav
                className="flex flex-col gap-1"
                aria-label={t("aria.mobileNav")}
                variants={mobileContainerVariants}
                initial="hidden"
                animate="show"
              >
                {mainNav.map(({ to: href, key, labelKey }) => {
                  const label = t(labelKey);
                  const mobileActive =
                    key === "dashboard" ? path === "/dashboard" : path === href;
                  return (
                    <motion.div key={key} variants={mobileItemVariants}>
                      <MotionLink
                        to={href}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-3 py-3 text-sm outline-none ring-offset-[#f8fafc] focus-visible:ring-2 focus-visible:ring-black/35 dark:ring-offset-[#0f172a] ${
                          mobileActive
                            ? "scale-[1.02] bg-black/10 font-semibold text-black dark:bg-white/12 dark:text-white"
                            : "font-medium text-lx-muted transition-colors hover:bg-black/[0.04] hover:text-[#0f172a] dark:hover:bg-white/[0.06] dark:hover:text-[#f1f5f9]"
                        }`}
                      >
                        {label}
                      </MotionLink>
                    </motion.div>
                  );
                })}
              </motion.nav>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#1F2937]">
                {!token ? (
                  <>
                    <MotionLink
                      to="/login"
                      whileTap={{ scale: 0.98 }}
                      className="lx-btn-nav-login rounded-xl px-4 py-3 text-center text-sm"
                      onClick={() => setOpen(false)}
                    >
                      {t("auth.login")}
                    </MotionLink>
                    <MotionLink
                      to="/register"
                      whileTap={{ scale: 0.98 }}
                      className="lx-btn-primary rounded-lg px-4 py-3 text-center text-sm"
                      onClick={() => setOpen(false)}
                    >
                      {t("auth.signup")}
                    </MotionLink>
                  </>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogOutHandler}
                    className="col-span-2 lx-btn-secondary rounded-lg py-3 text-sm"
                  >
                    {t("auth.logout")}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
