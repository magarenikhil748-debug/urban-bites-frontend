// components/MenuTeaser.tsx
// ─────────────────────────────────────────────
// Subtle horizontal scroll of menu category pills.
// Acts as visual preview / curiosity driver before the CTA.
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";
import { MENU_TEASER } from "@/lib/restaurant-data";

export function MenuTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <p
        className="font-accent text-[10px] uppercase text-center mb-3"
        style={{ color: "rgba(245,224,198,0.35)", letterSpacing: "0.18em" }}
      >
        On the menu today
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {MENU_TEASER.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(245,224,198,0.65)" }}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
