'use client'

import {
  AlertTriangle,
  BellRing,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  IndianRupee,
  Loader2,
  LogOut,
  Phone,
  ReceiptText,
  RefreshCw,
  Search,
  Store,
  Table2,
  TimerReset,
  UserRound,
  UtensilsCrossed,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { loadSocketClient, type DashboardSocket } from '@/lib/socket-client'

type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'

type OrderItem = {
  id: string
  menuItemId: string
  name: string
  unitPriceInPaise: number
  quantity: number
  totalPriceInPaise: number
  instructions: string | null
  addons: Array<{
    id: string
    name: string
    priceInPaise: number
  }>
}

type Order = {
  id: string
  restaurantId: string
  branchId: string
  tableId: string
  tableNumber: string
  orderNumber: string
  customerName: string | null
  customerPhone: string | null
  status: OrderStatus
  orderType: 'DINE_IN' | 'TAKEAWAY'
  subtotalInPaise: number
  taxInPaise: number
  totalInPaise: number
  specialInstructions: string | null
  placedAt: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

type RestaurantMembership = {
  id: string
  role: string
  restaurant: {
    id: string
    name: string
    slug: string
    currency: string
  }
}

type CurrentUser = {
  id: string
  name: string
  email: string
  role: string
  memberships: RestaurantMembership[]
}

type Session = {
  accessToken: string
  user: CurrentUser
}

type TodayDashboard = {
  totalOrdersToday: number
  revenueTodayInPaise: number
  activeOrdersCount: number
  completedOrdersCount: number
  cancelledOrdersCount: number
  averageOrderValueInPaise: number
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  code?: string
}

type RealtimeOrderCreated = {
  orderId: string
  restaurantId: string
}

type RealtimeStatusUpdated = {
  orderId: string
  newStatus: OrderStatus
  updatedAt: string
}

type ConnectionState = 'connecting' | 'live' | 'offline'

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const sessionStorageKey = 'restaurant-dashboard-access-token'

const activeStatuses: OrderStatus[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY']
const allStatuses: OrderStatus[] = [...activeStatuses, 'SERVED', 'CANCELLED']

const statusConfig: Record<
  OrderStatus,
  {
    label: string
    shortLabel: string
    accent: string
    badge: string
    dot: string
    empty: string
  }
> = {
  PLACED: {
    label: 'New / Pending',
    shortLabel: 'Pending',
    accent: 'border-[#F2C572]/30',
    badge: 'bg-[#C17F3E]/10 text-[#F2C572]',
    dot: 'bg-[#F2C572]',
    empty: 'No new orders waiting.',
  },
  ACCEPTED: {
    label: 'Accepted',
    shortLabel: 'Accepted',
    accent: 'border-[#D4A853]/30',
    badge: 'bg-[#D4A853]/10 text-[#e6c87a]',
    dot: 'bg-[#D4A853]',
    empty: 'No accepted orders.',
  },
  PREPARING: {
    label: 'Preparing',
    shortLabel: 'Preparing',
    accent: 'border-[#C17F3E]/30',
    badge: 'bg-[#C17F3E]/10 text-[#e6ad75]',
    dot: 'bg-[#C17F3E]',
    empty: 'The kitchen queue is clear.',
  },
  READY: {
    label: 'Ready',
    shortLabel: 'Ready',
    accent: 'border-[#7B9E6B]/35',
    badge: 'bg-[#7B9E6B]/15 text-[#b9d5b2]',
    dot: 'bg-[#7B9E6B]',
    empty: 'No orders waiting to be served.',
  },
  SERVED: {
    label: 'Served / Completed',
    shortLabel: 'Completed',
    accent: 'border-zinc-400/20',
    badge: 'bg-white/[0.06] text-white/55',
    dot: 'bg-white/35',
    empty: 'No completed orders yet.',
  },
  CANCELLED: {
    label: 'Rejected / Cancelled',
    shortLabel: 'Cancelled',
    accent: 'border-rose-400/25',
    badge: 'bg-rose-400/10 text-rose-300',
    dot: 'bg-rose-400',
    empty: 'No rejected orders.',
  },
}

const nextActions: Record<
  OrderStatus,
  Array<{
    status: OrderStatus
    label: string
    tone: 'primary' | 'success' | 'danger'
  }>
> = {
  PLACED: [
    { status: 'ACCEPTED', label: 'Accept order', tone: 'primary' },
    { status: 'CANCELLED', label: 'Reject', tone: 'danger' },
  ],
  ACCEPTED: [
    { status: 'PREPARING', label: 'Start preparing', tone: 'primary' },
    { status: 'CANCELLED', label: 'Cancel', tone: 'danger' },
  ],
  PREPARING: [{ status: 'READY', label: 'Mark ready', tone: 'success' }],
  READY: [{ status: 'SERVED', label: 'Mark served', tone: 'success' }],
  SERVED: [],
  CANCELLED: [],
}

const actionTone = {
  primary: 'bg-[#F2C572] text-[#2C1810] hover:bg-[#f6d28a]',
  success: 'bg-[#7B9E6B] text-[#15231d] hover:bg-[#91b181]',
  danger: 'border border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
}

const formatPrice = (priceInPaise: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100)

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))

const isToday = (value: string) => {
  const date = new Date(value)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

const apiRequest = async <T,>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> => {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })
  const body = (await response.json()) as ApiEnvelope<T>

  if (!response.ok) {
    throw new Error(body.message || 'Request failed')
  }

  return body.data
}

