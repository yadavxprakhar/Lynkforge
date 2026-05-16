import { motion } from "framer-motion";
import { easeSmooth } from "../utils/motionVariants";

/** Subtle SPA route transitions — avoids fighting heavy section motions. */
export default function PageFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: easeSmooth }}
    >
      {children}
    </motion.div>
  );
}
