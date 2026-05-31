// app/page.tsx
// Root route — demo redirect so "/" doesn't 404 during development.
// In production, the root would be the restaurant's marketing site.
import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to demo table 5 (same as QR code example)
  redirect("/table/5");
}
