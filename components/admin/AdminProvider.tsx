'use client'

import { AlertTriangle, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from 'react'
import {
  dashboardApiRequest,
  dashboardRestaurantStorageKey,
  dashboardSessionStorageKey,
  type CurrentUser,
  type DashboardSession,
} from '@/lib/dashboard-api'

type AdminContextValue = {
  session: DashboardSession
  logout: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

function AdminLogin({ onAuthenticated }: { onAuthenticated: (session: DashboardSession) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      setError('')
      const login = await dashboardApiRequest<{ accessToken: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const me = await dashboardApiRequest<{ user: CurrentUser }>('/api/v1/auth/me', {
        token: login.accessToken,
      })
      localStorage.setItem(dashboardSessionStorageKey, login.accessToken)
      onAuthenticated({ accessToken: login.accessToken, user: me.user })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b12] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0e1520] p-6 shadow-2xl sm:p-8">
        <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-cyan-300 text-[#071019]">
          <ShieldCheck size={25} />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.23em] text-cyan-300">
          Platform control
        </p>
        <h1 className="mt-2 text-3xl font-black">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-white/45">
          This route requires a platform administrator account. Cafe owner accounts remain isolated
          to their own dashboard.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-white/45">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-4 outline-none focus:border-cyan-300/60"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-white/45">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-4 outline-none focus:border-cyan-300/60"
            />
          </label>
          {error && (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 font-black text-[#071019] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <LockKeyhole size={18} />
            )}
            {submitting ? 'Signing in…' : 'Enter admin console'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Unauthorized({ session, logout }: { session: DashboardSession; logout: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b12] px-4 text-white">
      <section className="w-full max-w-lg rounded-[2rem] border border-amber-300/20 bg-[#0e1520] p-8 text-center">
        <AlertTriangle size={34} className="mx-auto text-amber-300" />
        <h1 className="mt-5 text-2xl font-black">Platform admin access required</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">
          {session.user.email} is signed in as {session.user.role}. This account cannot view or
          change platform cafe approvals.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-black text-white/70"
          >
            Open cafe dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="min-h-12 rounded-2xl bg-cyan-300 px-5 text-sm font-black text-[#071019]"
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  )
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DashboardSession | null>(null)
  const [restoring, setRestoring] = useState(true)

  const logout = () => {
    localStorage.removeItem(dashboardSessionStorageKey)
    localStorage.removeItem(dashboardRestaurantStorageKey)
    setSession(null)
  }

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem(dashboardSessionStorageKey)
      if (!token) {
        setRestoring(false)
        return
      }
      try {
        const me = await dashboardApiRequest<{ user: CurrentUser }>('/api/v1/auth/me', { token })
        setSession({ accessToken: token, user: me.user })
      } catch {
        localStorage.removeItem(dashboardSessionStorageKey)
      } finally {
        setRestoring(false)
      }
    }
    void restore()
  }, [])

  if (restoring) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b12] text-cyan-300">
        <Loader2 size={28} className="animate-spin" aria-label="Restoring admin session" />
      </main>
    )
  }
  if (!session) return <AdminLogin onAuthenticated={setSession} />
  if (session.user.role !== 'ADMIN') return <Unauthorized session={session} logout={logout} />

  return <AdminContext.Provider value={{ session, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside AdminProvider')
  return context
}
