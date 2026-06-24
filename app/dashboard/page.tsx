'use client'

import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock3,
  ExternalLink,
  IndianRupee,
  MenuSquare,
  QrCode,
  ReceiptText,
  Store,
  Table2,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DashboardError,
  DashboardLoading,
  DashboardPageHeader,
  DashboardStatCard,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { dashboardApiRequest, formatDashboardPrice, type Restaurant } from '@/lib/dashboard-api'

type TodayDashboard = {
  totalOrdersToday: number
  revenueTodayInPaise: number
  activeOrdersCount: number
  completedOrdersCount: number
  cancelledOrdersCount: number
  averageOrderValueInPaise: number
}

type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'

type OrderSummary = {
  id: string
  status: OrderStatus
  createdAt: string
}

type TopItem = {
  menuItemId: string
  itemName: string
  quantitySold: number
  revenueInPaise: number
}

const quickLinks = [
  {
    href: '/dashboard/orders',
    label: 'Manage Orders',
    detail: 'Run today’s live service',
    icon: ReceiptText,
    tone: 'bg-amber-400/10 text-amber-300',
  },
  {
    href: '/dashboard/cafe',
    label: 'Cafe Profile',
    detail: 'Shape your marketplace presence',
    icon: Store,
    tone: 'bg-emerald-400/10 text-emerald-300',
  },
  {
    href: '/dashboard/menu',
    label: 'Digital Menu',
    detail: 'Items, prices, and availability',
    icon: MenuSquare,
    tone: 'bg-sky-400/10 text-sky-300',
  },
  {
    href: '/dashboard/tables',
    label: 'Dining Tables',
    detail: 'Keep table ordering accurate',
    icon: Table2,
    tone: 'bg-violet-400/10 text-violet-300',
  },
  {
    href: '/dashboard/qr',
    label: 'QR Setup',
    detail: 'Print and share ordering access',
    icon: QrCode,
    tone: 'bg-rose-400/10 text-rose-300',
  },
]

