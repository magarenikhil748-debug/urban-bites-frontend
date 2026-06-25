import { Coffee } from 'lucide-react'

export function TaveroBrand({
  compact = false,
  inverse = false,
  label = 'Tavero',
}: {
  compact?: boolean
  inverse?: boolean
  label?: string
}) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-[1rem] ${
          compact ? 'h-10 w-10' : 'h-11 w-11'
        } ${inverse ? 'bg-[#f0c57a] text-[#2c190f]' : 'bg-[#321d13] text-[#f0c57a]'}`}
      >
        <Coffee size={compact ? 19 : 21} strokeWidth={2.4} />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-current bg-[#75966d]" />
      </span>
      <span>
        <span
          className={`block font-display font-bold leading-none tracking-[-0.03em] ${
            compact ? 'text-xl' : 'text-2xl'
          }`}
        >
          {label}
        </span>
        <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.22em] opacity-55">
          Discover. Scan. Order.
        </span>
      </span>
    </span>
  )
}
