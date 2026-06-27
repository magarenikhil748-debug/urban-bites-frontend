'use client'

import { CheckCircle2, ClipboardList, Loader2, RefreshCw, Search, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminProvider'
import { dashboardApiRequest } from '@/lib/dashboard-api'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'REJECTED'

type EarlyAccessLead = {
  id: string
  cafeName: string
  ownerName: string
  contact: string
  location: string
  note: string | null
  status: LeadStatus
  source: string
  createdAt: string
  updatedAt: string
}

const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'REJECTED']

const statusTone: Record<LeadStatus, string> = {
  NEW: 'bg-sky-400/10 text-sky-200',
  CONTACTED: 'bg-amber-400/10 text-amber-200',
  QUALIFIED: 'bg-violet-400/10 text-violet-200',
  CONVERTED: 'bg-emerald-400/10 text-emerald-200',
  REJECTED: 'bg-rose-400/10 text-rose-200',
}

export default function AdminLeadsPage() {
  const { session } = useAdmin()
  const [leads, setLeads] = useState<EarlyAccessLead[]>([])
  const [filter, setFilter] = useState<'ALL' | LeadStatus>('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dashboardApiRequest<{ leads: EarlyAccessLead[] }>('/api/v1/admin/leads', {
        token: session.accessToken,
      })
      setLeads(data.leads)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load early access leads.',
      )
    } finally {
      setLoading(false)
    }
  }, [session.accessToken])

  useEffect(() => {
    void load()
  }, [load])

  const updateStatus = async (lead: EarlyAccessLead, status: LeadStatus) => {
    if (updatingId) return
    try {
      setUpdatingId(lead.id)
      setError('')
      setNotice('')
      const data = await dashboardApiRequest<{ lead: EarlyAccessLead }>(
        `/api/v1/admin/leads/${lead.id}/status`,
        {
          method: 'PATCH',
          token: session.accessToken,
          body: JSON.stringify({ status }),
        },
      )
      setLeads((current) => current.map((item) => (item.id === lead.id ? data.lead : item)))
      setNotice(`${lead.cafeName} marked ${status.toLowerCase()}.`)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the lead.')
    } finally {
      setUpdatingId('')
    }
  }

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (filter !== 'ALL' && lead.status !== filter) return false
      if (!query) return true
      return [lead.cafeName, lead.ownerName, lead.contact, lead.location].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
  }, [filter, leads, search])

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Early access leads</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Review cafe listing requests before creating accounts or approving public marketplace
            visibility.
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

      <section className="mt-7 flex flex-col gap-3 rounded-[1.5rem] border border-white/[0.07] bg-[#111a16] p-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cafe, owner, contact, or location"
            className="tavero-input-dark min-h-12 rounded-xl pl-11 pr-4 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['ALL', ...statuses] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`min-h-12 shrink-0 rounded-xl px-4 text-xs font-black ${
                filter === status
                  ? 'bg-[#F2C572] text-[#254334]'
                  : 'border border-white/10 text-white/45'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
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
        <div className="flex min-h-72 items-center justify-center text-[#F2C572]">
          <Loader2 size={27} className="animate-spin" />
        </div>
      ) : visibleLeads.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 px-6 py-16 text-center text-white/35">
          <ClipboardList size={32} className="mx-auto mb-4" />
          No early access leads match this view.
        </div>
      ) : (
        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {visibleLeads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-[1.7rem] border border-white/[0.07] bg-[#111a16] p-5 shadow-xl shadow-black/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{lead.cafeName}</h2>
                  <p className="mt-1 text-sm text-white/45">{lead.ownerName}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${statusTone[lead.status]}`}
                >
                  {lead.status}
                </span>
              </div>
              <dl className="mt-5 grid gap-3 rounded-2xl bg-black/15 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-white/30">Contact</dt>
                  <dd className="mt-1 break-words font-bold text-white/70">{lead.contact}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/30">Location</dt>
                  <dd className="mt-1 font-bold text-white/70">{lead.location}</dd>
                </div>
              </dl>
              {lead.note && <p className="mt-4 text-sm leading-6 text-white/45">{lead.note}</p>}
              <p className="mt-4 text-xs text-white/25">
                Received {new Date(lead.createdAt).toLocaleString('en-IN')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {statuses
                  .filter((status) => status !== lead.status)
                  .map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updatingId === lead.id}
                      onClick={() => void updateStatus(lead, status)}
                      className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-black disabled:opacity-50 ${statusTone[status]}`}
                    >
                      {status === 'REJECTED' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
