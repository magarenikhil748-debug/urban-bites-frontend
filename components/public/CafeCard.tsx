import Link from 'next/link'
import { ArrowRight, BookOpen, MapPin, UtensilsCrossed } from 'lucide-react'
import { cafeLocation, type PublicCafe } from '@/lib/public-marketplace'

export function CafeCard({ cafe, menuItemCount }: { cafe: PublicCafe; menuItemCount: number }) {
  const location = cafeLocation(cafe)

  return (
    <article className="tavero-hover-lift group overflow-hidden rounded-[1.8rem] border border-[#2C1810]/[0.07] bg-white shadow-[0_18px_55px_rgba(44,24,16,0.08)]">
      <Link href={`/cafe/${cafe.slug}`} className="relative block h-60 overflow-hidden">
        {cafe.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url("${cafe.imageUrl}")` }}
            role="img"
            aria-label={`${cafe.name} cafe`}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(238,184,98,0.55),transparent_32%),linear-gradient(145deg,#32483e,#17241f_75%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold leading-tight">{cafe.name}</p>
            {location && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-white/70">
                <MapPin size={13} />
                {location}
              </p>
            )}
          </div>
          {menuItemCount > 0 && (
            <span className="shrink-0 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xl">
              Menu available
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-stone-600">
          {cafe.description || 'Explore this cafe profile and browse its current digital menu.'}
        </p>

        {menuItemCount > 0 && (
          <p className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-500">
            <BookOpen size={15} className="text-[#C17F3E]" />
            {menuItemCount} menu item{menuItemCount === 1 ? '' : 's'} currently available
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Link
            href={`/cafe/${cafe.slug}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#2C1810]/10 bg-[#FAF7F2] text-sm font-black text-[#254334] transition hover:-translate-y-0.5 hover:border-[#C17F3E]/35"
          >
            View cafe
            <ArrowRight size={16} />
          </Link>
          <Link
            href={`/cafe/${cafe.slug}/menu`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#254334] text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#315744]"
          >
            <UtensilsCrossed size={16} />
            {menuItemCount > 0 ? 'View menu' : 'Cafe menu'}
          </Link>
        </div>
      </div>
    </article>
  )
}
