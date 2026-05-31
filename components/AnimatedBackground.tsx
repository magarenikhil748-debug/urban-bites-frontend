// components/AnimatedBackground.tsx
// ─────────────────────────────────────────────
// Full-viewport animated background layer.
// Renders:
//   • A dark restaurant photo as base (with heavy overlay)
//   • Three floating amber/cognac gradient orbs
//   • Subtle noise grain texture on top
//
// Usage: <AnimatedBackground imageUrl="..." />
// ─────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AnimatedBackgroundProps {
  imageUrl: string;
}

export function AnimatedBackground({ imageUrl }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ── Base photo layer ─────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          quality={60}
          className="object-cover object-center scale-105"
          // Slight scale to allow subtle CSS zoom if desired
        />
      </div>

      {/* ── Dark gradient overlay (multi-stop) ────── */}
      {/* Creates the premium "deeply dark" restaurant atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(10, 7, 5, 0.75) 0%,
              rgba(15, 10, 7, 0.82) 30%,
              rgba(12, 8, 6, 0.90) 70%,
              rgba(8, 5, 3, 0.96) 100%
            )
          `,
        }}
      />

      {/* ── Radial vignette ───────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ── Ambient orb 1 — top-right warm amber ───── */}
      <motion.div
        className="ambient-orb"
        style={{
          width: "600px",
          height: "600px",
          top: "-200px",
          right: "-150px",
          background:
            "radial-gradient(circle, rgba(212,121,26,0.22) 0%, rgba(180,80,10,0.08) 50%, transparent 70%)",
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Ambient orb 2 — bottom-left deep cognac ── */}
      <motion.div
        className="ambient-orb"
        style={{
          width: "500px",
          height: "500px",
          bottom: "-100px",
          left: "-100px",
          background:
            "radial-gradient(circle, rgba(180,60,10,0.18) 0%, rgba(120,40,5,0.06) 50%, transparent 70%)",
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.06, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* ── Ambient orb 3 — centre warm gold highlight ─ */}
      <motion.div
        className="ambient-orb"
        style={{
          width: "400px",
          height: "400px",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(245,185,68,0.08) 0%, transparent 65%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* ── Grain noise texture ───────────────────── */}
      {/* Adds tactile film-like texture to the whole background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />
    </div>
  );
}
