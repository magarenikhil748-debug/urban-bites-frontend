// components/HighlightBadges.tsx
// ─────────────────────────────────────────────
// Row of small highlight chips (award-winning chef, seasonal menu, etc.)
// Stagger animates in from the right.
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";
import { Award, Leaf, Wine } from "lucide-react";
import type { RestaurantData } from "@/lib/restaurant-data";

const ICONS = [Award, Leaf, Wine];

interface HighlightBadgesProps {
  highlights: RestaurantData["highlights"];
}

export function HighlightBadges({ highlights }: HighlightBadgesProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.62 }}
      className="flex flex-wrap justify-center gap-2"
    >
      {highlights.map((text, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(212,121,26,0.1)",
              border: "1px solid rgba(212,121,26,0.2)",
            }}
          >
            <Icon size={11} style={{ color: "rgba(212,121,26,0.8)" }} />
            <span className="text-[11px]" style={{ color: "rgba(245,200,150,0.75)" }}>
              {text}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
