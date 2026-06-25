'use client'

import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminProvider'
import { dashboardApiRequest } from '@/lib/dashboard-api'
import { captureProductEvent } from '@/lib/product-analytics'

type AdminCafe = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  imageUrl: string | null
  isActive: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED'

export default function AdminCafesPage() {
  const { session } = useAdmin()
  const [cafes, setCafes] = useState<AdminCafe[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dashboardApiRequest<{ cafes: AdminCafe[] }>('/api/v1/admin/cafes', {
        token: session.accessToken,
      })
      setCafes(data.cafes)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load cafes.')
    } finally {
      setLoading(false)
    }
  }, [session.accessToken])

  useEffect(() => {
    captureProductEvent('admin_cafes_viewed')
    void load()
  }, [load])

  const updateCafe = async (cafe: AdminCafe, endpoint: 'approval' | 'status', value: boolean) => {
    try {
      setUpdatingId(cafe.id)
      setError('')
      setNotice('')
      await dashboardApiRequest(`/api/v1/admin/cafes/${cafe.id}/${endpoint}`, {
        method: 'PATCH',
        token: session.accessToken,
        body: JSON.stringify(endpoint === 'approval' ? { isApproved: value } : { isActive: value }),
      })
      setCafes((current) =>
        current.map((item) =>
          item.id === cafe.id
            ? { ...item, [endpoint === 'approval' ? 'isApproved' : 'isActive']: value }
            : item,
        ),
      )
      setNotice(
        endpoint === 'approval'
          ? `${cafe.name} is now ${value ? 'approved' : 'unapproved'}.`
          : `${cafe.name} is now ${value ? 'active' : 'suspended'}.`,
      )
      captureProductEvent(
        endpoint === 'approval' ? 'admin_cafe_approval_changed' : 'admin_cafe_status_changed',
        { cafe_id: cafe.id, enabled: value },
      )
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update cafe.')
    } finally {
      setUpdatingId('')
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return cafes.filter((cafe) => {
      if (filter === 'PENDING' && cafe.isApproved) return false
      if (filter === 'APPROVED' && !cafe.isApproved) return false
      if (filter === 'SUSPENDED' && cafe.isActive) return false
      if (!query) return true
      return [cafe.name, cafe.slug, cafe.city, cafe.owner.name, cafe.owner.email].some((value) =>
        value?.toLowerCase().includes(query),
      )
    })
  }, [cafes, filter, search])

  const counts = {
    total: cafes.length,
    pending: cafes.filter((cafe) => !cafe.isApproved).length,
    live: cafes.filter((cafe) => cafe.isApproved && cafe.isActive).length,
    suspended: cafes.filter((cafe) => !cafe.isActive).length,
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">Marketplace cafes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Approve public listings and suspend cafe access without exposing owner controls to the
            public marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-white/60"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total cafes', counts.total, Store, 'text-white'],
          ['Pending approval', counts.pending, ShieldX, 'text-amber-300'],
          ['Publicly live', counts.live, ShieldCheck, 'text-emerald-300'],
          ['Suspended', counts.suspended, PauseCircle, 'text-rose-300'],
        ].map(([label, value, Icon, tone]) => {
          const SummaryIcon = Icon as typeof Store
          return (
            <article
              key={label as string}
              className="rounded-[1.5rem] border border-white/[0.07] bg-[#0e1520] p-5"
            >
              <SummaryIcon size={19} className={tone as string} />
              <p className="mt-5 text-3xl font-black">{value as number}</p>
              <p className="mt-1 text-xs font-bold text-white/35">{label as string}</p>
            </article>
          )
        })}
      </section>

      <section className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/[0.07] bg-[#0e1520] p-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cafe, slug, city, or owner"
            className="min-h-12 w-full rounded-xl border border-white/[0.07] bg-black/20 pl-11 pr-4 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'SUSPENDED'] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-12 shrink-0 rounded-xl px-4 text-xs font-black ${
                filter === item
                  ? 'bg-cyan-300 text-[#071019]'
                  : 'border border-white/10 text-white/45'
              }`}
            >
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      {notice && (
        <p className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-400/10 p-4 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-72 items-center justify-center text-cyan-300">
          <Loader2 size={27} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 px-6 py-16 text-center text-white/35">
          No cafes match this view.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.map((cafe) => {
            const updating = updatingId === cafe.id
            return (
              <article
                key={cafe.id}
                className="overflow-hidden rounded-[1.7rem] border border-white/[0.07] bg-[#0e1520]"
              >
                <div className="grid sm:grid-cols-[10rem_1fr]">
                  <div className="min-h-40 bg-[#152231]">
                    {cafe.imageUrl ? (
                      <div
                        className="h-full min-h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url("${cafe.imageUrl}")` }}
                        role="img"
                        aria-label={cafe.name}
                      />
                    ) : (
                      <div className="flex h-full min-h-40 items-center justify-center text-cyan-300/35">
                        <Store size={38} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-black">{cafe.name}</h2>
                        <p className="mt-1 font-mono text-[11px] text-white/25">{cafe.slug}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                            cafe.isApproved
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {cafe.isApproved ? 'APPROVED' : 'PENDING'}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                            cafe.isActive
                              ? 'bg-cyan-400/10 text-cyan-300'
                              : 'bg-rose-400/10 text-rose-300'
                          }`}
                        >
                          {cafe.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </div>
                    </div>
                    {(cafe.city || cafe.address) && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
                        <MapPin size={13} />
                        {[cafe.address, cafe.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-white/30">
                      Owner: <span className="text-white/55">{cafe.owner.name}</span> ·{' '}
                      {cafe.owner.email}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void updateCafe(cafe, 'approval', !cafe.isApproved)}
                        className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black disabled:opacity-50 ${
                          cafe.isApproved
                            ? 'border border-amber-300/20 text-amber-200'
                            : 'bg-emerald-300 text-emerald-950'
                        }`}
                      >
                        {updating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {cafe.isApproved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void updateCafe(cafe, 'status', !cafe.isActive)}
                        className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black disabled:opacity-50 ${
                          cafe.isActive
                            ? 'border border-rose-300/20 text-rose-200'
                            : 'bg-cyan-300 text-[#071019]'
                        }`}
                      >
                        {cafe.isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                        {cafe.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                      <Link
                        href={`/cafe/${cafe.slug}`}
                        target="_blank"
                        className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/45"
                      >
                        Public page <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
