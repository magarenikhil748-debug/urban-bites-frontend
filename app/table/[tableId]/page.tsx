// app/table/[tableId]/page.tsx
// ─────────────────────────────────────────────
// QR Code landing page — dynamically rendered for each table.
//
// Route: /table/[tableId]
// Example: /table/5 → Table 5 of Urban Bites Cafe
//
// Flow:
//  1. Next.js extracts tableId from URL params (no JS needed for routing)
//  2. resolveTable() creates the table object from mock data
//  3. TableLandingClient renders the animated UI with Framer Motion
// ─────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESTAURANT, resolveTable } from "@/lib/restaurant-data";
import { TableLandingClient } from "@/components/TableLandingClient";

// ── Static params for ISR (optional, good for known tables) ──
// In production with a real backend, you'd fetch all table IDs here.
export async function generateStaticParams() {
  // Pre-generate pages for tables 1–20
  return Array.from({ length: 20 }, (_, i) => ({ tableId: String(i + 1) }));
}

// ── Dynamic metadata per table ────────────────
export async function generateMetadata({
  params,
}: {
  params: { tableId: string };
}): Promise<Metadata> {
  const table = resolveTable(params.tableId);
  return {
    title: `Table ${table.displayNumber} — ${RESTAURANT.name}`,
    description: `Welcome to ${RESTAURANT.name}! You're seated at Table ${table.displayNumber}. Tap to browse our menu.`,
    robots: { index: false, follow: false }, // Don't index table-specific pages
  };
}

// ── Page component (Server Component) ────────
export default function TablePage({
  params,
}: {
  params: { tableId: string };
}) {
  // Validate: tableId must be a non-empty string
  if (!params.tableId || params.tableId.length > 20) {
    notFound();
  }

  // Resolve table data from mock (in production: fetch from API)
  const table = resolveTable(params.tableId);

  return (
    // Pass pre-resolved data to the client component that runs animations
    <TableLandingClient restaurant={RESTAURANT} table={table} />
  );
}
