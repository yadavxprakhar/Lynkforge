import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextField from "./TextField";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { fadeUpMountProps, tapScale } from "../utils/motionVariants";
import { extractApiErrorMessage } from "../utils/apiError";

const TOAST_REGISTER = "register-flow";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);

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
    <div className="lx-auth-shell">
      <motion.form
        {...fadeUpMountProps(0.06)}
        onSubmit={handleSubmit(registerHandler)}
        className="lx-card w-full max-w-[460px] rounded-2xl p-10 sm:p-11"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-[1.85rem] font-extrabold tracking-tight text-[#0f172a] sm:text-[2.1rem] dark:text-[#f8fafc]">
            {t("auth.createAccount")}
          </h1>
          <p className="text-[0.9375rem] text-slate-600 dark:text-[#94a3b8]">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        <div className="mt-11 flex flex-col gap-7">
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
        </div>

        <motion.button
          disabled={loader}
          type="submit"
          className="lx-btn-primary mt-11 w-full rounded-xl py-3.5 text-[0.9375rem] font-semibold"
          {...tapScale}
        >
          {loader ? t("auth.creatingAccount") : t("auth.createAccountButton")}
        </motion.button>

        <p className="mt-11 text-center text-[0.9375rem] text-slate-600 dark:text-[#94a3b8]">
          {t("auth.haveAccount")}{" "}
          <Link
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-[#60a5fa] dark:hover:text-blue-400"
            to="/login"
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
