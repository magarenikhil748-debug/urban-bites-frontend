import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cafe Marketplace — Cafe profile and menu',
  description: 'Explore cafe details, current menu items, and table QR ordering.',
}

export default function CafePublicLayout({ children }: { children: React.ReactNode }) {
  return children
}
