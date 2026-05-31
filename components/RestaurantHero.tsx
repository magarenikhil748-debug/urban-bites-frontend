// components/RestaurantHero.tsx
// ─────────────────────────────────────────────
// The main hero section.
// Displays: logo mark, restaurant name, tagline, cuisine type, rating.
// All items stagger in on mount via Framer Motion.
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";
import { Star, Clock, MapPin } from "lucide-react";
import type { RestaurantData } from "@/lib/restaurant-data";

interface RestaurantHeroProps {
  restaurant: RestaurantData;
}

// ── Animation variants ─────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Logo mark ────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-6">
        <motion.div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,121,26,0.25) 0%, rgba(180,80,10,0.15) 100%)",
            border: "1px solid rgba(212,121,26,0.4)",
            boxShadow:
              "0 0 40px rgba(212,121,26,0.25), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Decorative inner ring */}
          <div
            className="absolute inset-[3px] rounded-xl"
            style={{
              border: "1px solid rgba(212,121,26,0.2)",
            }}
          />
          {/* Logo initials */}
          <span
            className="font-display text-2xl font-semibold relative z-10"
            style={{ color: "#d4791a", textShadow: "0 0 20px rgba(212,121,26,0.6)" }}
          >
            {restaurant.logoInitials}
          </span>
        </motion.div>
      </motion.div>

      {/* ── Restaurant name ───────────────────────── */}
      <motion.h1
        variants={itemVariants}
        className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-2"
        style={{
          color: "#f5ede0",
          textShadow: "0 2px 24px rgba(0,0,0,0.6)",
        }}
      >
        {restaurant.name}
        {/* Subtle underline accent */}
        <span
          className="block h-[2px] w-16 mx-auto mt-3 rounded-full"
          style={{
            background:
              "linear-gradient(to right, transparent, #d4791a, transparent)",
          }}
        />
      </motion.h1>

      {/* ── Tagline ───────────────────────────────── */}
      <motion.p
        variants={itemVariants}
        className="font-accent text-xs uppercase mb-4"
        style={{
          color: "#d4791a",
          letterSpacing: "0.25em",
        }}
      >
        {restaurant.tagline}
      </motion.p>

      {/* ── Cuisine type ──────────────────────────── */}
      <motion.p
        variants={itemVariants}
        className="text-sm mb-5"
        style={{ color: "rgba(245,224,198,0.55)" }}
      >
        {restaurant.cuisine}
      </motion.p>

      {/* ── Rating + hours row ────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 flex-wrap justify-center"
      >
        {/* Rating */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(245,185,68,0.1)",
            border: "1px solid rgba(245,185,68,0.25)",
          }}
        >
          <Star className="star-fill" size={13} fill="currentColor" />
          <span className="text-xs font-medium" style={{ color: "#f5b944" }}>
            {restaurant.rating}
          </span>
          <span className="text-xs" style={{ color: "rgba(245,224,198,0.4)" }}>
            ({restaurant.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Hours */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Clock size={13} style={{ color: "rgba(245,224,198,0.5)" }} />
          <span className="text-xs" style={{ color: "rgba(245,224,198,0.55)" }}>
            {restaurant.openTime} – {restaurant.closeTime}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
