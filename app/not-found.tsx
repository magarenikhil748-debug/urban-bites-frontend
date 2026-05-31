// app/not-found.tsx
"use client";
import { motion } from "framer-motion";
import { QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0f0b09" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5 max-w-xs"
      >
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "rgba(212,121,26,0.1)",
            border: "1px solid rgba(212,121,26,0.2)",
          }}
        >
          <QrCode size={40} style={{ color: "rgba(212,121,26,0.7)" }} />
        </div>
        <h1
          className="font-display text-3xl font-semibold"
          style={{ color: "#f5ede0" }}
        >
          Table Not Found
        </h1>
        <p className="text-sm" style={{ color: "rgba(245,224,198,0.45)" }}>
          This QR code may be invalid or expired. Please ask your server for a
          new QR code.
        </p>
        <Link
          href="/table/5"
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{
            background: "rgba(212,121,26,0.15)",
            border: "1px solid rgba(212,121,26,0.3)",
            color: "#d4791a",
          }}
        >
          <ArrowLeft size={14} />
          Back to Demo (Table 5)
        </Link>
      </motion.div>
    </div>
  );
}
