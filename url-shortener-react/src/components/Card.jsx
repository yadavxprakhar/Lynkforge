import { motion } from "framer-motion";
import { cardHoverSpring, staggerChild } from "../utils/motionVariants";

const defaultIconShell =
  "flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-900 dark:border-white/[0.12] dark:bg-[rgb(12_17_34)] dark:text-[#e2e8f0]";

/** Feature tile — optional icon + tinted well (stroke inherits `text-*` / `stroke-current`) */
const Card = ({ title, desc, Icon, iconShell }) => {
  return (
    <motion.div
      variants={staggerChild}
      whileHover={{
        y: -4,
        transition: cardHoverSpring,
      }}
      className="group relative flex cursor-default flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-soft transition-colors duration-300 dark:border-white/[0.1] dark:bg-[rgb(21_31_53)] dark:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] dark:hover:border-blue-500/35 dark:after:absolute dark:after:inset-0 dark:after:-z-[1] dark:after:rounded-2xl dark:after:opacity-0 dark:after:blur-2xl dark:after:transition-opacity dark:after:duration-300 dark:after:bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgb(99_102_241_/_0.18)_0%,transparent_62%)] dark:hover:after:opacity-100"
    >
      {Icon ? (
        <div className={(iconShell ?? defaultIconShell).trim()} role="presentation">
          <Icon
            className="size-[1.35rem] shrink-0 stroke-current"
            aria-hidden
            strokeWidth={1.85}
          />
        </div>
      ) : null}
      <h2 className="text-[1.05rem] font-bold tracking-tight text-slate-900 dark:text-[#f8fafc]">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
    </motion.div>
  );
};

export default Card;
