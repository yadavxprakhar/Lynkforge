import { motion } from "framer-motion";
import { cardHoverSpring, staggerChild } from "../utils/motionVariants";

const defaultIconShell =
  "flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-900 dark:border-white/[0.12] dark:bg-[rgb(12_17_34)] dark:text-[#e2e8f0]";

/** Feature tile — optional icon + tinted well (stroke inherits `text-*` / `stroke-current`) */
const Card = ({ title, desc, Icon, iconShell }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      variants={staggerChild}
      onMouseMove={handleMouseMove}
      whileHover={{
        y: -4,
        transition: cardHoverSpring,
      }}
      className="lx-glow-card group relative flex cursor-default flex-col gap-4 px-6 py-8"
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
