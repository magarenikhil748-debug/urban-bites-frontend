'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChefHat,
  Clock3,
  Coffee,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Sparkles,
  Table2,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MarketplaceError } from '@/components/public/MarketplaceState'
import { PublicHeader } from '@/components/public/PublicHeader'
import {
  cafeLocation,
  foodTypeMeta,
  formatMenuPrice,
  publicApiRequest,
  type PublicCafe,
  type PublicMenuCategory,
} from '@/lib/public-marketplace'
import { captureProductEvent } from '@/lib/product-analytics'
import { getCafeProfileUrl, getWhatsAppShareUrl } from '@/lib/share-links'

function ProfileLoading() {
  return (
    <main className="min-h-screen bg-[#f7f4ed]" aria-label="Loading cafe profile" aria-busy="true">
      <div className="skeleton h-[35rem]" />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton h-36 rounded-[1.7rem]" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-[2rem]" />
      </div>
    </main>
  )
}

export default function CafeProfilePage({ params }: { params: { slug: string } }) {
  const [cafe, setCafe] = useState<PublicCafe | null>(null)
  const [categories, setCategories] = useState<PublicMenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const [detail, menu] = await Promise.all([
          publicApiRequest<{ cafe: PublicCafe }>(
            `/api/v1/public/cafes/${encodeURIComponent(params.slug)}`,
            controller.signal,
          ),
          publicApiRequest<{ categories: PublicMenuCategory[] }>(
            `/api/v1/public/cafes/${encodeURIComponent(params.slug)}/menu`,
            controller.signal,
          ),
        ])
        setCafe(detail.cafe)
        setCategories(menu.categories)
        captureProductEvent('cafe_profile_viewed', { cafe_id: detail.cafe.id })
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this cafe.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [params.slug, reloadKey])

  const totalItems = useMemo(
    () => categories.reduce((total, category) => total + category.items.length, 0),
    [categories],
  )
  const previewCategories = categories.slice(0, 4)

  if (loading) {
    return <ProfileLoading />
  }

  if (error || !cafe) {
    return (
      <main className="min-h-screen bg-[#f7f4ed]">
        <PublicHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <MarketplaceError
            message={error || 'This cafe could not be found.'}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
          <Link
            href="/cafes"
            className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-black text-[#1b2b25]"
          >
            <ArrowLeft size={16} />
            Back to cafes
          </Link>
        </div>
      </main>
    )
  }

  const location = cafeLocation(cafe)
  const profileUrl = getCafeProfileUrl(cafe.slug)
  const shareMessage = `Discover ${cafe.name} on Tavero: ${profileUrl}`

  const copyProfile = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    captureProductEvent('cafe_link_copied', { cafe_id: cafe.id, link_type: 'profile' })
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17251f]">
      <section className="relative min-h-[38rem] overflow-hidden bg-[#17251f] text-white">
        <PublicHeader floating />
        {cafe.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${cafe.imageUrl}")` }}
            role="img"
            aria-label={`${cafe.name} cafe interior`}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(231,187,112,0.45),transparent_32%),linear-gradient(145deg,#3b574a,#13231d_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17251f] via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[38rem] max-w-7xl items-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link
              href="/cafes"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-xs font-black text-white/75 backdrop-blur-xl transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Explore all cafes
            </Link>
            <div className="mt-7 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
                {cafe.logoUrl ? (
                  <span
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${cafe.logoUrl}")` }}
                  />
                ) : (
                  <ChefHat size={27} className="text-[#f1cd8e]" />
                )}
              </span>
              {totalItems > 0 && (
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-200 backdrop-blur-xl">
                  Current menu available
                </span>
              )}
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold leading-none sm:text-6xl lg:text-7xl">
              {cafe.name}
            </h1>
            {cafe.description && (
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                {cafe.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#e7bb70]" />
                  {location}
                </span>
              )}
              {cafe.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[#e7bb70]" />
                  {cafe.phone}
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/cafe/${cafe.slug}/menu`}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e7bb70] px-6 font-black text-[#17251f] transition hover:bg-[#efca8b]"
              >
                <UtensilsCrossed size={18} />
                Preview menu
              </Link>
              <Link
                href="/cafes"
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 font-black text-white backdrop-blur-xl"
              >
                Back to cafes
              </Link>
              <a
                href={getWhatsAppShareUrl(shareMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  captureProductEvent('cafe_shared_whatsapp', {
                    cafe_id: cafe.id,
                    link_type: 'profile',
                  })
                }
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-5 font-black text-emerald-100 backdrop-blur-xl"
              >
                <MessageCircle size={18} />
                Share
              </a>
              <button
                type="button"
                onClick={() => void copyProfile()}
                className="min-h-14 rounded-2xl border border-white/15 bg-white/[0.06] px-5 font-black text-white"
              >
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-8 px-4 sm:px-6">
        <div className="relative mx-auto grid max-w-6xl gap-px overflow-hidden rounded-[2rem] border border-stone-900/[0.07] bg-stone-900/[0.07] shadow-xl md:grid-cols-3">
          <article className="bg-white p-6">
            <MapPin size={20} className="text-[#b87924]" />
            <p className="mt-4 text-sm font-black">Cafe location</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {location || 'Location details are not currently listed.'}
            </p>
          </article>
          <article className="bg-white p-6">
            <BookOpen size={20} className="text-[#b87924]" />
            <p className="mt-4 text-sm font-black">Menu availability</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {totalItems > 0
                ? `${totalItems} item${totalItems === 1 ? '' : 's'} across ${categories.length} categor${
                    categories.length === 1 ? 'y' : 'ies'
                  }.`
                : 'No menu items are currently available.'}
            </p>
          </article>
          <article className="bg-white p-6">
            <QrCode size={20} className="text-[#b87924]" />
            <p className="mt-4 text-sm font-black">QR table ordering</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Scan the secure QR placed on your table when you arrive to begin an order.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.23em] text-[#b87924]">
              Before you visit
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
              A clear view of the cafe, not a wall of invented scores.
            </h2>
            <p className="mt-5 text-base leading-7 text-stone-600">
              This profile uses the cafe&apos;s own description, real location details, and current
              menu to help you decide if it fits the visit you have in mind.
            </p>
            <div className="mt-7 space-y-3">
              {[
                cafe.description
                  ? 'Cafe identity and experience described by the venue'
                  : 'Cafe profile available',
                totalItems > 0 ? 'Current digital menu ready to browse' : 'Menu updates pending',
                'Table ordering begins only from the QR placed at the cafe',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2.5 text-sm font-bold text-stone-600">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-stone-900/[0.07] bg-[#e9e2d5] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b87924]">
                  Menu preview
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">What&apos;s available</h2>
              </div>
              {totalItems > 0 && (
                <Link
                  href={`/cafe/${cafe.slug}/menu`}
                  className="hidden min-h-11 items-center gap-2 rounded-xl bg-[#1b2b25] px-4 text-sm font-black text-white sm:flex"
                >
                  Preview menu
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>

            {totalItems === 0 ? (
              <div className="mt-7 rounded-[1.5rem] border border-dashed border-stone-900/10 bg-white/50 px-5 py-12 text-center">
                <Coffee size={26} className="mx-auto text-stone-400" />
                <p className="mt-4 font-black">Menu preview unavailable</p>
                <p className="mt-2 text-sm text-stone-500">
                  This cafe has not published available menu items yet.
                </p>
              </div>
            ) : (
              <div className="mt-7 space-y-7">
                {previewCategories.map((category) => (
                  <section key={category.id}>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{category.name}</h3>
                        {category.description && (
                          <p className="mt-0.5 text-xs text-stone-500">{category.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-400">
                        {category.items.length} item{category.items.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {category.items.slice(0, 4).map((item) => {
                        const food = foodTypeMeta(item.foodType)
                        return (
                          <article
                            key={item.id}
                            className="rounded-[1.3rem] border border-stone-900/[0.06] bg-white/70 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-black">{item.name}</p>
                                <p
                                  className={`mt-1 flex items-center gap-1.5 text-[10px] font-black ${food.textClass}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${food.dotClass}`} />
                                  {food.label}
                                  {item.isRecommended && (
                                    <>
                                      <span className="text-stone-300">•</span>
                                      <Sparkles size={10} />
                                      Recommended
                                    </>
                                  )}
                                </p>
                              </div>
                              <p className="shrink-0 font-black text-[#a96d20]">
                                {formatMenuPrice(item.priceInPaise, cafe.currency)}
                              </p>
                            </div>
                            {item.description && (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">
                                {item.description}
                              </p>
                            )}
                            {item.preparationTimeMinutes && (
                              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-stone-400">
                                <Clock3 size={11} />
                                {item.preparationTimeMinutes} min prep
                              </p>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {totalItems > 0 && (
              <Link
                href={`/cafe/${cafe.slug}/menu`}
                className="mt-7 flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-[#1b2b25] px-5 text-sm font-black text-white sm:hidden"
              >
                Preview full menu
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#17251f] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.23em] text-[#e3b769]">
              From visit to service
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Ordering designed around the table.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              The marketplace helps you choose the cafe. The QR flow handles the in-cafe order
              without disconnecting you from the venue experience.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [MapPin, 'Visit the cafe', 'Use the listed location to find the venue.'],
              [QrCode, 'Scan the QR', 'Open the cafe menu on your phone.'],
              [Table2, 'Table is locked', 'The table QR securely sets where staff should serve.'],
              [
                ChefHat,
                'Staff receives it live',
                'The order enters the cafe dashboard immediately.',
              ],
            ].map(([Icon, title, text], index) => {
              const StepIcon = Icon as typeof MapPin
              return (
                <article
                  key={title as string}
                  className="rounded-[1.7rem] border border-white/[0.08] bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between">
                    <StepIcon size={20} className="text-[#e3b769]" />
                    <span className="font-accent text-[10px] text-white/30">0{index + 1}</span>
                  </div>
                  <p className="mt-8 font-black">{title as string}</p>
                  <p className="mt-2 text-sm leading-6 text-white/45">{text as string}</p>
                </article>
              )
            })}
          </div>
          <Link
            href={`/cafe/${cafe.slug}/menu`}
            className="mt-10 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#e7bb70] px-6 font-black text-[#17251f] sm:w-fit"
          >
            <UtensilsCrossed size={18} />
            Preview menu
          </Link>
        </div>
      </section>
    </main>
  )
}
