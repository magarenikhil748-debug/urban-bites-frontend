// components/CTAButton.tsx
// ─────────────────────────────────────────────
// Primary call-to-action button.
// Features:
//   • Amber gradient fill with animated glow
//   • Framer Motion tap + hover animations
//   • Loading state (spinner) 
//   • Arrow icon that slides right on hover
// ─────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, UtensilsCrossed } from "lucide-react";

interface CTAButtonProps {
  tableId: string;
  restaurantName: string;
}

export function CTAButton({ tableId, restaurantName }: CTAButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

 const handleOpenMenu = () => {
  setLoading(true);

  setTimeout(() => {
    router.push(`/table/${tableId}/menu`);
  }, 1200);
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* ── Primary CTA ───────────────────────────── */}
      <motion.button
      onClick={handleOpenMenu}
        disabled={loading}
        className="relative w-full py-4 px-6 rounded-2xl overflow-hidden group"
        style={{
          background:
            "linear-gradient(135deg, #d4791a 0%, #b85e12 50%, #d4791a 100%)",
          backgroundSize: "200% 100%",
          boxShadow:
            "0 0 0 1px rgba(212,121,26,0.5), 0 8px 32px rgba(212,121,26,0.35), 0 2px 8px rgba(0,0,0,0.4)",
          cursor: loading ? "not-allowed" : "pointer",
        }}
        whileHover={!loading ? {
          backgroundPosition: "100% 0",
          boxShadow:
            "0 0 0 1px rgba(212,121,26,0.8), 0 12px 48px rgba(212,121,26,0.55), 0 4px 16px rgba(0,0,0,0.5)",
          y: -2,
        } : {}}
        whileTap={!loading ? { scale: 0.97, y: 0 } : {}}
        transition={{ duration: 0.25, ease: "easeOut" }}
        aria-label={`View menu for table ${tableId}`}
      >
        {/* Shimmer sweep on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
        />

        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="animate-spin" size={20} color="white" />
                <span
                  className="text-white font-medium text-base"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                >
                  Opening Menu…
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <UtensilsCrossed size={20} color="white" />
                <span
                  className="text-white font-semibold text-base tracking-wide"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                >
                  View Menu
                </span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={18} color="rgba(255,255,255,0.85)" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* ── Secondary hint ────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center text-xs mt-3"
        style={{ color: "rgba(245,224,198,0.3)" }}
      >
        No app download required • Order at your pace
      </motion.p>
    </motion.div>
  );
}
