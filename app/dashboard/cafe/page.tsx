'use client'

import {
  Check,
  ExternalLink,
  Eye,
  ImageIcon,
  Link2,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  DashboardError,
  DashboardLoading,
  DashboardNotice,
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { canManageRestaurant, dashboardApiRequest, type Restaurant } from '@/lib/dashboard-api'

type ProfileForm = {
  name: string
  slug: string
  description: string
  address: string
  city: string
  phone: string
  email: string
  imageUrl: string
  logoUrl: string
}

const toForm = (restaurant: Restaurant): ProfileForm => ({
  name: restaurant.name,
  slug: restaurant.slug,
  description: restaurant.description ?? '',
  address: restaurant.address ?? '',
  city: restaurant.city ?? '',
  phone: restaurant.phone ?? '',
  email: restaurant.email ?? '',
  imageUrl: restaurant.imageUrl ?? '',
  logoUrl: restaurant.logoUrl ?? '',
})

const optionalFields: Array<keyof Omit<ProfileForm, 'name' | 'slug'>> = [
  'description',
  'address',
  'city',
  'phone',
  'email',
  'imageUrl',
  'logoUrl',
]

export default function CafeProfileManagementPage() {
  const { session, selectedRestaurantId, selectedMembership, refreshSession } = useDashboard()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const canManage = canManageRestaurant(selectedMembership?.role)

  const load = useCallback(async () => {
    if (!session || !selectedRestaurantId) return
    try {
      setLoading(true)
      setError('')
      const data = await dashboardApiRequest<{ restaurant: Restaurant }>(
        `/api/v1/restaurants/${selectedRestaurantId}`,
        { token: session.accessToken },
      )
      setRestaurant(data.restaurant)
      setForm(toForm(data.restaurant))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load cafe profile.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const completeness = useMemo(() => {
    if (!restaurant) return { completed: 0, total: 7, percentage: 0 }
    const fields = [
      restaurant.description,
      restaurant.address,
      restaurant.city,
      restaurant.phone,
      restaurant.imageUrl,
      restaurant.logoUrl,
      restaurant.email,
    ]
    const completed = fields.filter(Boolean).length
    return {
      completed,
      total: fields.length,
      percentage: Math.round((completed / fields.length) * 100),
    }
  }, [restaurant])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !restaurant || !form || !canManage || saving) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      for (const field of optionalFields) {
        const previous = restaurant[field]
        if (previous && !form[field].trim()) {
          throw new Error(
            `The current profile API cannot clear ${field}. Replace it with a new value instead.`,
          )
        }
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
      }
      const data = await dashboardApiRequest<{ restaurant: Restaurant }>(
        `/api/v1/restaurants/${restaurant.id}`,
        {
          method: 'PATCH',
          token: session.accessToken,
          body: JSON.stringify(payload),
        },
      )
      setRestaurant(data.restaurant)
      setForm(toForm(data.restaurant))
      setSuccess('Cafe profile saved. Public marketplace pages now use the updated profile data.')
      await refreshSession()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLoading label="Loading cafe profile" />
  if (error && !restaurant) return <DashboardError message={error} onRetry={() => void load()} />
  if (!restaurant || !form) return <DashboardError message="Cafe profile is unavailable." />

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Marketplace presence"
        title="Cafe profile"
        description="This is the identity customers see before visiting. Keep your story, location, contact details, and cover image accurate."
        actions={
          <>
            <Link
              href={`/cafe/${restaurant.slug}`}
              target="_blank"
              className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/65 hover:text-white"
            >
              View profile <ExternalLink size={15} />
            </Link>
            <Link
              href={`/cafe/${restaurant.slug}/menu`}
              target="_blank"
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f]"
            >
              Customer menu <ExternalLink size={15} />
            </Link>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/28">
                  Profile completeness
                </p>
                <p className="mt-2 text-2xl font-black">{completeness.percentage}% complete</p>
                <p className="mt-1 text-xs text-white/35">
                  {completeness.completed} of {completeness.total} optional public details added
                </p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06] sm:w-52">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c68a36] to-[#f1ca84]"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>
          </article>

          {!canManage && (
            <DashboardNotice
              title="Read-only access"
              message="Your membership can view this profile, but only owners and managers can update cafe settings."
              tone="warning"
            />
          )}
          {success && <DashboardNotice title="Profile updated" message={success} tone="success" />}
          {error && <DashboardError message={error} />}

          <form
            onSubmit={save}
            className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-5 sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Public cafe details</h2>
                <p className="mt-1 text-xs text-white/30">
                  Saved through the authenticated restaurant API.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/35">
                {selectedMembership?.role}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Cafe name" required>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  disabled={!canManage}
                  required
                  className="dashboard-input"
                />
              </Field>
              <Field label="Public slug" required>
                <div className="relative">
                  <Link2
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
                  />
                  <input
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    disabled={!canManage}
                    required
                    className="dashboard-input pl-10"
                  />
                </div>
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Address" className="md:col-span-2">
                <input
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Public email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Cover image URL">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Logo URL" className="md:col-span-2">
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(event) => setForm({ ...form, logoUrl: event.target.value })}
                  disabled={!canManage}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Cafe description" className="md:col-span-2">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  disabled={!canManage}
                  rows={5}
                  className="dashboard-input resize-none py-3"
                />
              </Field>
            </div>

            {canManage && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f] disabled:opacity-60"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-5">
          <article className="overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-[#111a16]">
            <div className="relative h-64">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgba(232,185,104,0.34),transparent_28%),linear-gradient(145deg,#3e5f50,#13211b)]">
                  <ImageIcon size={36} className="text-white/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101915] via-[#101915]/25 to-transparent" />
              <p className="absolute bottom-4 left-5 text-xs font-black uppercase tracking-[0.2em] text-[#e8b968]">
                Marketplace preview
              </p>
            </div>
            <div className="p-6">
              <h2 className="font-display text-3xl font-bold">{form.name || 'Your cafe name'}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-white/38">
                <MapPin size={13} className="text-[#e8b968]" />
                {[form.address, form.city].filter(Boolean).join(', ') || 'Add a cafe location'}
              </p>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/45">
                {form.description || 'Add a description that helps customers understand your cafe.'}
              </p>
              <div className="mt-5 flex gap-2">
                <span className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8b968] text-xs font-black text-[#17251f]">
                  <Eye size={15} /> View cafe
                </span>
                <span className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-black text-white/55">
                  <Store size={15} /> View menu
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-6">
            <h2 className="text-lg font-black">Listing status</h2>
            <div className="mt-5 space-y-3">
              <StatusRow
                icon={Check}
                label="Cafe active"
                value={restaurant.isActive ? 'Active' : 'Inactive'}
                active={restaurant.isActive}
              />
              <StatusRow
                icon={ShieldCheck}
                label="Marketplace approval"
                value={restaurant.isApproved ? 'Approved' : 'Awaiting approval'}
                active={restaurant.isApproved}
              />
              <StatusRow
                icon={Link2}
                label="Public path"
                value={`/cafe/${restaurant.slug}`}
                active
              />
            </div>
            <p className="mt-5 rounded-2xl bg-white/[0.035] p-4 text-xs leading-5 text-white/32">
              Active and approval status are intentionally read-only here. Approval is controlled by
              platform administration, not the cafe profile update API.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  required,
  className = '',
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-white/38">
        {label}
        {required && <span className="ml-1 text-[#e8b968]">*</span>}
      </span>
      {children}
    </label>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: typeof Check
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'
        }`}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white/30">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black">{value}</p>
      </div>
    </div>
  )
}
