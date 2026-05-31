// lib/restaurant-data.ts
// ─────────────────────────────────────────────
// Mock data for Urban Bites Cafe QR landing page.
// In production, this would be fetched from the backend
// using the restaurantId (from subdomain or URL param).
// ─────────────────────────────────────────────

export interface RestaurantData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  openTime: string;
  closeTime: string;
  logoInitials: string;
  accentColor: string;
  highlights: string[];
  backgroundImageUrl: string;
}

export interface TableData {
  id: string;
  displayNumber: string;
  section: string;
  capacity: number;
  isAvailable: boolean;
}

// ── Restaurant ────────────────────────────────
export const RESTAURANT: RestaurantData = {
  id: "urban-bites-cafe",
  name: "Urban Bites",
  tagline: "Premium Dining Experience",
  description:
    "Artisanal cuisine crafted with locally sourced ingredients in an intimate, modern setting.",
  cuisine: "Contemporary · Farm to Table",
  rating: 4.8,
  reviewCount: 2340,
  openTime: "11:00 AM",
  closeTime: "11:00 PM",
  logoInitials: "UB",
  accentColor: "#d4791a",
  highlights: ["Award-winning chef", "Seasonal menu", "Craft cocktails"],
  // Unsplash: warm restaurant interior
  backgroundImageUrl:
    "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1400&q=80&auto=format&fit=crop",
};

// ── Table resolver ────────────────────────────
// Returns a table object for a given tableId param.
// Falls back gracefully for unknown IDs.
export function resolveTable(tableId: string): TableData {
  const num = parseInt(tableId, 10);
  const sections = ["Main Hall", "Garden Terrace", "Bar Lounge", "Private Dining"];
  const capacities = [2, 4, 4, 6, 2, 8, 4, 4, 2, 6];

  return {
    id: tableId,
    displayNumber: isNaN(num) ? tableId.toUpperCase() : String(num),
    section: sections[num % sections.length] ?? "Main Hall",
    capacity: capacities[num % capacities.length] ?? 4,
    isAvailable: true,
  };
}

// ── Menu categories (teaser only — not the full menu) ──
export const MENU_TEASER = [
  { icon: "🥗", label: "Starters" },
  { icon: "🍝", label: "Mains" },
  { icon: "🍷", label: "Drinks" },
  { icon: "🍮", label: "Desserts" },
];
