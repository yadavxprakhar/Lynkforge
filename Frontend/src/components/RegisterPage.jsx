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
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

const TOAST_REGISTER = "register-flow";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);
  const { theme } = useStoreContext();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const registerHandler = async (data) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setLoader(true);
    try {
      await api.post("/api/auth/public/register", data);
      reset();
      toast.success(t("auth.registerSuccess"), { id: TOAST_REGISTER });
      navigate("/login");
    } catch (err) {
      const serverMsg = extractApiErrorMessage(err);
      const unreachable =
        !err?.response &&
        (err?.code === "ERR_NETWORK" ||
          String(err?.message || "").toLowerCase().includes("network"));
      const missingBase = !import.meta.env.VITE_BACKEND_URL;
      const msg =
        serverMsg ||
        (unreachable || missingBase ? t("auth.registerNetworkHint") : null) ||
        t("auth.registerFailed");
      toast.error(msg, { id: TOAST_REGISTER });
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
              Start your journey with{" "}
              <span className="lx-text-brand-gradient">confidence.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-lx-muted">
              Join thousands of users who trust Lynkforge for their link management
              and analytics needs. Secure, fast, and reliable.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                title: "Security first",
                desc: "Enterprise-grade encryption and secure access controls.",
              },
              {
                title: "Real-time insights",
                desc: "Watch your links perform live with our advanced tracking.",
              },
              {
                title: "Scalable infrastructure",
                desc: "Built to handle millions of clicks with zero latency.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="mt-1 rounded-lg bg-blue-500/10 p-1.5 dark:bg-blue-500/20">
                  <CheckCircle2 className="size-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-lx-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-lx-muted">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="rounded-2xl border border-lx-border bg-lx-surface/40 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[
                  { seed: "alex",   bg: "#3b82f6" },
                  { seed: "priya",  bg: "#8b5cf6" },
                  { seed: "omar",   bg: "#ec4899" },
                  { seed: "sarah",  bg: "#10b981" },
                ].map(({ seed, bg }) => (
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=${bg.replace("#", "")}&radius=50&size=32`}
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
                Join 500+ professionals today.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
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
                {t("auth.createAccount")}
              </h1>
              <p className="text-base text-lx-muted">
                {t("auth.registerSubtitle")}
              </p>
            </motion.div>
          </div>

          <motion.div {...fadeUpMountProps(0.12)} className="lx-card p-8 sm:p-10">
            <form onSubmit={handleSubmit(registerHandler)} className="space-y-6">
              <TextField
                label={t("auth.username")}
                required
                id="username"
                type="text"
                message={t("auth.usernameRequired")}
                placeholder={t("auth.chooseUsername")}
                register={register}
                errors={errors}
              />

              <TextField
                label={t("auth.email")}
                required
                id="email"
                type="email"
                message={t("auth.emailRequired")}
                placeholder={t("auth.emailPlaceholder")}
                register={register}
                errors={errors}
              />

              <TextField
                label={t("auth.password")}
                required
                id="password"
                type="password"
                message={t("auth.passwordRequired")}
                placeholder={t("auth.choosePassword")}
                register={register}
                min={6}
                errors={errors}
              />

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <p className="text-xs leading-relaxed text-lx-muted">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="font-bold text-lx-foreground underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="font-bold text-lx-foreground underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <motion.button
                disabled={loader}
                type="submit"
                className="lx-btn-primary w-full rounded-xl py-3.5 text-base font-semibold"
                {...tapScale}
              >
                {loader ? t("auth.creatingAccount") : t("auth.createAccountButton")}
              </motion.button>
            </form>
          </motion.div>

          <p className="text-center text-sm text-lx-muted">
            {t("auth.haveAccount")}{" "}
            <Link
              className="font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
              to="/login"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
