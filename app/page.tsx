import type { Metadata } from 'next'
import { TaveroLandingPage } from '@/components/landing/TaveroLandingPage'

export const metadata: Metadata = {
  title: 'Tavero — Discover. Scan. Order.',
  description:
    'Tavero helps customers discover modern cafes and lets cafe owners manage QR ordering, live orders, and marketplace visibility.',
  openGraph: {
    title: 'Tavero — Discover. Scan. Order.',
    description: 'Discover cafes by vibe, explore menus, scan QR, and order from your table.',
    type: 'website',
    siteName: 'Tavero',
  },
}

export default function RootPage() {
  return <TaveroLandingPage />
}
