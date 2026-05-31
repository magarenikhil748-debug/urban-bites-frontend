// components/LoadingSkeleton.tsx
// ─────────────────────────────────────────────
// Full-page loading skeleton shown while the client component mounts.
// Uses CSS shimmer animation (no JS required).
// Matches the layout structure of the actual page.
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo skeleton */}
        <div className="skeleton w-20 h-20 rounded-2xl" />

        {/* Name skeleton */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="skeleton h-3 w-32 rounded-full" />
        </div>

        {/* Chips skeleton */}
        <div className="flex gap-3">
          <div className="skeleton h-7 w-24 rounded-full" />
          <div className="skeleton h-7 w-28 rounded-full" />
        </div>

        {/* Table badge skeleton */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-20 w-24 rounded-xl" />
          <div className="skeleton h-[1px] w-full" />
          <div className="skeleton h-6 w-32 rounded-lg" />
        </div>

        {/* CTA skeleton */}
        <div className="skeleton w-full h-14 rounded-2xl" />
      </div>
    </motion.div>
  );
}
