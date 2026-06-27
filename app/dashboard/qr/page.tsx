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
  Table2,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TaveroLogo } from '@/components/brand/TaveroLogo'
import {
  DashboardError,
  DashboardLoading,
  DashboardNotice,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { dashboardApiRequest, type Branch, type Restaurant } from '@/lib/dashboard-api'
import { captureProductEvent } from '@/lib/product-analytics'
import { getWhatsAppShareUrl, isLocalUrl } from '@/lib/share-links'

type TableQr = {
  id: string
  restaurantId: string
  branchId: string
  tableNumber: string
  tableLabel: string | null
  qrUrl: string
  qrCodeDataUrl: string
  isActive: boolean
  branch: Branch
}

const copyText = async (value: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value)
    return
  }

  const fallback = document.createElement('textarea')
  fallback.value = value
  fallback.style.position = 'fixed'
  fallback.style.opacity = '0'
  document.body.appendChild(fallback)
  fallback.select()
  const copied = document.execCommand('copy')
  fallback.remove()
  if (!copied) throw new Error('Clipboard access was blocked')
}

export default function CafeQrSetupPage() {
  const { session, selectedRestaurantId } = useDashboard()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tables, setTables] = useState<TableQr[]>([])
  const [selectedTableId, setSelectedTableId] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!session || !selectedRestaurantId) return
    try {
      setLoading(true)
      setError('')
      const restaurantData = await dashboardApiRequest<{ restaurant: Restaurant }>(
        `/api/v1/restaurants/${selectedRestaurantId}`,
        { token: session.accessToken },
      )
      const branches = restaurantData.restaurant.branches ?? []
      const tableGroups = await Promise.all(
        branches.map(async (branch) => {
          const data = await dashboardApiRequest<{ tables: Omit<TableQr, 'branch'>[] }>(
            `/api/v1/branches/${branch.id}/tables`,
            { token: session.accessToken },
          )
          return data.tables.map((table) => ({ ...table, branch }))
        }),
      )
      const activeTables = tableGroups.flat().filter((table) => table.isActive)
      setRestaurant(restaurantData.restaurant)
      setTables(activeTables)
      setSelectedTableId((current) =>
        activeTables.some((table) => table.id === current) ? current : (activeTables[0]?.id ?? ''),
      )
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load table QR codes.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  )

  const copyLink = async (table: TableQr) => {
    try {
      await copyText(table.qrUrl)
      setError('')
      setCopiedId(table.id)
      captureProductEvent('cafe_link_copied', {
        cafe_id: restaurant?.id,
        link_type: 'table_qr',
      })
      window.setTimeout(() => setCopiedId(''), 2000)
    } catch {
      setError('Your browser blocked clipboard access. Copy the table URL manually.')
    }
  }

  const printTable = (table: TableQr) => {
    setSelectedTableId(table.id)
    captureProductEvent('qr_printed', { cafe_id: restaurant?.id, table_id: table.id })
    window.setTimeout(() => window.print(), 50)
  }

  if (loading) return <DashboardLoading label="Loading table QR codes" />
  if (error && !restaurant) return <DashboardError message={error} onRetry={() => void load()} />
  if (!restaurant) return <DashboardError message="Cafe QR setup is unavailable." />

  const hasLocalQr = tables.some((table) => isLocalUrl(table.qrUrl))

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        eyebrow="Secure table ordering"
        title="Tavero QR"
        description="Every active table has its own non-guessable ordering link. Guests scan at the table; Tavero locks the order to that table."
        actions={
          <Link
            href={`/cafe/${restaurant.slug}/menu`}
            target="_blank"
            className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/65 hover:text-white"
          >
            Preview public menu <ExternalLink size={15} />
          </Link>
        }
      />

      {error && <DashboardError message={error} />}
      {!restaurant.isApproved && (
        <DashboardNotice
          title="Cafe approval is pending"
          message="You can prepare table QR posters now, but order links remain blocked until Tavero approves and activates the cafe."
          tone="warning"
        />
      )}
      {hasLocalQr && (
        <DashboardNotice
          title="These QR links point to localhost"
          message="Set FRONTEND_URL on Railway to the deployed Tavero HTTPS domain, then reload this page before printing or sharing table QR codes."
          tone="warning"
        />
      )}

      {tables.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/10 bg-[#111a16] px-6 py-16 text-center">
          <Table2 size={34} className="mx-auto text-[#e8b968]" />
          <h2 className="mt-4 text-2xl font-black">No active tables are ready.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
            Create or reactivate a table first. Tavero generates a secure QR token when the table is
            created and never rotates it during normal deploys or seed runs.
          </p>
          <Link href="/dashboard/tables" className="tavero-button-primary mt-6 text-sm">
            Manage tables
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            {tables.map((table) => {
              const label = table.tableLabel ?? `Table ${table.tableNumber}`
              const whatsappMessage = `${restaurant.name} ${label} Tavero QR: ${table.qrUrl}`
              return (
                <article
                  key={table.id}
                  className={`rounded-[1.7rem] border bg-[#111a16] p-5 transition ${
                    selectedTableId === table.id
                      ? 'border-[#e8b968]/35 shadow-lg shadow-[#e8b968]/5'
                      : 'border-white/[0.07]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8b968] text-[#17251f]">
                        <QrCode size={21} />
                      </span>
                      <span>
                        <span className="block text-xl font-black">{label}</span>
                        <span className="mt-1 block text-xs text-white/35">
                          {table.branch.name}
                        </span>
                      </span>
                    </span>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">
                      ACTIVE
                    </span>
                  </button>

                  <input
                    value={table.qrUrl}
                    readOnly
                    aria-label={`${label} secure QR URL`}
                    className="dashboard-input mt-4 w-full text-xs"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => void copyLink(table)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-black text-white/60"
                    >
                      {copiedId === table.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === table.id ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={table.qrCodeDataUrl}
                      download={`${restaurant.slug}-table-${table.tableNumber}-qr.png`}
                      onClick={() =>
                        captureProductEvent('qr_downloaded', {
                          cafe_id: restaurant.id,
                          table_id: table.id,
                        })
                      }
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e8b968] text-xs font-black text-[#17251f]"
                    >
                      <Download size={14} /> Download
                    </a>
                    <button
                      type="button"
                      onClick={() => printTable(table)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-black text-white/60"
                    >
                      <Printer size={14} /> Print
                    </button>
                    <a
                      href={getWhatsAppShareUrl(whatsappMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-xs font-black text-emerald-200"
                    >
                      <MessageCircle size={14} /> Share
                    </a>
                  </div>
                </article>
              )
            })}
          </div>

          <div>
            {selectedTable && (
              <div
                id="cafe-qr-poster"
                className="cafe-qr-poster mx-auto max-w-xl overflow-hidden rounded-[2.2rem] bg-[#f6f0e4] p-4 text-[#17251f] shadow-2xl shadow-black/30 sm:p-6"
              >
                <div className="rounded-[1.7rem] border border-[#17251f]/10 p-6 text-center sm:p-10">
                  <div className="flex justify-center">
                    <TaveroLogo variant="light" size="md" contextLabel="QR" />
                  </div>
                  <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#a26b22]">
                    Tavero QR
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                    {restaurant.name}
                  </h2>
                  <p className="mt-3 text-2xl font-black">
                    {selectedTable.tableLabel ?? `Table ${selectedTable.tableNumber}`}
                  </p>
                  <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-[#17251f]/58">
                    Scan from your table to order
                  </p>

                  <div className="mx-auto mt-7 flex aspect-square w-full max-w-[19rem] items-center justify-center rounded-[2rem] border border-[#17251f]/10 bg-white p-5 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTable.qrCodeDataUrl}
                      alt={`Tavero QR for ${restaurant.name} table ${selectedTable.tableNumber}`}
                      className="h-full w-full"
                    />
                  </div>

                  <p className="mt-6 break-all font-accent text-[10px] font-bold text-[#17251f]/45">
                    {selectedTable.qrUrl}
                  </p>
                  <div className="mx-auto mt-8 h-px max-w-xs bg-[#17251f]/10" />
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs font-black text-[#254334]">
                    <ShieldCheck size={15} /> Secure table-specific ordering
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#17251f]/42">
                    Discover · Scan · Order
                  </p>
                </div>
              </div>
            )}
            {hasLocalQr && (
              <p className="mt-4 flex items-start justify-center gap-2 text-xs text-amber-200/75">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" /> Do not print until the URL
                uses the deployed Tavero domain.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
