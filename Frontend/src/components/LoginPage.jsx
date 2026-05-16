import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextField from "./TextField";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useStoreContext } from "../contextApi/ContextApi";
import { fadeUpMountProps, tapScale } from "../utils/motionVariants";
import { extractApiErrorMessage } from "../utils/apiError";
import AmbientDarkBackground from "./AmbientDarkBackground";
import AmbientLightBackground from "./AmbientLightBackground";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

// Inline SVG — lucide-react installed version doesn't export Github
const GithubIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.014-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.104-.253-.447-1.27.097-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.641.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const TOAST_LOGIN = "login-flow";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);
  const { setToken, theme } = useStoreContext();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const loginHandler = async (data) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setLoader(true);
    try {
      const { data: response } = await api.post("/api/auth/public/login", data);
      setToken(response.token);
      localStorage.setItem("JWT_TOKEN", JSON.stringify(response.token));
      toast.success(t("auth.welcomeToast"), { id: TOAST_LOGIN });
      reset();
      navigate("/dashboard");
    } catch (err) {
      const serverMsg = extractApiErrorMessage(err);
      const unreachable =
        !err?.response &&
        (err?.code === "ERR_NETWORK" ||
          String(err?.message || "").toLowerCase().includes("network"));
      const missingBase = !import.meta.env.VITE_BACKEND_URL;
      toast.error(
        serverMsg ||
          (unreachable || missingBase ? t("auth.registerNetworkHint") : null) ||
          t("auth.loginFailed"),
        { id: TOAST_LOGIN },
      );
    } finally {
      setLoader(false);
      submitLock.current = false;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10">
        {isDark ? <AmbientDarkBackground /> : <AmbientLightBackground />}
      </div>

      {/* Left Column: Branding / Marketing (Visible on Desktop) */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2 xl:p-16">
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/lynkforge-logo.png"
              alt="Lynkforge"
              className="size-10 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-2xl font-bold tracking-tight text-lx-foreground">
              Lynkforge
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-extrabold leading-tight text-lx-foreground sm:text-5xl">
              Powering the next generation of{" "}
              <span className="lx-text-brand-gradient">smart links.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-lx-muted">
              Shorten URLs, track real-time analytics, and gain deep insights
              into your audience with our premium toolkit.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              "Real-time click tracking",
              "Advanced geo-analytics",
              "Custom branded domains",
              "Dynamic QR codes",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="size-5 text-blue-500" />
                <span className="text-base font-medium text-lx-foreground">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </div>


        <div className="relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="rounded-2xl border border-lx-border bg-lx-surface/40 p-5 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[
                  { seed: "alex",  bg: "3b82f6" },
                  { seed: "priya", bg: "8b5cf6" },
                  { seed: "omar",  bg: "ec4899" },
                  { seed: "sarah", bg: "10b981" },
                ].map(({ seed, bg }) => (
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=${bg}&radius=50&size=32`}
                    alt={seed}
                    width={32}
                    height={32}
                    className="size-8 rounded-full border-2 border-lx-surface object-cover"
                  />
                ))}
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-lx-surface bg-blue-600 text-[10px] font-bold text-white">
                  +1
                </div>
              </div>
              <p className="text-sm font-medium text-lx-foreground">
                Trusted by 500+ professionals.
              </p>
            </div>
          </motion.div>

          <p className="text-sm font-medium text-lx-muted">
            © 2026 Lynkforge Inc. All rights reserved.
          </p>
        </div>

      </div>

      {/* Right Column: Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:bg-lx-surface/40 lg:backdrop-blur-xl dark:lg:bg-slate-950/20">
        <div className="w-full max-w-md space-y-10">
          <div className="flex flex-col items-center space-y-4 lg:items-start">
            <Link
              to="/"
              className="group flex items-center gap-2 text-sm font-semibold text-lx-muted transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              {t("common.backToHome") || "Back to home"}
            </Link>

            <motion.div
              {...fadeUpMountProps(0.06)}
              className="space-y-2 text-center lg:text-left"
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-lx-foreground sm:text-4xl">
                {t("auth.welcomeBack")}
              </h1>
              <p className="text-base text-lx-muted">
                {t("auth.signInSubtitle")}
              </p>
            </motion.div>
          </div>

          <motion.div {...fadeUpMountProps(0.12)} className="lx-card p-8 sm:p-10">
            <form onSubmit={handleSubmit(loginHandler)} className="space-y-6">
              <TextField
                label={t("auth.username")}
                required
                id="username"
                type="text"
                message={t("auth.usernameRequired")}
                placeholder={t("auth.usernamePlaceholder")}
                register={register}
                errors={errors}
              />

              <div className="space-y-1">
                <TextField
                  label={t("auth.password")}
                  required
                  id="password"
                  type="password"
                  message={t("auth.passwordRequired")}
                  placeholder={t("auth.passwordPlaceholder")}
                  register={register}
                  min={6}
                  errors={errors}
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {t("auth.forgotPassword") || "Forgot password?"}
                  </Link>
                </div>
              </div>

              <motion.button
                disabled={loader}
                type="submit"
                className="lx-btn-primary w-full rounded-xl py-3.5 text-base font-semibold"
                {...tapScale}
              >
                {loader ? t("auth.signingIn") : t("auth.signIn")}
              </motion.button>
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lx-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-lx-surface px-2 text-lx-muted">
                  {t("auth.orContinueWith") || "Or continue with"}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4">
              <button
                type="button"
                className="lx-btn-secondary flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm"
              >
                <GithubIcon className="size-5" />
                GitHub
              </button>
            </div>
          </motion.div>

          <p className="text-center text-sm text-lx-muted">
            {t("auth.noAccount")}{" "}
            <Link
              className="font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
              to="/register"
            >
              {t("auth.signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
