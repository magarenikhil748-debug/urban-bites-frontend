'use client'

import {
  ExternalLink,
  House,
  LogOut,
  MenuSquare,
  QrCode,
  ReceiptText,
  Store,
  Table2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { TaveroBrand } from '@/components/brand/TaveroBrand'
import { useDashboard } from './DashboardProvider'

const navigation = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/dashboard/orders', label: 'Orders', icon: ReceiptText },
  { href: '/dashboard/cafe', label: 'Cafe Profile', icon: Store },
  { href: '/dashboard/menu', label: 'Menu', icon: MenuSquare },
  { href: '/dashboard/tables', label: 'Tables', icon: Table2 },
  { href: '/dashboard/qr', label: 'QR Setup', icon: QrCode },
]

const isActiveRoute = (pathname: string, href: string) =>
  href === '/dashboard' ? pathname === href : pathname.startsWith(href)

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { session, selectedRestaurantId, selectedMembership, setSelectedRestaurantId, logout } =
    useDashboard()
  const cafe = selectedMembership?.restaurant

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#09100d] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.07] bg-[#0d1612] lg:flex lg:flex-col">
        <div className="border-b border-white/[0.07] p-6">
          <Link href="/dashboard" className="text-white">
            <TaveroBrand compact inverse label="Tavero Partner" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                  active
                    ? 'bg-[#F2C572] text-[#254334]'
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/[0.07] p-4">
          {cafe && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <p className="truncate text-sm font-black">{cafe.name}</p>
              <p className="mt-1 truncate text-xs text-white/35">{cafe.city || 'Cafe workspace'}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/cafe/${cafe.slug}`}
                  target="_blank"
                  className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] text-xs font-bold text-white/60 transition hover:-translate-y-0.5 hover:bg-white/[0.09] hover:text-white"
                >
                  Profile <ExternalLink size={12} />
                </Link>
                <Link
                  href={`/cafe/${cafe.slug}/menu`}
                  target="_blank"
                  className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] text-xs font-bold text-white/60 transition hover:-translate-y-0.5 hover:bg-white/[0.09] hover:text-white"
                >
                  Menu <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/35 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#09100d]/92 backdrop-blur-xl">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm font-black sm:text-base">
                {cafe?.name ?? 'Tavero Partner'}
              </p>
              <p className="truncate text-xs text-white/30">
                {selectedMembership?.role.toLowerCase()} workspace · {session.user.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {session.user.memberships.length > 1 && (
                <select
                  value={selectedRestaurantId}
                  onChange={(event) => setSelectedRestaurantId(event.target.value)}
                  aria-label="Active cafe"
                  className="min-h-10 max-w-44 rounded-xl border border-white/10 bg-[#111c17] px-3 text-xs font-bold text-white sm:max-w-64"
                >
                  {session.user.memberships.map((membership) => (
                    <option key={membership.id} value={membership.restaurant.id}>
                      {membership.restaurant.name}
                    </option>
                  ))}
                </select>
              )}
              {cafe && (
                <Link
                  href={`/cafe/${cafe.slug}`}
                  target="_blank"
                  className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-black text-white/60 transition hover:-translate-y-0.5 hover:border-[#F2C572]/25 hover:text-white sm:flex"
                >
                  View public profile
                  <ExternalLink size={13} />
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-rose-300 lg:hidden"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>

          <nav
            className="flex gap-1 overflow-x-auto border-t border-white/[0.05] px-3 py-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
            aria-label="Mobile dashboard navigation"
          >
            {navigation.map((item) => {
              const active = isActiveRoute(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-black ${
                    active ? 'bg-[#F2C572] text-[#254334]' : 'text-white/40'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
