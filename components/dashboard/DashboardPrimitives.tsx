import { AlertTriangle, CheckCircle2, Loader2, type LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.23em] text-[#F2C572]">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/42 sm:text-base">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  )
}

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'amber',
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  detail: string
  tone?: 'amber' | 'green' | 'blue' | 'violet' | 'rose'
}) {
  const tones = {
    amber: 'bg-amber-400/10 text-amber-300',
    green: 'bg-emerald-400/10 text-emerald-300',
    blue: 'bg-sky-400/10 text-sky-300',
    violet: 'bg-violet-400/10 text-violet-300',
    rose: 'bg-rose-400/10 text-rose-300',
  }

  return (
    <article className="tavero-hover-lift rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-5 shadow-xl shadow-black/10">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="mt-5 text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm font-black text-white/75">{label}</p>
      <p className="mt-1 text-xs leading-5 text-white/28">{detail}</p>
    </article>
  )
}

export function DashboardLoading({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div
      className="flex min-h-72 items-center justify-center rounded-[1.8rem] border border-white/[0.07] bg-[#111a16]"
      aria-label={label}
      aria-busy="true"
    >
      <Loader2 size={26} className="animate-spin text-[#F2C572]" />
    </div>
  )
}

export function DashboardError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 p-5 text-rose-100">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-300" />
        <div className="flex-1">
          <p className="font-black">Unable to load this workspace</p>
          <p className="mt-1 text-sm leading-6 text-rose-100/65">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-10 rounded-xl border border-rose-200/15 px-3 text-xs font-black"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export function DashboardNotice({
  title,
  message,
  tone = 'info',
}: {
  title: string
  message: string
  tone?: 'info' | 'success' | 'warning'
}) {
  const styles = {
    info: 'border-sky-400/15 bg-sky-400/[0.07] text-sky-100',
    success: 'border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-100',
    warning: 'border-amber-400/15 bg-amber-400/[0.07] text-amber-100',
  }

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <div className="flex items-start gap-3">
        {tone === 'success' ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-black">{title}</p>
          <p className="mt-1 text-xs leading-5 opacity-65">{message}</p>
        </div>
      </div>
    </div>
  )
}
