import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStoreContext } from "../../contextApi/ContextApi";
import { useForm } from "react-hook-form";
import TextField from "../TextField";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/api";
import toast from "react-hot-toast";
import { fadeUpMountProps, tapScale } from "../../utils/motionVariants";

const CreateNewShorten = ({ setOpen, refetch: _refetch }) => {
  const { t } = useTranslation();
  const { token } = useStoreContext();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      originalUrl: "",
    },
    mode: "onTouched",
  });

  const createShortUrlHandler = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await api.post("/api/urls/shorten", data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const shortenUrl = `${import.meta.env.VITE_REACT_FRONT_END_URL + "/s/" + `${res.shortUrl}`}`;
      await navigator.clipboard.writeText(shortenUrl);
      toast.success(t("createShortLink.toastCopied"));

      reset();
      setOpen(false);
    } catch {
      toast.error(t("createShortLink.toastFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...fadeUpMountProps(0.04)}
      className="lx-card w-full max-w-[440px] shadow-lifted"
    >
      <form
        onSubmit={handleSubmit(createShortUrlHandler)}
        className="relative p-6 sm:p-8"
      >
        <motion.button
          type="button"
          disabled={loading}
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 text-lx-muted transition-colors hover:bg-black/[0.04] hover:text-lx-foreground dark:hover:bg-white/[0.06]"
          aria-label={t("common.close")}
          {...tapScale}
        >
          <X className="size-5" />
        </motion.button>

        <h2
          id="create-short-url-title"
          className="pr-10 text-center text-xl font-bold tracking-tight text-lx-foreground sm:text-[1.35rem]"
        >
          {t("createShortLink.title")}
        </h2>
        <p className="mt-2 text-center text-[0.9375rem] text-lx-muted">
          {t("createShortLink.subtitle")}
        </p>

        <div className="mt-8">
          <TextField
            label={t("createShortLink.destinationUrl")}
            required
            id="originalUrl"
            placeholder={t("createShortLink.urlPlaceholder")}
            type="url"
            message={t("createShortLink.urlRequired")}
            register={register}
            errors={errors}
          />
        </div>

        <motion.button
          disabled={loading}
          className="lx-btn-primary mt-8 w-full py-3"
          type="submit"
          {...tapScale}
        >
          {loading ? t("createShortLink.creating") : t("createShortLink.createCopy")}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreateNewShorten;
