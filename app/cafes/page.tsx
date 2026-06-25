'use client'

import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  Coffee,
  LayoutDashboard,
  QrCode,
  Search,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CafeCard } from '@/components/public/CafeCard'
import {
  MarketplaceEmpty,
  MarketplaceError,
  MarketplaceLoading,
} from '@/components/public/MarketplaceState'
import { PublicHeader } from '@/components/public/PublicHeader'
import {
  publicApiRequest,
  type PublicCafe,
  type PublicMenuCategory,
} from '@/lib/public-marketplace'
import { captureProductEvent } from '@/lib/product-analytics'

type CafeListing = PublicCafe & {
  menuItemCount: number
}

export default function CafesMarketplacePage() {
  const [cafes, setCafes] = useState<CafeListing[]>([])
  const [search, setSearch] = useState('')
  const [withMenuOnly, setWithMenuOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    captureProductEvent('marketplace_viewed')
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadCafes = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await publicApiRequest<{ cafes: PublicCafe[] }>(
          '/api/v1/public/cafes',
          controller.signal,
        )
        const enriched = await Promise.all(
          data.cafes.map(async (cafe) => {
            try {
              const menu = await publicApiRequest<{ categories: PublicMenuCategory[] }>(
                `/api/v1/public/cafes/${encodeURIComponent(cafe.slug)}/menu`,
                controller.signal,
              )
              return {
                ...cafe,
                menuItemCount: menu.categories.reduce(
                  (total, category) => total + category.items.length,
                  0,
                ),
              }
            } catch {
              return { ...cafe, menuItemCount: 0 }
            }
          }),
        )
        setCafes(enriched)
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Unable to load cafes.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCafes()
    return () => controller.abort()
  }, [reloadKey])

  const filteredCafes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return cafes.filter((cafe) => {
      if (withMenuOnly && cafe.menuItemCount === 0) {
        return false
      }
      if (!query) {
        return true
      }
      return [cafe.name, cafe.city, cafe.address, cafe.description].some((value) =>
        value?.toLowerCase().includes(query),
      )
    })
  }, [cafes, search, withMenuOnly])

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17251f]">
      <section className="relative min-h-[44rem] overflow-hidden bg-[#13231d] text-white">
        <PublicHeader floating />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(225,168,78,0.28),transparent_28%),radial-gradient(circle_at_82%_75%,rgba(85,130,108,0.3),transparent_34%)]" />
          <div className="absolute -right-32 top-24 h-[34rem] w-[34rem] rounded-full border border-white/[0.06]" />
          <div className="absolute -right-12 top-44 h-[24rem] w-[24rem] rounded-full border border-white/[0.08]" />
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#f7f4ed] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[44rem] max-w-7xl items-center gap-12 px-4 pb-28 pt-32 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f3d69b] backdrop-blur-xl">
              <Sparkles size={14} />
              Cafe discovery meets table ordering
            </p>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
              Discover cafes.
              <span className="block text-[#e3b769]">See the real menu.</span>
              Order at your table.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
              Explore approved cafe profiles before you visit, browse current menus, and move
              seamlessly from discovery to QR ordering once you arrive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#explore"
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e7bb70] px-6 font-black text-[#17251f] transition hover:bg-[#f0cb8b]"
              >
                Explore cafes
                <ArrowDown size={18} />
              </a>
              <Link
                href="#for-cafes"
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 font-black text-white backdrop-blur-xl transition hover:bg-white/10"
              >
                <LayoutDashboard size={18} />
                For cafe teams
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[30rem] lg:block">
            <div className="absolute right-0 top-4 w-[82%] rotate-2 rounded-[2.2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[1.7rem] bg-[#e8dfd0]">
                <div className="h-48 bg-[radial-gradient(circle_at_25%_20%,rgba(240,186,93,0.65),transparent_34%),linear-gradient(145deg,#526e60,#1d3028_75%)]" />
                <div className="p-5 text-[#17251f]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#aa7226]">
                    A richer cafe presence
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold">
                    Profile. Menu. QR ordering.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    One connected experience for customers and cafe teams.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-10 left-0 w-64 -rotate-3 rounded-[1.8rem] border border-white/10 bg-[#0d1713]/85 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7bb70] text-[#17251f]">
                  <UtensilsCrossed size={20} />
                </span>
                <div>
                  <p className="font-black">Table ordering</p>
                  <p className="text-xs text-white/45">Fast, clear, connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-14 px-4 sm:px-6" aria-label="Marketplace features">
        <div className="relative mx-auto grid max-w-5xl gap-px overflow-hidden rounded-[2rem] border border-stone-900/[0.07] bg-stone-900/[0.07] shadow-xl md:grid-cols-3">
          {[
            {
              icon: BookOpenCheck,
              title: 'Real digital menus',
              text: 'Browse the items cafes currently make available.',
            },
            {
              icon: QrCode,
              title: 'Table ordering',
              text: 'Select your table and send the order directly to staff.',
            },
            {
              icon: LayoutDashboard,
              title: 'Live cafe operations',
              text: 'Cafe teams receive and manage QR orders in real time.',
            },
          ].map((feature) => (
            <article key={feature.title} className="bg-white px-6 py-5">
              <feature.icon size={20} className="text-[#b87924]" />
              <p className="mt-3 font-black">{feature.title}</p>
              <p className="mt-1 text-sm leading-5 text-stone-500">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.23em] text-[#b87924]">
              Marketplace discovery
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
              Find your next cafe
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              Search approved cafe profiles by name, city, address, or the experience they describe.
            </p>
          </div>
          {!loading && !error && (
            <p className="text-sm font-bold text-stone-500">
              {filteredCafes.length} cafe{filteredCafes.length === 1 ? '' : 's'} shown
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-[1.7rem] border border-stone-900/[0.07] bg-white p-3 shadow-sm md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cafes, cities, or descriptions"
              className="min-h-[3.25rem] w-full rounded-2xl bg-[#f7f4ed] pl-11 pr-4 text-sm font-medium outline-none placeholder:text-stone-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWithMenuOnly(false)}
              className={`min-h-[3.25rem] flex-1 rounded-2xl px-5 text-sm font-black transition md:flex-none ${
                !withMenuOnly
                  ? 'bg-[#1b2b25] text-white'
                  : 'border border-stone-900/10 text-stone-500'
              }`}
            >
              All cafes
            </button>
            <button
              type="button"
              onClick={() => setWithMenuOnly(true)}
              className={`min-h-[3.25rem] flex-1 rounded-2xl px-5 text-sm font-black transition md:flex-none ${
                withMenuOnly
                  ? 'bg-[#1b2b25] text-white'
                  : 'border border-stone-900/10 text-stone-500'
              }`}
            >
              With menu
            </button>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <MarketplaceLoading />
          ) : error ? (
            <MarketplaceError message={error} onRetry={() => setReloadKey((value) => value + 1)} />
          ) : cafes.length === 0 ? (
            <MarketplaceEmpty />
          ) : filteredCafes.length === 0 ? (
            <MarketplaceEmpty
              title="No cafes match your search"
              description="Try a different name, city, address, or remove the menu filter."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} menuItemCount={cafe.menuItemCount} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="for-cafes" className="bg-[#e9e2d5] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.23em] text-[#a56b20]">
                One connected ecosystem
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Better discovery for customers. Better operations for cafes.
              </h2>
              <p className="mt-5 text-base leading-7 text-stone-600">
                The marketplace is the public face of a full cafe ordering system—helping guests
                choose where to visit while giving cafe teams a premium digital presence and a
                practical live-order workflow.
              </p>
              <Link
                href="/dashboard/orders"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#1b2b25] px-5 text-sm font-black text-white"
              >
                Cafe owner dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  '01',
                  'Discover before visiting',
                  'See cafe identity, location, and real menu data.',
                ],
                [
                  '02',
                  'Choose with confidence',
                  'Understand what is available without invented ratings or hype.',
                ],
                ['03', 'Scan and order', 'Use the cafe QR flow and select the correct table.'],
                [
                  '04',
                  'Staff receives it live',
                  'Orders enter the existing operational dashboard immediately.',
                ],
              ].map(([number, title, text]) => (
                <article
                  key={number}
                  className="rounded-[1.7rem] border border-stone-900/[0.07] bg-white/65 p-5"
                >
                  <p className="font-accent text-xs font-bold text-[#b87924]">{number}</p>
                  <p className="mt-5 text-lg font-black">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#13231d] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Coffee size={20} className="text-[#e3b769]" />
            <div>
              <p className="text-sm font-black">Cafe Marketplace</p>
              <p className="text-xs text-white/40">Discover. Scan. Order.</p>
            </div>
          </div>
          <p className="text-xs text-white/35">
            A connected cafe discovery and ordering experience.
          </p>
        </div>
      </footer>
    </main>
  )
}