const upsertOrder = (orders: Order[], order: Order) =>
  [order, ...orders.filter((current) => current.id !== order.id)].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )

function LoginPanel({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) {
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const loginData = await apiRequest<{
        accessToken: string
      }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const meData = await apiRequest<{ user: CurrentUser }>('/api/v1/auth/me', {
        token: loginData.accessToken,
      })

      if (meData.user.memberships.length === 0) {
        throw new Error('This account does not have access to a restaurant.')
      }

      localStorage.setItem(sessionStorageKey, loginData.accessToken)
      onAuthenticated({
        accessToken: loginData.accessToken,
        user: meData.user,
      })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#160B07] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#C17F3E]/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#7B9E6B]/10 blur-[130px]" />
      </div>
      <section className="relative w-full max-w-md rounded-[1.8rem] border border-white/10 bg-[#111a16]/95 p-6 shadow-2xl sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2C572] text-[#2C1810]">
          <ChefHat size={28} strokeWidth={2.5} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[#F2C572]">
          Tavero Partner
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Live orders dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-white/45">
          Sign in with an owner, manager, kitchen, or staff account to view the live order queue.
        </p>

        <form className="mt-7 space-y-4" onSubmit={login}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-white/45">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="tavero-input-dark min-h-[3.25rem] text-base"
              placeholder="owner@cafe.com"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-white/45">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="tavero-input-dark min-h-[3.25rem] text-base"
              placeholder="Your password"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="tavero-button-primary min-h-14 w-full disabled:opacity-60"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Store size={20} />}
            {submitting ? 'Signing in…' : 'Open dashboard'}
          </button>
        </form>
      </section>
    </main>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string | number
  detail: string
  tone: string
}) {
  return (
    <article className="tavero-hover-lift rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-4 shadow-lg">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/75">{label}</p>
      <p className="mt-1 text-xs text-white/28">{detail}</p>
    </article>
  )
}