export default function DashboardHomePage() {
  const { session, selectedRestaurantId, selectedMembership } = useDashboard()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const cafe = restaurant ?? selectedMembership?.restaurant

  const load = useCallback(async () => {
    if (!session || !selectedRestaurantId) return

    try {
      setLoading(true)
      setError('')
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const query = new URLSearchParams({
        limit: '100',
        dateFrom: start.toISOString(),
        dateTo: end.toISOString(),
      })

      const [restaurantData, dashboardData, ordersData, topItemsData] = await Promise.all([
        dashboardApiRequest<{ restaurant: Restaurant }>(
          `/api/v1/restaurants/${selectedRestaurantId}`,
          { token: session.accessToken },
        ),
        dashboardApiRequest<TodayDashboard>(
          `/api/v1/restaurants/${selectedRestaurantId}/dashboard/today`,
          { token: session.accessToken },
        ).catch(() => null),
        dashboardApiRequest<{ orders: OrderSummary[] }>(
          `/api/v1/restaurants/${selectedRestaurantId}/orders?${query.toString()}`,
          { token: session.accessToken },
        ),
        dashboardApiRequest<{ items: TopItem[] }>(
          `/api/v1/restaurants/${selectedRestaurantId}/dashboard/top-items?limit=4`,
          { token: session.accessToken },
        ).catch(() => ({ items: [] })),
      ])

      setRestaurant(restaurantData.restaurant)
      setDashboard(dashboardData)
      setOrders(ordersData.orders)
      setTopItems(topItemsData.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const fallbackMetrics = useMemo(
    () => ({
      totalOrdersToday: orders.length,
      revenueTodayInPaise: 0,
      activeOrdersCount: orders.filter((order) =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status),
      ).length,
      completedOrdersCount: orders.filter((order) => order.status === 'SERVED').length,
      cancelledOrdersCount: orders.filter((order) => order.status === 'CANCELLED').length,
      averageOrderValueInPaise: 0,
    }),
    [orders],
  )
  const metrics = dashboard ?? fallbackMetrics
  const pendingCount = orders.filter((order) => order.status === 'PLACED').length
  const preparingCount = orders.filter((order) => order.status === 'PREPARING').length
  const currency = cafe?.currency ?? 'INR'

  if (!session) return null
  if (loading) return <DashboardLoading label="Loading CafeOS home" />
  if (error) return <DashboardError message={error} onRetry={() => void load()} />
  if (!cafe) return <DashboardError message="No cafe is linked to this account." />

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Owner command center"
        title={`Good to see you, ${session.user.name.split(' ')[0]}.`}
        description={`Everything that powers ${cafe.name}—public presence, menu, tables, QR ordering, and live service—in one connected workspace.`}
        actions={
          <>
            <Link
              href={`/cafe/${cafe.slug}`}
              target="_blank"
              className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/65 hover:text-white"
            >
              Public profile <ExternalLink size={15} />
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f]"
            >
              Open live orders <ArrowRight size={16} />
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <DashboardStatCard
          icon={ReceiptText}
          label="Today’s orders"
          value={metrics.totalOrdersToday}
          detail="All orders placed today"
          tone="blue"
        />
        <DashboardStatCard
          icon={Clock3}
          label="Pending"
          value={pendingCount}
          detail="Waiting for acceptance"
          tone="amber"
        />
        <DashboardStatCard
          icon={ChefHat}
          label="Preparing"
          value={preparingCount}
          detail="Currently in the kitchen"
          tone="violet"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Completed"
          value={metrics.completedOrdersCount}
          detail="Served today"
          tone="green"
        />
        <DashboardStatCard
          icon={IndianRupee}
          label="Today’s revenue"
          value={
            dashboard ? formatDashboardPrice(metrics.revenueTodayInPaise, currency) : 'Unavailable'
          }
          detail={dashboard ? 'Excludes cancelled orders' : 'Manager analytics access required'}
          tone="rose"
        />
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/28">
              Operating tools
            </p>
            <h2 className="mt-2 text-2xl font-black">Run the cafe</h2>
          </div>
          <p className="hidden text-xs text-white/28 sm:block">Real controls. Real cafe data.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-5 transition hover:-translate-y-0.5 hover:border-white/15"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}
              >
                <item.icon size={20} />
              </span>
              <p className="mt-5 font-black">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/30">{item.detail}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-[#e8b968]">
                Open <ArrowRight size={13} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-[#111a16]">
          <div className="relative min-h-72">
            {cafe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cafe.imageUrl}
                alt={`${cafe.name} marketplace cover`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,185,104,0.32),transparent_30%),linear-gradient(135deg,#315044,#15241e)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1713] via-[#0d1713]/82 to-transparent" />
            <div className="relative flex min-h-72 max-w-xl flex-col justify-end p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e8b968]">
                Your marketplace presence
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold">{cafe.name}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">
                {cafe.description ||
                  'Add a cafe description to help customers know what to expect.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/cafe"
                  className="min-h-11 rounded-xl bg-[#e8b968] px-4 py-3 text-xs font-black text-[#17251f]"
                >
                  Manage profile
                </Link>
                <Link
                  href={`/cafe/${cafe.slug}/menu`}
                  target="_blank"
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-4 text-xs font-black"
                >
                  Customer menu <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/28">
                Today’s pulse
              </p>
              <h2 className="mt-2 text-xl font-black">Popular items</h2>
            </div>
            <Link href="/dashboard/menu" className="text-xs font-black text-[#e8b968]">
              Manage menu
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {topItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
                <p className="text-sm font-bold text-white/45">No item sales yet today.</p>
                <p className="mt-1 text-xs text-white/25">
                  Popular items will appear after orders are placed.
                </p>
              </div>
            ) : (
              topItems.map((item, index) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8b968]/10 text-sm font-black text-[#e8b968]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{item.itemName}</p>
                    <p className="mt-0.5 text-xs text-white/30">
                      {item.quantitySold} sold ·{' '}
                      {formatDashboardPrice(item.revenueInPaise, currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
