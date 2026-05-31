// components/TableBadge.tsx
// ─────────────────────────────────────────────
// The prominent "Table X" card that appears below the hero.
// Glassmorphism card with amber glow border.
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";
import { Users, Armchair } from "lucide-react";
import type { TableData } from "@/lib/restaurant-data";

interface TableBadgeProps {
  table: TableData;
}

export function TableBadge({ table }: TableBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* ── Outer glow ring ───────────────────────── */}
      <motion.div
        className="absolute -inset-[1px] rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(212,121,26,0.6) 0%, rgba(180,80,10,0.2) 50%, rgba(212,121,26,0.4) 100%)",
        }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Card surface ──────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6"
        style={{
          background:
            "linear-gradient(145deg, rgba(30,20,14,0.9) 0%, rgba(20,13,9,0.95) 100%)",
          backdropFilter: "blur(32px) saturate(1.5)",
          WebkitBackdropFilter: "blur(32px) saturate(1.5)",
          border: "1px solid rgba(212,121,26,0.3)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Top row: label + status dot ──────────── */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="font-accent text-[10px] uppercase"
            style={{ color: "rgba(212,121,26,0.7)", letterSpacing: "0.2em" }}
          >
            Your Table
          </span>
          {/* Available indicator */}
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px]" style={{ color: "rgba(52,211,153,0.8)" }}>
              Ready to order
            </span>
          </div>
        </div>

        {/* ── Table number ──────────────────────────── */}
        <div className="flex items-end gap-3 mb-5">
          <motion.span
            className="font-display leading-none"
            style={{
              fontSize: "clamp(4rem, 20vw, 6rem)",
              fontWeight: 700,
              color: "#d4791a",
              textShadow:
                "0 0 60px rgba(212,121,26,0.5), 0 2px 16px rgba(0,0,0,0.6)",
              lineHeight: 1,
            }}
            animate={{ textShadow: [
              "0 0 40px rgba(212,121,26,0.4), 0 2px 16px rgba(0,0,0,0.6)",
              "0 0 70px rgba(212,121,26,0.65), 0 2px 16px rgba(0,0,0,0.6)",
              "0 0 40px rgba(212,121,26,0.4), 0 2px 16px rgba(0,0,0,0.6)",
            ]}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {table.displayNumber}
          </motion.span>
          <div className="pb-2">
            <p
              className="text-lg font-medium leading-tight"
              style={{ color: "rgba(245,224,198,0.9)" }}
            >
              Table
            </p>
            <p className="text-xs" style={{ color: "rgba(245,224,198,0.4)" }}>
              {table.section}
            </p>
          </div>
        </div>

        {/* ── Divider ───────────────────────────────── */}
        <div className="divider-gradient mb-4" />

        {/* ── Info row: capacity ─────────────────────── */}
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: "rgba(212,121,26,0.12)",
              border: "1px solid rgba(212,121,26,0.2)",
            }}
          >
            <Users size={14} style={{ color: "#d4791a" }} />
          </div>
          <span className="text-xs" style={{ color: "rgba(245,224,198,0.5)" }}>
            Seats up to{" "}
            <span style={{ color: "rgba(245,224,198,0.8)" }}>{table.capacity} guests</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
