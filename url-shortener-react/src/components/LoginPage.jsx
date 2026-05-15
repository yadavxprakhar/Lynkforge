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

const TOAST_LOGIN = "login-flow";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);
  const { setToken } = useStoreContext();

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
    <div className="lx-auth-shell">
      <motion.form
        {...fadeUpMountProps(0.06)}
        onSubmit={handleSubmit(loginHandler)}
        className="lx-card w-full max-w-[460px] rounded-2xl p-10 sm:p-11"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-[1.85rem] font-extrabold tracking-tight text-[#0f172a] sm:text-[2.1rem] dark:text-[#f8fafc]">
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-[0.9375rem] text-slate-600 dark:text-[#94a3b8]">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        <div className="mt-11 flex flex-col gap-7">
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
        </div>

        <motion.button
          disabled={loader}
          type="submit"
          className="lx-btn-primary mt-11 w-full rounded-xl py-3.5 text-[0.9375rem] font-semibold"
          {...tapScale}
        >
          {loader ? t("auth.signingIn") : t("auth.signIn")}
        </motion.button>

        <p className="mt-11 text-center text-[0.9375rem] text-slate-600 dark:text-[#94a3b8]">
          {t("auth.noAccount")}{" "}
          <Link
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-[#60a5fa] dark:hover:text-blue-400"
            to="/register"
          >
            {t("auth.signup")}
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
