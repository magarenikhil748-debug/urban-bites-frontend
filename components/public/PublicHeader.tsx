import Link from 'next/link'
import { ArrowUpRight, LayoutDashboard } from 'lucide-react'
import { TaveroBrand } from '@/components/brand/TaveroBrand'

export function PublicHeader({ floating = false }: { floating?: boolean }) {
  return (
    <header
      className={
        floating
          ? 'absolute inset-x-0 top-0 z-40'
          : 'sticky top-0 z-40 border-b border-[#2C1810]/5 bg-[#FAF7F2]/92 backdrop-blur-xl'
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={floating ? 'text-white' : 'text-[#254334]'}
          aria-label="Tavero home"
        >
          <TaveroBrand compact inverse={floating} />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Public navigation">
          <Link
            href="/cafes"
            className={`tavero-nav-link hidden min-h-10 items-center rounded-xl px-3.5 text-sm font-bold transition sm:flex ${
              floating
                ? 'text-white/75 hover:bg-white/10 hover:text-white'
                : 'text-[#2D2D2D]/65 hover:bg-[#EFE7DA] hover:text-[#2C1810]'
            }`}
          >
            Explore cafes
          </Link>
          <Link
            href="/dashboard/orders"
            className={`flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition sm:text-sm ${
              floating
                ? 'border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15'
                : 'border border-[#2C1810]/10 bg-white text-[#254334] shadow-sm hover:-translate-y-0.5 hover:border-[#C17F3E]/30 hover:shadow-md'
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Tavero Partner</span>
            <span className="sm:hidden">Dashboard</span>
            <ArrowUpRight size={14} className="hidden sm:block" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
