'use client'

import {
  Check,
  Copy,
  Download,
  ExternalLink,
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
import { dashboardApiRequest, type Restaurant } from '@/lib/dashboard-api'

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
        const publicData = await dashboardApiRequest<PublicCafeQr>(
          `/api/v1/public/cafes/${encodeURIComponent(restaurantData.restaurant.slug)}`,
        )
        setQr(publicData)
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
      await navigator.clipboard.writeText(qr.menuUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setError('Your browser blocked clipboard access. Copy the URL from the field instead.')
    }
  }

  const downloadQr = () => {
    if (!qr) return
    const link = document.createElement('a')
    link.href = qr.qrCodeDataUrl
    link.download = `${qr.slug}-cafe-ordering-qr.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (loading) return <DashboardLoading label="Loading cafe QR setup" />
  if (error && !restaurant) return <DashboardError message={error} onRetry={() => void load()} />
  if (!restaurant) return <DashboardError message="Cafe QR setup is unavailable." />

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        eyebrow="Ordering access"
        title="QR setup"
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

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={downloadQr}
                disabled={!qr}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e8b968] px-4 text-sm font-black text-[#17251f] disabled:opacity-35"
              >
                <Download size={17} /> Download QR
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!qr}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/60 disabled:opacity-35"
              >
                <Printer size={17} /> Print poster
              </button>
            </div>
          </article>

          <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-6">
            <h2 className="text-lg font-black">Connected ordering flow</h2>
            <div className="mt-5 space-y-4">
              {[
                [Store, 'Customer opens your cafe menu', `/cafe/${restaurant.slug}/menu`],
                [QrCode, 'Customer selects an active table', 'Tables are managed in CafeOS'],
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17251f] text-[#f0c67e]">
                <Store size={25} />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#a26b22]">
                Digital table ordering
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
              <p className="mt-5 text-xs font-black text-[#17251f]/48">
                Powered by Cafe Marketplace
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#17251f]/35">
                Discover. Scan. Order.
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
