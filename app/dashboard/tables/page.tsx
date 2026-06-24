'use client'

import { CheckCircle2, Edit3, EyeOff, Loader2, MapPin, Plus, QrCode, Table2, X } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  DashboardError,
  DashboardLoading,
  DashboardNotice,
  DashboardPageHeader,
  DashboardStatCard,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import {
  canManageRestaurant,
  dashboardApiRequest,
  type Branch,
  type Restaurant,
} from '@/lib/dashboard-api'

type DiningTable = {
  id: string
  restaurantId: string
  branchId: string
  tableNumber: string
  tableLabel: string | null
  qrToken: string
  qrUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type TableWithBranch = DiningTable & {
  branch: Branch
}

type TableForm = {
  id?: string
  branchId: string
  tableNumber: string
  tableLabel: string
}

export default function TablesManagementPage() {
  const { session, selectedRestaurantId, selectedMembership } = useDashboard()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tables, setTables] = useState<TableWithBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [form, setForm] = useState<TableForm | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const canManage = canManageRestaurant(selectedMembership?.role)

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
          const data = await dashboardApiRequest<{ tables: DiningTable[] }>(
            `/api/v1/branches/${branch.id}/tables?includeInactive=true`,
            { token: session.accessToken },
          )
          return data.tables.map((table) => ({ ...table, branch }))
        }),
      )
      setRestaurant(restaurantData.restaurant)
      setTables(tableGroups.flat())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load tables.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const visibleTables = useMemo(
    () =>
      tables.filter((table) => {
        if (branchFilter !== 'ALL' && table.branchId !== branchFilter) return false
        if (statusFilter === 'ACTIVE' && !table.isActive) return false
        if (statusFilter === 'INACTIVE' && table.isActive) return false
        return true
      }),
    [branchFilter, statusFilter, tables],
  )

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !form || !canManage || submitting) return
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      const payload = {
        tableNumber: form.tableNumber.trim(),
        tableLabel: form.tableLabel.trim() || undefined,
      }
      if (form.id) {
        await dashboardApiRequest(`/api/v1/tables/${form.id}`, {
          method: 'PATCH',
          token: session.accessToken,
          body: JSON.stringify({
            tableNumber: payload.tableNumber,
            tableLabel: form.tableLabel.trim() || null,
          }),
        })
        setSuccess('Table details updated.')
      } else {
        await dashboardApiRequest(`/api/v1/branches/${form.branchId}/tables`, {
          method: 'POST',
          token: session.accessToken,
          body: JSON.stringify(payload),
        })
        setSuccess('Table created with its own backward-compatible QR token.')
      }
      setForm(null)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save table.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (table: TableWithBranch) => {
    if (!session || !canManage || updatingId) return
    try {
      setUpdatingId(table.id)
      setError('')
      await dashboardApiRequest(`/api/v1/tables/${table.id}`, {
        method: 'PATCH',
        token: session.accessToken,
        body: JSON.stringify({ isActive: !table.isActive }),
      })
      setSuccess(`Table ${table.tableNumber} is now ${table.isActive ? 'inactive' : 'active'}.`)
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update table.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <DashboardLoading label="Loading table manager" />
  if (error && !restaurant) return <DashboardError message={error} onRetry={() => void load()} />
  if (!restaurant) return <DashboardError message="Cafe table workspace is unavailable." />

  const branches = restaurant.branches ?? []
  const activeCount = tables.filter((table) => table.isActive).length
  const inactiveCount = tables.length - activeCount

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        eyebrow="Dining floor control"
        title="Tables"
        description="Keep table selection accurate for customer orders. Active tables appear in the single-cafe QR flow; legacy per-table QR tokens remain intact."
        actions={
          canManage ? (
            <button
              type="button"
              disabled={branches.length === 0}
              onClick={() =>
                setForm({
                  branchId: branchFilter === 'ALL' ? (branches[0]?.id ?? '') : branchFilter,
                  tableNumber: '',
                  tableLabel: '',
                })
              }
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f] disabled:opacity-40"
            >
              <Plus size={16} /> Add table
            </button>
          ) : undefined
        }
      />

      {!canManage && (
        <DashboardNotice
          title="Read-only table access"
          message="Owners and managers can create, edit, deactivate, and reactivate tables. Your membership can view the current floor setup."
          tone="warning"
        />
      )}
      {success && <DashboardNotice title="Table setup updated" message={success} tone="success" />}
      {error && <DashboardError message={error} />}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardStatCard
          icon={Table2}
          label="All tables"
          value={tables.length}
          detail="Across active branches"
          tone="blue"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Active"
          value={activeCount}
          detail="Available for ordering"
          tone="green"
        />
        <DashboardStatCard
          icon={EyeOff}
          label="Inactive"
          value={inactiveCount}
          detail="Hidden from table selection"
          tone="rose"
        />
        <DashboardStatCard
          icon={MapPin}
          label="Branches"
          value={branches.length}
          detail="Active cafe locations"
          tone="amber"
        />
      </section>

      <section className="rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            aria-label="Filter by branch"
            className="dashboard-input sm:max-w-xs"
          >
            <option value="ALL">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 overflow-x-auto">
            {[
              ['ALL', 'All tables'],
              ['ACTIVE', 'Active'],
              ['INACTIVE', 'Inactive'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value as typeof statusFilter)}
                className={`min-h-12 shrink-0 rounded-xl px-4 text-xs font-black ${
                  statusFilter === value
                    ? 'bg-[#e8b968] text-[#17251f]'
                    : 'border border-white/10 text-white/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {branches.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/10 bg-[#111a16] px-6 py-14 text-center">
          <MapPin size={32} className="mx-auto text-[#e8b968]" />
          <h2 className="mt-4 text-2xl font-black">A branch is required first.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
            The backend has branch management APIs, but this phase does not add branch creation to
            the dashboard. Create an active branch before adding tables.
          </p>
        </section>
      ) : visibleTables.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/10 bg-[#111a16] px-6 py-14 text-center">
          <Table2 size={32} className="mx-auto text-[#e8b968]" />
          <h2 className="mt-4 text-2xl font-black">No tables in this view.</h2>
          <p className="mt-2 text-sm text-white/35">
            Change the filters or add a table to start accepting table orders.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTables.map((table) => (
            <article
              key={table.id}
              className={`rounded-[1.7rem] border p-5 ${
                table.isActive
                  ? 'border-white/[0.07] bg-[#111a16]'
                  : 'border-white/[0.05] bg-[#0e1512] opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      table.isActive
                        ? 'bg-[#e8b968] text-[#17251f]'
                        : 'bg-white/[0.05] text-white/30'
                    }`}
                  >
                    <Table2 size={21} />
                  </span>
                  <div>
                    <p className="text-xl font-black">Table {table.tableNumber}</p>
                    <p className="mt-0.5 text-xs text-white/30">
                      {table.tableLabel || 'No additional label'}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    table.isActive
                      ? 'bg-emerald-400/10 text-emerald-300'
                      : 'bg-white/[0.05] text-white/30'
                  }`}
                >
                  {table.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl bg-black/15 p-4">
                <p className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/28">Branch</span>
                  <span className="font-black text-white/65">{table.branch.name}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/28">Customer selection</span>
                  <span className="font-black text-white/65">
                    {table.isActive ? 'Shown' : 'Hidden'}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/28">Legacy table QR</span>
                  <span className="inline-flex items-center gap-1 font-black text-white/65">
                    <QrCode size={12} /> Configured
                  </span>
                </p>
              </div>

              {canManage && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        id: table.id,
                        branchId: table.branchId,
                        tableNumber: table.tableNumber,
                        tableLabel: table.tableLabel ?? '',
                      })
                    }
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-black text-white/50 hover:text-white"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === table.id}
                    onClick={() => void toggleActive(table)}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black ${
                      table.isActive
                        ? 'bg-rose-500/10 text-rose-300'
                        : 'bg-emerald-400/10 text-emerald-300'
                    }`}
                  >
                    {updatingId === table.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : table.isActive ? (
                      <EyeOff size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {table.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <DashboardNotice
        title="How table ordering connects"
        message="The single cafe QR opens the public menu, where customers choose an active table before ordering. Existing per-table QR records remain available through the backend and are not altered by this dashboard."
      />

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="w-full max-w-lg rounded-t-[2rem] border border-white/10 bg-[#111a16] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">{form.id ? 'Edit table' : 'Add table'}</h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/40"
              >
                <X size={18} />
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={save}>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/38">Branch</span>
                <select
                  value={form.branchId}
                  onChange={(event) => setForm({ ...form, branchId: event.target.value })}
                  disabled={Boolean(form.id)}
                  className="dashboard-input"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/38">Table number</span>
                <input
                  value={form.tableNumber}
                  onChange={(event) => setForm({ ...form, tableNumber: event.target.value })}
                  required
                  className="dashboard-input"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/38">Optional label</span>
                <input
                  value={form.tableLabel}
                  onChange={(event) => setForm({ ...form, tableLabel: event.target.value })}
                  placeholder="Window seat, Patio, Counter…"
                  className="dashboard-input"
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-black text-white/45"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-11 items-center gap-2 rounded-xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f] disabled:opacity-60"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  Save table
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
