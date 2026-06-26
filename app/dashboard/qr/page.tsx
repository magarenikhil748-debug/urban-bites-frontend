'use client'

import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Printer,
  QrCode,
  ShieldCheck,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  DashboardError,
  DashboardLoading,
  DashboardNotice,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { TaveroLogo } from '@/components/brand/TaveroLogo'
import { dashboardApiRequest, type Restaurant } from '@/lib/dashboard-api'
import { captureProductEvent } from '@/lib/product-analytics'
import { getWhatsAppShareUrl, isLocalUrl } from '@/lib/share-links'

type PublicCafeQr = {
  id: string
  name: string
  slug: string
  menuUrl: string
  qrCodeDataUrl: string
}

export default function CafeQrSetupPage() {
  const { session, selectedRestaurantId } = useDashboard()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [qr, setQr] = useState<PublicCafeQr | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrUnavailableReason, setQrUnavailableReason] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!session || !selectedRestaurantId) return
    try {
      setLoading(true)
      setError('')
      setQrUnavailableReason('')
      const restaurantData = await dashboardApiRequest<{ restaurant: Restaurant }>(
        `/api/v1/restaurants/${selectedRestaurantId}`,
        { token: session.accessToken },
      )
      setRestaurant(restaurantData.restaurant)

      try {
        const publicData = await dashboardApiRequest<{ cafe: PublicCafeQr }>(
          `/api/v1/public/cafes/${encodeURIComponent(restaurantData.restaurant.slug)}`,
        )
        setQr(publicData.cafe)
      } catch (publicError) {
        setQr(null)
        setQrUnavailableReason(
          publicError instanceof Error
            ? publicError.message
            : 'The public cafe QR is not available yet.',
        )
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load QR setup.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const copyLink = async () => {
    if (!qr) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(qr.menuUrl)
      } else {
        throw new Error('Clipboard API unavailable')
      }
      setError('')
      setCopied(true)
      captureProductEvent('cafe_link_copied', {
        cafe_id: restaurant?.id,
        link_type: 'menu',
      })
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      const fallback = document.createElement('textarea')
      fallback.value = qr.menuUrl
      fallback.style.position = 'fixed'
      fallback.style.opacity = '0'
      document.body.appendChild(fallback)
      fallback.select()
      const copiedWithFallback = document.execCommand('copy')
      fallback.remove()

      if (copiedWithFallback) {
        setError('')
        setCopied(true)
        captureProductEvent('cafe_link_copied', {
          cafe_id: restaurant?.id,
          link_type: 'menu',
        })
        window.setTimeout(() => setCopied(false), 2200)
      } else {
        setError('Your browser blocked clipboard access. Copy the URL from the field instead.')
      }
    }
  }

  if (loading) return <DashboardLoading label="Loading cafe QR setup" />
  if (error && !restaurant) return <DashboardError message={error} onRetry={() => void load()} />
  if (!restaurant) return <DashboardError message="Cafe QR setup is unavailable." />

  const localQrWarning = qr ? isLocalUrl(qr.menuUrl) : false
  const whatsappMessage = qr
    ? `Scan or open ${restaurant.name}'s digital menu to order at your table: ${qr.menuUrl}`
    : ''

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        eyebrow="Ordering access"
        title="Tavero QR"
        description="Turn your public menu into a cafe-ready ordering asset customers can scan from tables, the counter, or printed material."
        actions={
          <>
            <Link
              href={`/cafe/${restaurant.slug}`}
              target="_blank"
              className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/65 hover:text-white"
            >
              Public profile <ExternalLink size={15} />
            </Link>
            <Link
              href={`/cafe/${restaurant.slug}/menu`}
              target="_blank"
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f]"
            >
              Open customer menu <ExternalLink size={15} />
            </Link>
          </>
        }
      />

      {error && <DashboardError message={error} />}
      {qrUnavailableReason && (
        <DashboardNotice
          title="Public QR is not available"
          message={`${qrUnavailableReason}. The backend only returns the cafe QR after the cafe is active and marketplace-approved; no QR is being fabricated locally.`}
          tone="warning"
        />
      )}
      {localQrWarning && (
        <DashboardNotice
          title="This QR points to localhost"
          message="It will only work on this computer. Set FRONTEND_URL on the backend and NEXT_PUBLIC_APP_URL on the frontend to the deployed HTTPS domain, then regenerate/reload this QR before printing."
          tone="warning"
        />
      )}

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8b968]/10 text-[#e8b968]">
              <QrCode size={22} />
            </div>
            <h2 className="mt-5 text-xl font-black">Single cafe ordering QR</h2>
            <p className="mt-2 text-sm leading-6 text-white/35">
              Customers scan once, open the current digital menu, choose their active table, and
              send the order directly to your live dashboard.
            </p>

            <div className="mt-6">
              <p className="text-xs font-bold text-white/35">Public menu/order URL</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={qr?.menuUrl ?? `/cafe/${restaurant.slug}/menu`}
                  readOnly
                  aria-label="Public menu order URL"
                  className="dashboard-input min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  disabled={!qr}
                  aria-label="Copy ordering link"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 disabled:opacity-35"
                >
                  {copied ? <Check size={17} className="text-emerald-300" /> : <Copy size={17} />}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {qr ? (
                <a
                  href={qr.qrCodeDataUrl}
                  download={`${qr.slug}-cafe-ordering-qr.png`}
                  onClick={() => captureProductEvent('qr_downloaded', { cafe_id: restaurant.id })}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e8b968] px-4 text-sm font-black text-[#17251f]"
                >
                  <Download size={17} /> Download QR
                </a>
              ) : (
                <span className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e8b968] px-4 text-sm font-black text-[#17251f] opacity-35">
                  <Download size={17} /> Download QR
                </span>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!qr}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/60 disabled:opacity-35"
              >
                <Printer size={17} /> Print poster
              </button>
              {qr ? (
                <a
                  href={getWhatsAppShareUrl(whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    captureProductEvent('cafe_shared_whatsapp', {
                      cafe_id: restaurant.id,
                      link_type: 'menu',
                    })
                  }
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 text-sm font-black text-emerald-200"
                >
                  <MessageCircle size={17} /> WhatsApp
                </a>
              ) : (
                <span className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 text-sm font-black text-white/25">
                  <MessageCircle size={17} /> WhatsApp
                </span>
              )}
            </div>
            {localQrWarning && (
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-amber-200/75">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                Do not distribute this QR until the encoded URL uses your deployed public domain.
              </p>
            )}
          </article>

          <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-6">
            <h2 className="text-lg font-black">Connected ordering flow</h2>
            <div className="mt-5 space-y-4">
              {[
                [Store, 'Customer opens your cafe menu', `/cafe/${restaurant.slug}/menu`],
                [
                  QrCode,
                  'Customer selects an active table',
                  'Tables are managed in Tavero Partner',
                ],
                [ShieldCheck, 'Order reaches live operations', 'Prices remain server-verified'],
              ].map(([Icon, title, detail]) => {
                const StepIcon = Icon as typeof Store
                return (
                  <div key={title as string} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#e8b968]">
                      <StepIcon size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-black">{title as string}</p>
                      <p className="mt-1 text-xs text-white/30">{detail as string}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </div>

        <div>
          <div
            id="cafe-qr-poster"
            className="cafe-qr-poster mx-auto max-w-xl overflow-hidden rounded-[2.2rem] bg-[#f6f0e4] p-4 text-[#17251f] shadow-2xl shadow-black/30 sm:p-6"
          >
            <div className="rounded-[1.7rem] border border-[#17251f]/10 p-6 text-center sm:p-10">
              <div className="flex justify-center">
                <TaveroLogo variant="light" size="md" contextLabel="QR" />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#a26b22]">
                Tavero QR · Digital table ordering
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                {restaurant.name}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#17251f]/58">
                Scan to view menu and order from your table
              </p>

              <div className="mx-auto mt-8 flex aspect-square w-full max-w-[19rem] items-center justify-center rounded-[2rem] border border-[#17251f]/10 bg-white p-5 shadow-sm">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qr.qrCodeDataUrl}
                    alt={`QR code for ${restaurant.name} ordering menu`}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="text-center text-[#17251f]/35">
                    <QrCode size={70} className="mx-auto" />
                    <p className="mt-4 text-sm font-black">QR awaiting public approval</p>
                  </div>
                )}
              </div>

              <p className="mt-6 break-all font-accent text-[10px] font-bold uppercase text-[#17251f]/45">
                {qr?.menuUrl ?? `/cafe/${restaurant.slug}/menu`}
              </p>
              <div className="mx-auto mt-8 h-px max-w-xs bg-[#17251f]/10" />
              <div className="mt-5 flex justify-center">
                <TaveroLogo variant="light" size="sm" showTagline={false} />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#17251f]/42">
                Discover · Scan · Order
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-white/28">
            Print preview uses the real backend-generated cafe QR. Existing per-table QR assets
            remain backward compatible.
          </p>
        </div>
      </section>
    </div>
  )
}
