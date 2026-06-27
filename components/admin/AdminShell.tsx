'use client'

import { ClipboardList, ExternalLink, LogOut, ShieldCheck, Store } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { TaveroBrand } from '@/components/brand/TaveroBrand'
import { useAdmin } from './AdminProvider'

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAdmin()

  return (
    <div className="min-h-screen bg-[#09100d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09100d]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-18 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin/cafes" className="text-white">
            <TaveroBrand compact inverse label="Tavero Admin" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/cafes"
              target="_blank"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/55 transition hover:-translate-y-0.5 hover:border-[#F2C572]/30 hover:text-[#F2C572] sm:flex"
            >
              Marketplace <ExternalLink size={13} />
            </Link>
            <span className="hidden text-xs text-white/35 lg:block">{session.user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-rose-300/20 hover:text-rose-300"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <nav className="mb-7 flex gap-2 overflow-x-auto" aria-label="Admin sections">
          <Link
            href="/admin/cafes"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/65 transition hover:border-[#F2C572]/30 hover:text-[#F2C572]"
          >
            <ShieldCheck size={15} /> Cafe approvals
          </Link>
          <Link
            href="/admin/leads"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/65 transition hover:border-[#F2C572]/30 hover:text-[#F2C572]"
          >
            <ClipboardList size={15} /> Early access leads
          </Link>
        </nav>
        <div className="mb-7 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#F2C572]">
          <Store size={14} />
          Cafe approval and availability
        </div>
        {children}
      </main>
    </div>
  )
}