function OrderCard({
  order,
  isNew,
  isUpdating,
  canUpdateStatus,
  currency,
  onStatusChange,
}: {
  order: Order
  isNew: boolean
  isUpdating: boolean
  canUpdateStatus: boolean
  currency: string
  onStatusChange: (order: Order, nextStatus: OrderStatus) => void
}) {
  const config = statusConfig[order.status]
  const actions = canUpdateStatus ? nextActions[order.status] : []
  const isTerminal = order.status === 'SERVED' || order.status === 'CANCELLED'

  return (
    <article
      className={`relative overflow-hidden rounded-[1.6rem] border bg-[#111a16] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition ${config.accent} ${
        isNew ? 'ring-2 ring-[#F2C572]/70' : ''
      }`}
    >
      {isNew && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#F2C572] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
          <BellRing size={11} />
          New
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pr-14">
        <div>
          <p className="text-lg font-black text-white">{order.orderNumber}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/35">
            <span className="inline-flex items-center gap-1">
              <Table2 size={13} className="text-[#F2C572]" />
              Table {order.tableNumber}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} />
              {formatTime(order.createdAt)}
            </span>
          </div>
        </div>
        {!isNew && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${config.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.shortLabel}
          </span>
        )}
      </div>

      {(order.customerName || order.customerPhone) && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 rounded-xl bg-black/20 p-3 text-xs text-white/45">
          {order.customerName && (
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} />
              {order.customerName}
            </span>
          )}
          {order.customerPhone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} />
              {order.customerPhone}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80">
                <span className="mr-2 text-[#F2C572]">{item.quantity}×</span>
                {item.name}
              </p>
              {item.addons.length > 0 && (
                <p className="mt-0.5 text-xs text-white/25">
                  {item.addons.map((addon) => addon.name).join(', ')}
                </p>
              )}
              {item.instructions && (
                <p className="mt-1 text-xs italic text-white/35">{item.instructions}</p>
              )}
            </div>
            <p className="shrink-0 text-sm font-bold text-white/55">
              {formatPrice(item.totalPriceInPaise, currency)}
            </p>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="mt-4 rounded-xl border border-[#C17F3E]/20 bg-[#C17F3E]/[0.07] p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#F2C572]">
            <AlertTriangle size={12} />
            Special instruction
          </p>
          <p className="mt-1.5 text-sm leading-5 text-amber-100/80">{order.specialInstructions}</p>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between border-t border-white/[0.07] pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/25">
            Order total
          </p>
          <p className="mt-1 text-xl font-black text-white">
            {formatPrice(order.totalInPaise, currency)}
          </p>
        </div>
        {actions.length === 0 && isTerminal && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/35">
            {order.status === 'SERVED' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {order.status === 'SERVED' ? 'Completed' : 'Closed'}
          </span>
        )}
        {actions.length === 0 && !isTerminal && !canUpdateStatus && (
          <span className="text-xs font-bold text-white/25">View only</span>
        )}
      </div>

      {actions.length > 0 && (
        <div className={`mt-4 grid gap-2 ${actions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange(order, action.status)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition disabled:cursor-wait disabled:opacity-60 ${
                actionTone[action.tone]
              }`}
            >
              {isUpdating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : action.status === 'CANCELLED' ? (
                <X size={17} />
              ) : (
                <Check size={17} strokeWidth={3} />
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

function OrderLane({
  status,
  orders,
  newOrderIds,
  updatingOrderId,
  canUpdateStatus,
  currency,
  onStatusChange,
}: {
  status: OrderStatus
  orders: Order[]
  newOrderIds: Set<string>
  updatingOrderId: string | null
  canUpdateStatus: boolean
  currency: string
  onStatusChange: (order: Order, nextStatus: OrderStatus) => void
}) {
  const config = statusConfig[status]

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
          <h2 className="text-sm font-black text-white/80">{config.label}</h2>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/[0.06] px-2 text-xs font-black text-white/45">
          {orders.length}
        </span>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-9 text-center">
            <p className="text-sm text-white/25">{config.empty}</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newOrderIds.has(order.id)}
              isUpdating={updatingOrderId === order.id}
              canUpdateStatus={canUpdateStatus}
              currency={currency}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default function LiveOrdersDashboardPage() {
  const { session: shellSession, selectedRestaurantId: shellSelectedRestaurantId } = useDashboard()
  const [session, setSession] = useState<Session | null>(null)
  const [restoringSession, setRestoringSession] = useState(true)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const selectedMembership = session?.user.memberships.find(
    (membership) => membership.restaurant.id === selectedRestaurantId,
  )
  const currency = selectedMembership?.restaurant.currency ?? 'INR'
  const canUpdateStatus = ['OWNER', 'MANAGER', 'KITCHEN'].includes(
    selectedMembership?.role ?? session?.user.role ?? '',
  )

  useEffect(() => {
    setSession(shellSession)
    setRestoringSession(false)
  }, [shellSession])

  useEffect(() => {
    if (!shellSelectedRestaurantId) {
      return
    }
    setSelectedRestaurantId(shellSelectedRestaurantId)
  }, [shellSelectedRestaurantId])

  const loadOrders = useCallback(
    async (quiet = false) => {
      if (!session || !selectedRestaurantId) {
        return
      }

      try {
        quiet ? setRefreshing(true) : setLoading(true)
        setError('')

        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        const query = new URLSearchParams({
          limit: '100',
          dateFrom: start.toISOString(),
          dateTo: end.toISOString(),
        })

        const [ordersData, dashboardData] = await Promise.all([
          apiRequest<{
            orders: Order[]
          }>(`/api/v1/restaurants/${selectedRestaurantId}/orders?${query.toString()}`, {
            token: session.accessToken,
          }),
          apiRequest<TodayDashboard>(
            `/api/v1/restaurants/${selectedRestaurantId}/dashboard/today`,
            {
              token: session.accessToken,
            },
          ).catch(() => null),
        ])

        setOrders(
          [...ordersData.orders].sort(
            (left, right) =>
              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          ),
        )
        setDashboard(dashboardData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedRestaurantId, session],
  )

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (!session || !selectedRestaurantId) {
      return
    }

    let socket: DashboardSocket | null = null
    let disposed = false

    const connect = async () => {
      try {
        setConnectionState('connecting')
        const io = await loadSocketClient(apiBaseUrl)
        if (disposed) {
          return
        }

        socket = io(apiBaseUrl, {
          auth: { token: session.accessToken },
          transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
          setConnectionState('live')
          socket?.emit('restaurant:join', { restaurantId: selectedRestaurantId })
        })
        socket.on('disconnect', () => setConnectionState('offline'))
        socket.on('connect_error', () => setConnectionState('offline'))
        socket.on('socket:error', () => setConnectionState('offline'))
        socket.on('order:created', (rawPayload) => {
          const payload = rawPayload as RealtimeOrderCreated | undefined
          if (!payload || payload.restaurantId !== selectedRestaurantId) {
            return
          }

          void apiRequest<{ order: Order }>(`/api/v1/orders/${payload.orderId}`, {
            token: session.accessToken,
          })
            .then(({ order }) => {
              setOrders((current) => upsertOrder(current, order))
              setNewOrderIds((current) => new Set(current).add(order.id))
              window.setTimeout(() => {
                setNewOrderIds((current) => {
                  const next = new Set(current)
                  next.delete(order.id)
                  return next
                })
              }, 15000)
              void loadOrders(true)
            })
            .catch(() => void loadOrders(true))
        })
        socket.on('order:status_updated', (rawPayload) => {
          const payload = rawPayload as RealtimeStatusUpdated | undefined
          if (!payload) {
            return
          }
          setOrders((current) =>
            current.map((order) =>
              order.id === payload.orderId
                ? { ...order, status: payload.newStatus, updatedAt: payload.updatedAt }
                : order,
            ),
          )
        })
      } catch {
        setConnectionState('offline')
      }
    }

    void connect()
    const refreshInterval = window.setInterval(() => void loadOrders(true), 30000)

    return () => {
      disposed = true
      window.clearInterval(refreshInterval)
      socket?.disconnect()
    }
  }, [loadOrders, selectedRestaurantId, session])

  const updateStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (!session || updatingOrderId) {
      return
    }

    try {
      setUpdatingOrderId(order.id)
      setError('')
      const data = await apiRequest<{ order: Order }>(`/api/v1/orders/${order.id}/status`, {
        method: 'PATCH',
        token: session.accessToken,
        body: JSON.stringify({ status: nextStatus }),
      })
      setOrders((current) => upsertOrder(current, data.order))
      setNewOrderIds((current) => {
        const next = new Set(current)
        next.delete(order.id)
        return next
      })
      void loadOrders(true)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update order.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false
      }
      if (!query) {
        return true
      }

      return [order.orderNumber, order.tableNumber, order.customerName, order.customerPhone].some(
        (value) => value?.toLowerCase().includes(query),
      )
    })
  }, [orders, search, statusFilter])

  const ordersByStatus = useMemo(
    () =>
      allStatuses.reduce(
        (grouped, status) => {
          grouped[status] = filteredOrders.filter((order) => order.status === status)
          return grouped
        },
        {} as Record<OrderStatus, Order[]>,
      ),
    [filteredOrders],
  )

  const fallbackSummary = useMemo(() => {
    const todayOrders = orders.filter((order) => isToday(order.createdAt))
    return {
      totalOrdersToday: todayOrders.length,
      revenueTodayInPaise: todayOrders
        .filter((order) => order.status !== 'CANCELLED')
        .reduce((total, order) => total + order.totalInPaise, 0),
      activeOrdersCount: todayOrders.filter((order) => activeStatuses.includes(order.status))
        .length,
      completedOrdersCount: todayOrders.filter((order) => order.status === 'SERVED').length,
      cancelledOrdersCount: todayOrders.filter((order) => order.status === 'CANCELLED').length,
      averageOrderValueInPaise: 0,
    }
  }, [orders])

  const summary = dashboard ?? fallbackSummary
  const pendingCount = orders.filter((order) => order.status === 'PLACED').length
  const preparingCount = orders.filter((order) => order.status === 'PREPARING').length

  const logout = () => {
    localStorage.removeItem(sessionStorageKey)
    setSession(null)
    setOrders([])
    setDashboard(null)
    setSelectedRestaurantId('')
  }

  if (restoringSession) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#09100d] text-white/40"
        aria-label="Restoring dashboard session"
        aria-busy="true"
      >
        <Loader2 size={28} className="animate-spin text-[#F2C572]" />
      </main>
    )
  }

  if (!session) {
    return <LoginPanel onAuthenticated={setSession} />
  }

  return (
    <div className="text-white">
      <header className="hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2C572] text-[#2C1810]">
              <UtensilsCrossed size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black">
                {selectedMembership?.restaurant.name ?? 'Restaurant dashboard'}
              </p>
              <p className="text-xs text-white/30">Live order operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:flex ${
                connectionState === 'live'
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : connectionState === 'connecting'
                    ? 'bg-[#C17F3E]/10 text-[#F2C572]'
                    : 'bg-rose-400/10 text-rose-300'
              }`}
            >
              {connectionState === 'live' ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connectionState === 'live'
                ? 'Live'
                : connectionState === 'connecting'
                  ? 'Connecting'
                  : 'Polling'}
            </div>
            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={refreshing}
              aria-label="Refresh orders"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40 transition hover:border-[#F2C572]/25 hover:text-white"
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40 transition hover:text-rose-300"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div>
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.23em] text-[#F2C572]">
              Today&apos;s service
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
              Order command center
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Accept new QR orders, move the kitchen queue forward, and get ready plates to the
              right table.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold ${
                connectionState === 'live'
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : connectionState === 'connecting'
                    ? 'bg-[#C17F3E]/10 text-[#F2C572]'
                    : 'bg-rose-400/10 text-rose-300'
              }`}
            >
              {connectionState === 'live' ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connectionState === 'live'
                ? 'Live'
                : connectionState === 'connecting'
                  ? 'Connecting'
                  : 'Polling'}
            </div>
            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={refreshing}
              aria-label="Refresh orders"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/40 transition hover:border-[#F2C572]/25 hover:text-white"
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {session.user.memberships.length > 1 && (
            <label className="hidden min-w-64">
              <span className="mb-2 block text-xs font-bold text-white/35">Restaurant</span>
              <select
                value={selectedRestaurantId}
                onChange={(event) => setSelectedRestaurantId(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#111a16] px-4 font-bold text-white"
              >
                {session.user.memberships.map((membership) => (
                  <option key={membership.id} value={membership.restaurant.id}>
                    {membership.restaurant.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <SummaryCard
            icon={<ReceiptText size={19} />}
            label="Today's orders"
            value={summary.totalOrdersToday}
            detail="All orders placed today"
            tone="bg-white/[0.06] text-white/70"
          />
          <SummaryCard
            icon={<TimerReset size={19} />}
            label="Pending"
            value={pendingCount}
            detail="Waiting for acceptance"
            tone="bg-[#C17F3E]/10 text-[#F2C572]"
          />
          <SummaryCard
            icon={<ChefHat size={19} />}
            label="Preparing"
            value={preparingCount}
            detail="Currently in kitchen"
            tone="bg-[#D4A853]/10 text-[#e6c87a]"
          />
          <SummaryCard
            icon={<CheckCircle2 size={19} />}
            label="Completed"
            value={summary.completedOrdersCount}
            detail="Served today"
            tone="bg-[#7B9E6B]/15 text-[#b9d5b2]"
          />
          <SummaryCard
            icon={<IndianRupee size={19} />}
            label="Today's revenue"
            value={formatPrice(summary.revenueTodayInPaise, currency)}
            detail="Excludes cancelled orders"
            tone="bg-[#F2C572]/10 text-[#F2C572]"
          />
        </section>

        <section className="mt-6 rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-3 shadow-xl shadow-black/10 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1 xl:max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, table, or customer"
                className="tavero-input-dark min-h-11 rounded-xl pl-10 pr-4 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(['ALL', ...allStatuses] as const).map((status) => {
                const active = statusFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`min-h-10 shrink-0 rounded-xl px-3.5 text-xs font-black transition ${
                      active
                        ? 'bg-[#F2C572] text-[#2C1810]'
                        : 'border border-white/[0.07] bg-white/[0.03] text-white/35 hover:border-[#F2C572]/20 hover:text-white'
                    }`}
                  >
                    {status === 'ALL' ? 'All orders' : statusConfig[status].shortLabel}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Dashboard action failed</p>
              <p className="mt-1 text-rose-200/70">{error}</p>
            </div>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        {loading ? (
          <section
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            aria-label="Loading orders"
            aria-busy="true"
          >
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-72 rounded-2xl" />
            ))}
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(statusFilter === 'ALL'
                ? activeStatuses
                : activeStatuses.filter((status) => status === statusFilter)
              ).map((status) => (
                <OrderLane
                  key={status}
                  status={status}
                  orders={ordersByStatus[status]}
                  newOrderIds={newOrderIds}
                  updatingOrderId={updatingOrderId}
                  canUpdateStatus={canUpdateStatus}
                  currency={currency}
                  onStatusChange={(order, nextStatus) => void updateStatus(order, nextStatus)}
                />
              ))}
            </section>

            {(statusFilter === 'ALL' ||
              statusFilter === 'SERVED' ||
              statusFilter === 'CANCELLED') && (
              <section className="mt-8 border-t border-white/[0.07] pt-7">
                <div className="mb-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/25">
                    Closed orders
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white/75">
                    Completed and cancelled
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {(statusFilter === 'ALL'
                    ? (['SERVED', 'CANCELLED'] as OrderStatus[])
                    : ([statusFilter] as OrderStatus[])
                  ).map((status) => (
                    <OrderLane
                      key={status}
                      status={status}
                      orders={ordersByStatus[status]}
                      newOrderIds={newOrderIds}
                      updatingOrderId={updatingOrderId}
                      canUpdateStatus={canUpdateStatus}
                      currency={currency}
                      onStatusChange={(order, nextStatus) => void updateStatus(order, nextStatus)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
