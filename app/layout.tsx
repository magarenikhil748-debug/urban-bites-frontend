// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// ── Fonts ─────────────────────────────────────
// Playfair Display: classic editorial serif for headlines
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// DM Sans: humanist sans for body text
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500"],
});

// DM Mono: for table badge / accent labels
const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
  weight: ["300", "400", "500"],
});

// ── Metadata ──────────────────────────────────
export const metadata: Metadata = {
  title: "Urban Bites Cafe — Table Ordering",
  description:
    "Welcome to Urban Bites Cafe. Scan your table QR code to browse the menu and place your order.",
  openGraph: {
    title: "Urban Bites Cafe",
    description: "Premium dining experience — scan & order at your table",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevent zoom on mobile inputs
  themeColor: "#1a1210",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
