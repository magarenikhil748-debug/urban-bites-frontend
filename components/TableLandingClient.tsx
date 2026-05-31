// components/TableLandingClient.tsx
// ─────────────────────────────────────────────
// Root client component for the QR landing page.
// Receives pre-resolved data from the Server Component (page.tsx)
// and orchestrates the full animated layout.
//
// Layout (top → bottom on mobile):
//   1. AnimatedBackground  (fixed, z=0)
//   2. Top bar: wifi / time
//   3. RestaurantHero  (logo, name, tagline, rating)
//   4. TableBadge (big table number card)
//   5. MenuTeaser (category pill row)
//   6. HighlightBadges
//   7. CTAButton "View Menu"
//   8. Footer: powered-by line
// ─────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "./AnimatedBackground";
import { RestaurantHero } from "./RestaurantHero";
import { TableBadge } from "./TableBadge";
import { CTAButton } from "./CTAButton";
import { MenuTeaser } from "./MenuTeaser";
import { HighlightBadges } from "./HighlightBadges";
import { LoadingSkeleton } from "./LoadingSkeleton";
import type { RestaurantData, TableData } from "@/lib/restaurant-data";

interface TableLandingClientProps {
  restaurant: RestaurantData;
  table: TableData;
}

export function TableLandingClient({ restaurant, table }: TableLandingClientProps) {
  // ── Loading state — show skeleton on first paint ──
  // This prevents a flash of unstyled content while fonts / images load.
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Minimum skeleton duration so it never flashes in < 300ms
    const timer = setTimeout(() => setIsLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    // Outermost wrapper — fills viewport, dark base colour
    <div
      className="relative min-h-screen w-full overflow-hidden grain"
      style={{ backgroundColor: "#0f0b09" }}
    >
      {/* ── Background layer (fixed position) ──────── */}
      <AnimatedBackground imageUrl={restaurant.backgroundImageUrl} />

      {/* ── Content layer (scrollable) ──────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            // ── Skeleton placeholder ─────────────────
            <LoadingSkeleton key="skeleton" />
          ) : (
            // ── Real content ─────────────────────────
            <motion.main
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-between px-5 pt-10 pb-8"
              style={{ maxWidth: "420px", margin: "0 auto", width: "100%" }}
            >
              {/* ── Top status bar ─────────────────── */}
              <TopStatusBar restaurantName={restaurant.name} />

              {/* ── Main content stack ─────────────── */}
              <div className="flex-1 flex flex-col items-center justify-center w-full gap-7 py-6">

                {/* Restaurant hero: logo + name + tagline + rating */}
                <RestaurantHero restaurant={restaurant} />

                {/* Thin divider */}
                <motion.div
                  className="divider-gradient w-full"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />

                {/* Table number card */}
                <TableBadge table={table} />

                {/* Menu category teaser */}
                <MenuTeaser />

                {/* Feature highlight chips */}
                <HighlightBadges highlights={restaurant.highlights} />

              </div>

              {/* ── CTA section ────────────────────── */}
              <div className="w-full flex flex-col gap-4 mt-2">
                <CTAButton
                  tableId={table.displayNumber}
                  restaurantName={restaurant.name}
                />
                <Footer />
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components (small enough to live here) ──

/** Top status bar: scan context + QR label */
function TopStatusBar({ restaurantName }: { restaurantName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex items-center justify-between"
    >
      {/* Left: wifi-like signal indicating scan success */}
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-[3px] h-4">
          {[2, 4, 6, 8].map((h, i) => (
            <motion.div
              key={h}
              className="w-1 rounded-sm"
              style={{
                height: `${h}px`,
                background: i < 3 ? "rgba(212,121,26,0.9)" : "rgba(255,255,255,0.2)",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
            />
          ))}
        </div>
        <span
          className="font-accent text-[10px]"
          style={{ color: "rgba(212,121,26,0.7)", letterSpacing: "0.12em" }}
        >
          QR Scan Active
        </span>
      </div>

      {/* Right: scan check */}
      <motion.div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(52,211,153,0.1)",
          border: "1px solid rgba(52,211,153,0.25)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-[10px]" style={{ color: "rgba(52,211,153,0.85)" }}>
          Table verified
        </span>
      </motion.div>
    </motion.div>
  );
}

/** Minimal footer */
function Footer() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3 }}
      className="text-center text-[10px]"
      style={{ color: "rgba(245,224,198,0.2)" }}
    >
      Powered by{" "}
      <span style={{ color: "rgba(212,121,26,0.5)" }}>Urban Bites POS</span>
      {" "}· Secure · No account required
    </motion.p>
  );
}
