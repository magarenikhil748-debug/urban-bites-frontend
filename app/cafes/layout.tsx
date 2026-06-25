import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tavero Marketplace — Discover. Scan. Order.',
  description:
    'Discover approved cafes, explore real menus, and move seamlessly into table QR ordering.',
}

export default function CafesLayout({ children }: { children: React.ReactNode }) {
  return children
}
