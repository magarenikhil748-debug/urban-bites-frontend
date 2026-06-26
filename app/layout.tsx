import type { Metadata, Viewport } from 'next'
import { DM_Mono, DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'Tavero — Discover. Scan. Order.',
    template: '%s | Tavero',
  },
  description:
    'Discover cafes by vibe, explore menus, scan QR, and order from your table with Tavero.',
  openGraph: {
    title: 'Tavero — Discover. Scan. Order.',
    description: 'Discover cafes by vibe, explore menus, scan QR, and order from your table.',
    type: 'website',
    siteName: 'Tavero',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#160B07',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
