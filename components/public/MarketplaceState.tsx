import { AlertCircle, Coffee, RefreshCw } from 'lucide-react'

export function MarketplaceLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading cafes"
      aria-busy="true"
    >
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[2rem] border border-stone-900/[0.06] bg-white"
        >
          <div className="skeleton h-56" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-12 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MarketplaceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
        <AlertCircle size={26} />
      </span>
      <h2 className="mt-5 text-xl font-black text-stone-900">Marketplace unavailable</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
        {message || 'We could not load the cafes right now.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1b2b25] px-5 text-sm font-black text-white"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  )
}

export function MarketplaceEmpty({
  title = 'No cafes listed yet',
  description = 'Approved cafe profiles will appear here as soon as they are ready.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-900/10 bg-white/50 px-6 py-14 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1b2b25]/5 text-[#1b2b25]">
        <Coffee size={28} />
      </span>
      <h2 className="mt-5 text-xl font-black text-stone-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">{description}</p>
    </div>
  )
}
