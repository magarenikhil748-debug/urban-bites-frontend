"use client";
import { motion, AnimatePresence } from "framer-motion";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  size = "md",
}: QuantitySelectorProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={`flex items-center gap-2 bg-zinc-800 rounded-full border border-amber-500/30 ${
        isSmall ? "px-2 py-1" : "px-3 py-1.5"
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onDecrease}
        className={`flex items-center justify-center rounded-full bg-zinc-700 hover:bg-amber-500 transition-colors text-white font-bold ${
          isSmall ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"
        }`}
      >
        −
      </motion.button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={quantity}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className={`font-bold text-amber-400 min-w-[1.5rem] text-center ${
            isSmall ? "text-xs" : "text-sm"
          }`}
        >
          {quantity}
        </motion.span>
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onIncrease}
        className={`flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 transition-colors text-black font-bold ${
          isSmall ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"
        }`}
      >
        +
      </motion.button>
    </div>
  );
}
