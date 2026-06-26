'use client'

import {
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock3,
  Leaf,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TaveroBrand } from '@/components/brand/TaveroBrand'
import { captureProductEvent } from '@/lib/product-analytics'

type Cafe = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  imageUrl: string | null
  logoUrl: string | null
  currency: string
}

type MenuItem = {
  id: string
  branchId: string | null
  name: string
  description: string | null
  priceInPaise: number
  imageUrl: string | null
  foodType: string
  isRecommended: boolean
  preparationTimeMinutes: number | null
}

type MenuCategory = {
  id: string
  branchId: string | null
  name: string
  description: string | null
  items: MenuItem[]
}

type CafeTable = {
  id: string
  tableNumber: string
  tableLabel: string | null
  branch: {
    id: string
    name: string
  }
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

type OrderConfirmation = {
  orderNumber: string
  tableNumber: string
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const formatPrice = (priceInPaise: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100)

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `cafe-${crypto.randomUUID()}`
  }

  return `cafe-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const getFoodLabel = (foodType: string) => {
  switch (foodType) {
    case 'NON_VEG':
      return { label: 'Non-veg', dotClass: 'bg-rose-500', textClass: 'text-rose-300' }
    case 'EGG':
      return { label: 'Contains egg', dotClass: 'bg-amber-400', textClass: 'text-amber-300' }
    case 'BEVERAGE':
      return { label: 'Beverage', dotClass: 'bg-sky-400', textClass: 'text-sky-300' }
    case 'JAIN':
      return { label: 'Jain', dotClass: 'bg-emerald-400', textClass: 'text-emerald-300' }
    default:
      return { label: 'Veg', dotClass: 'bg-emerald-500', textClass: 'text-emerald-300' }
  }
}

function LoadingState() {
  return (
    <main
      className="min-h-screen bg-[#160B07] text-white"
      aria-busy="true"
      aria-label="Loading cafe menu"
    >
      <div className="mx-auto max-w-5xl px-4 pb-32 pt-4 sm:px-6">
        <div className="skeleton h-72 rounded-[2rem]" />
        <div className="relative -mt-10 mx-3 space-y-4 rounded-[1.75rem] border border-white/10 bg-[#211510] p-5">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-11 w-3/4 rounded-xl" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-2/3 rounded-full" />
        </div>
        <div className="mt-8 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton h-11 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton h-40 rounded-3xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

function PageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#160B07] px-6 text-white">
      <div className="w-full max-w-sm rounded-[1.8rem] border border-white/10 bg-[#211510] p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C17F3E]/10 text-[#F2C572]">
          <Store size={30} />
        </div>
        <h1 className="mt-5 text-2xl font-black">Couldn&apos;t load this cafe</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="tavero-button-primary mt-6 w-full"
        >
          <RefreshCw size={18} />
          Try again
        </button>
      </div>
    </main>
  )
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Add item"
        className="flex min-h-12 min-w-[5.5rem] items-center justify-center gap-2 rounded-2xl border border-[#F2C572]/40 bg-[#C17F3E]/10 px-4 text-sm font-extrabold text-[#F2C572] transition hover:bg-[#C17F3E]/15 active:scale-95"
      >
        Add
        <Plus size={17} strokeWidth={3} />
      </button>
    )
  }

  return (
    <div className="flex min-h-12 items-center rounded-2xl border border-[#F2C572]/40 bg-[#C17F3E]/10">
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Remove one item"
        className="flex h-12 w-12 items-center justify-center rounded-l-2xl text-[#F2C572] transition hover:bg-[#C17F3E]/10 active:bg-[#C17F3E]/20"
      >
        <Minus size={18} strokeWidth={3} />
      </button>
      <span className="min-w-8 text-center text-sm font-black text-white" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Add one item"
        className="flex h-12 w-12 items-center justify-center rounded-r-2xl text-[#F2C572] transition hover:bg-[#C17F3E]/10 active:bg-[#C17F3E]/20"
      >
        <Plus size={18} strokeWidth={3} />
      </button>
    </div>
  )
}

export default function CafeMenuPage({ params }: { params: { slug: string } }) {
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [tables, setTables] = useState<CafeTable[]>([])
  const [selectedTableId, setSelectedTableId] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstruction, setSpecialInstruction] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [orderError, setOrderError] = useState('')
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const idempotencyKeyRef = useRef(createIdempotencyKey())
  const orderStartedTrackedRef = useRef(false)
  const checkoutRef = useRef<HTMLElement>(null)
  const confirmationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadCafe = async () => {
      try {
        setLoading(true)
        setLoadError('')
        const [menuResponse, tablesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/menu`, {
            signal: controller.signal,
          }),
          fetch(`${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/tables`, {
            signal: controller.signal,
          }),
        ])

        const menuBody = (await menuResponse.json()) as ApiEnvelope<{
          cafe: Cafe
          categories: MenuCategory[]
        }>
        const tablesBody = (await tablesResponse.json()) as ApiEnvelope<{
          tables: CafeTable[]
        }>

        if (!menuResponse.ok || !tablesResponse.ok) {
          throw new Error(
            menuBody.message || tablesBody.message || 'This cafe is unavailable right now.',
          )
        }

        setCafe(menuBody.data.cafe)
        setCategories(menuBody.data.categories)
        setTables(tablesBody.data.tables)
        captureProductEvent('qr_menu_viewed', { cafe_id: menuBody.data.cafe.id })
        setSelectedTableId((current) =>
          tablesBody.data.tables.some((table) => table.id === current)
            ? current
            : (tablesBody.data.tables[0]?.id ?? ''),
        )
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setLoadError(error instanceof Error ? error.message : 'Unable to load the cafe.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCafe()
    return () => controller.abort()
  }, [params.slug, reloadKey])

  useEffect(() => {
    if (!orderConfirmation) {
      return
    }

    confirmationRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [orderConfirmation])

  const selectedTable = tables.find((table) => table.id === selectedTableId)
  const visibleCategories = useMemo(() => {
    if (!selectedTable) {
      return categories
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => item.branchId === null || item.branchId === selectedTable.branch.id,
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [categories, selectedTable])

  const visibleItems = useMemo(
    () => visibleCategories.flatMap((category) => category.items),
    [visibleCategories],
  )
  const selectedItems = visibleItems.filter((item) => (quantities[item.id] ?? 0) > 0)
  const itemCount = selectedItems.reduce((total, item) => total + (quantities[item.id] ?? 0), 0)
  const subtotalInPaise = selectedItems.reduce(
    (total, item) => total + item.priceInPaise * (quantities[item.id] ?? 0),
    0,
  )

  const changeQuantity = (itemId: string, amount: number) => {
    if (amount > 0 && !orderStartedTrackedRef.current) {
      orderStartedTrackedRef.current = true
      captureProductEvent('order_started', { cafe_id: cafe?.id })
    }
    setOrderConfirmation(null)
    setOrderError('')
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, Math.min(99, (current[itemId] ?? 0) + amount)),
    }))
  }

  const selectTable = (tableId: string) => {
    setSelectedTableId(tableId)
    setOrderConfirmation(null)
    setOrderError('')
  }

  const placeOrder = async () => {
    if (submitting) {
      return
    }
    if (!selectedTable) {
      setOrderError('Select an available table before placing your order.')
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (selectedItems.length === 0) {
      setOrderError('Add at least one item to your order.')
      return
    }

    try {
      setSubmitting(true)
      setOrderError('')
      setOrderConfirmation(null)
      const response = await fetch(
        `${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKeyRef.current,
          },
          body: JSON.stringify({
            tableNumber: selectedTable.tableNumber,
            customerName: customerName.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
            specialInstruction: specialInstruction.trim() || undefined,
            items: selectedItems.map((item) => ({
              menuItemId: item.id,
              quantity: quantities[item.id],
            })),
          }),
        },
      )
      const body = (await response.json()) as ApiEnvelope<{
        order: { orderNumber: string }
      }>

      if (!response.ok) {
        throw new Error(body.message || 'Unable to place the order.')
      }

      setOrderConfirmation({
        orderNumber: body.data.order.orderNumber,
        tableNumber: selectedTable.tableNumber,
      })
      setQuantities({})
      setSpecialInstruction('')
      captureProductEvent('order_placed', {
        cafe_id: cafe?.id,
        item_count: itemCount,
      })
      idempotencyKeyRef.current = createIdempotencyKey()
      orderStartedTrackedRef.current = false
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Unable to place the order.')
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (loadError || !cafe) {
    return (
      <PageError
        message={loadError || 'This cafe could not be found.'}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    )
  }

  const location = [cafe.address, cafe.city].filter(Boolean).join(', ')
  const heroStyle = cafe.imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(11,9,8,0.08), rgba(11,9,8,0.94)), url("${cafe.imageUrl}")`,
      }
    : undefined

  return (
    <main className="min-h-screen bg-[#160B07] pb-36 text-[#FAF7F2] selection:bg-[#C17F3E]/30 sm:pb-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-48 h-80 w-80 rounded-full bg-[#C17F3E]/10 blur-[100px]" />
        <div className="absolute -right-40 top-[42rem] h-96 w-96 rounded-full bg-[#7B9E6B]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="relative min-h-[20rem] overflow-hidden sm:mx-4 sm:mt-4 sm:rounded-[2.25rem]">
          <div className="absolute inset-0 bg-cover bg-center" style={heroStyle}>
            {!cafe.imageUrl && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(245,158,11,0.28),transparent_35%),linear-gradient(145deg,#302018,#110d0b_70%)]" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#160B07] via-[#160B07]/55 to-black/10" />
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/" aria-label="Tavero home" className="text-white">
              <TaveroBrand compact inverse />
            </Link>
            <Link
              href="/cafes"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs font-black text-white/70 backdrop-blur-xl transition hover:border-[#F2C572]/30 hover:text-white"
            >
              Explore cafes
            </Link>
          </div>
          <div className="relative flex min-h-[20rem] flex-col justify-end px-4 pb-8 pt-24 sm:px-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-xl backdrop-blur-xl">
                {cafe.logoUrl ? (
                  <div
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${cafe.logoUrl}")` }}
                  />
                ) : (
                  <ChefHat className="text-[#F2C572]" size={28} />
                )}
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-xl">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Open for table orders
              </div>
            </div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#F2C572]">
              Scan · Pick a table · Order
            </p>
            <h1 className="font-display text-4xl font-black leading-none sm:text-6xl">
              {cafe.name}
            </h1>
            {cafe.description && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                {cafe.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-zinc-300 sm:text-sm">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#C17F3E]" />
                  {location}
                </span>
              )}
              {cafe.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[#C17F3E]" />
                  {cafe.phone}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6">
          {orderConfirmation && (
            <section
              ref={confirmationRef}
              className="relative -mt-3 mb-6 overflow-hidden rounded-[1.75rem] border border-emerald-300/20 bg-emerald-950/80 p-5 shadow-2xl backdrop-blur-xl sm:mx-4 sm:p-6"
              aria-live="polite"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950">
                  <Check size={26} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-100">Order sent to the kitchen</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-200/75">
                    <span className="font-bold text-emerald-100">
                      {orderConfirmation.orderNumber}
                    </span>{' '}
                    is confirmed for table {orderConfirmation.tableNumber}. We&apos;ll prepare it
                    fresh.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="relative -mt-4 rounded-[1.75rem] border border-white/10 bg-[#211510]/95 p-4 shadow-2xl backdrop-blur-xl sm:mx-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C17F3E]/10 text-[#F2C572]">
                <UtensilsCrossed size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-base font-black" htmlFor="table">
                  Where are you seated?
                </label>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                  Choose carefully so the team brings your order to the right table.
                </p>
              </div>
            </div>

            {tables.length > 0 ? (
              <div className="relative mt-4">
                <select
                  id="table"
                  value={selectedTableId}
                  onChange={(event) => selectTable(event.target.value)}
                  className="tavero-input-dark min-h-14 appearance-none pr-12 text-base font-bold shadow-inner"
                >
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.tableLabel ?? `Table ${table.tableNumber}`} · {table.branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#F2C572]"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-500/5 p-4">
                <p className="font-bold text-rose-200">No tables available</p>
                <p className="mt-1 text-sm leading-6 text-rose-200/60">
                  Please ask a staff member before placing an order.
                </p>
              </div>
            )}
          </section>

          {visibleCategories.length > 0 && (
            <nav
              className="sticky top-0 z-30 -mx-4 mt-5 border-y border-white/[0.06] bg-[#160B07]/90 px-4 py-3 backdrop-blur-2xl sm:mx-0 sm:rounded-2xl sm:border"
              aria-label="Menu categories"
            >
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/65 transition hover:-translate-y-0.5 hover:border-[#F2C572]/40 hover:text-[#F2C572]"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </nav>
          )}

          <div className="mt-8 space-y-10">
            {visibleCategories.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-500">
                  <ChefHat size={30} />
                </div>
                <h2 className="mt-5 text-xl font-black">The menu is taking a breather</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                  There are no available items for this table right now. Please check with the cafe
                  team.
                </p>
              </section>
            ) : (
              visibleCategories.map((category) => (
                <section key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400/80">
                        On the menu
                      </p>
                      <h2 className="mt-1 font-display text-3xl font-black">{category.name}</h2>
                      {category.description && (
                        <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-zinc-600">
                      {category.items.length} item
                      {category.items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {category.items.map((item) => {
                      const quantity = quantities[item.id] ?? 0
                      const food = getFoodLabel(item.foodType)

                      return (
                        <article
                          key={item.id}
                          className={`tavero-hover-lift relative overflow-hidden rounded-[1.75rem] border bg-[#211510] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${
                            quantity > 0 ? 'border-[#F2C572]/35' : 'border-white/[0.07]'
                          }`}
                        >
                          {item.imageUrl && (
                            <div
                              className="mb-4 aspect-[16/8] rounded-2xl bg-cover bg-center"
                              style={{ backgroundImage: `url("${item.imageUrl}")` }}
                              role="img"
                              aria-label={item.name}
                            />
                          )}
                          <div className="flex min-h-[8.5rem] flex-col">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                              <span
                                className={`inline-flex items-center gap-1.5 ${food.textClass}`}
                              >
                                <span className={`h-2 w-2 rounded-full ${food.dotClass}`} />
                                {food.label}
                              </span>
                              {item.isRecommended && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#C17F3E]/10 px-2 py-1 text-[#F2C572]">
                                  <Sparkles size={11} />
                                  Popular
                                </span>
                              )}
                              {item.preparationTimeMinutes && (
                                <span className="inline-flex items-center gap-1 text-zinc-500">
                                  <Clock3 size={12} />
                                  {item.preparationTimeMinutes} min
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-lg font-black leading-tight">{item.name}</h3>
                            {item.description && (
                              <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-zinc-500">
                                {item.description}
                              </p>
                            )}

                            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                              <p className="text-lg font-black text-[#F2C572]">
                                {formatPrice(item.priceInPaise, cafe.currency)}
                              </p>
                              <QuantityControl
                                quantity={quantity}
                                onDecrease={() => changeQuantity(item.id, -1)}
                                onIncrease={() => changeQuantity(item.id, 1)}
                              />
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          <section
            ref={checkoutRef}
            className="mt-12 overflow-hidden rounded-[1.8rem] border border-white/[0.08] bg-[#211510]"
          >
            <div className="border-b border-white/[0.07] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C17F3E]/10 text-[#F2C572]">
                  <Leaf size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-black">A few final details</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Optional, but helpful for the cafe team.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-zinc-400">Your name</span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Optional"
                    autoComplete="name"
                    maxLength={120}
                    className="min-h-[3.25rem] w-full rounded-2xl border border-white/[0.08] bg-[#0e0b0a] px-4 py-3.5 text-base text-white placeholder:text-zinc-700"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-zinc-400">Phone number</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Optional"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={30}
                    className="min-h-[3.25rem] w-full rounded-2xl border border-white/[0.08] bg-[#0e0b0a] px-4 py-3.5 text-base text-white placeholder:text-zinc-700"
                  />
                </label>
              </div>

              <label className="mt-3 block">
                <span className="mb-2 block text-xs font-bold text-zinc-400">
                  Special instruction
                </span>
                <textarea
                  value={specialInstruction}
                  onChange={(event) => setSpecialInstruction(event.target.value)}
                  placeholder="Allergies, spice preference, or serving notes…"
                  className="w-full resize-none rounded-2xl border border-white/[0.08] bg-[#0e0b0a] px-4 py-3.5 text-base text-white placeholder:text-zinc-700"
                  rows={3}
                  maxLength={1000}
                />
              </label>
            </div>

            <div className="p-5 sm:p-6">
              {selectedItems.length > 0 && (
                <div className="mb-5 rounded-2xl border border-white/[0.07] bg-[#0e0b0a] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-200">Your order</h3>
                    <span className="text-xs font-semibold text-zinc-600">
                      {itemCount} item{itemCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedItems.map((item) => {
                      const quantity = quantities[item.id] ?? 0

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-zinc-300">
                              {quantity} × {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-600">
                              {formatPrice(item.priceInPaise, cafe.currency)} each
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-black text-zinc-200">
                            {formatPrice(item.priceInPaise * quantity, cafe.currency)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Estimated subtotal
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {formatPrice(subtotalInPaise, cafe.currency)}
                  </p>
                </div>
                <div className="text-right text-xs leading-5 text-zinc-500">
                  <p>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                  <p>Final tax calculated by cafe</p>
                </div>
              </div>

              {orderError && (
                <div
                  className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-500/5 p-4 text-sm leading-6 text-rose-200"
                  role="alert"
                >
                  {orderError}
                </div>
              )}

              <button
                type="button"
                disabled={submitting || !selectedTable || selectedItems.length === 0}
                onClick={() => void placeOrder()}
                aria-busy={submitting}
                className="btn-glow mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-base font-black text-black transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending order…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Place order
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-zinc-600">
                Prices and final total are securely verified by the cafe.
              </p>
            </div>
          </section>
        </div>
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0908]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button
              type="button"
              onClick={() =>
                checkoutRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }
              aria-label="Review your order"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-amber-300">
                <ShoppingBag size={21} />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-black text-black">
                  {itemCount}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-zinc-500">
                  {selectedTable
                    ? (selectedTable.tableLabel ?? `Table ${selectedTable.tableNumber}`)
                    : 'Select a table'}
                </span>
                <span className="block truncate text-base font-black text-white">
                  {formatPrice(subtotalInPaise, cafe.currency)}
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={submitting || !selectedTable}
              onClick={() => void placeOrder()}
              aria-busy={submitting}
              className="flex min-h-12 min-w-[9rem] items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-black text-black transition active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Order now
                  <ChevronDown size={17} className="-rotate-90" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
