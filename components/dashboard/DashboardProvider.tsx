'use client'

import { Loader2, LockKeyhole } from 'lucide-react'
import {
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  dashboardApiRequest,
  dashboardRestaurantStorageKey,
  dashboardSessionStorageKey,
  type CurrentUser,
  type DashboardSession,
  type RestaurantMembership,
} from '@/lib/dashboard-api'
import { TaveroLogo } from '@/components/brand/TaveroLogo'

type DashboardContextValue = {
  session: DashboardSession | null
  selectedRestaurantId: string
  selectedMembership: RestaurantMembership | null
  setSelectedRestaurantId: (restaurantId: string) => void
  refreshSession: () => Promise<void>
  logout: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function DashboardLogin({
  onAuthenticated,
}: {
  onAuthenticated: (session: DashboardSession) => void
}) {
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
      if (me.user.memberships.length === 0) {
        throw new Error('This account does not have access to a cafe.')
      }

      localStorage.setItem(dashboardSessionStorageKey, login.accessToken)
      onAuthenticated({ accessToken: login.accessToken, user: me.user })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09100d] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(218,166,80,0.18),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(66,125,98,0.16),transparent_32%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#101915]/95 shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-white/[0.07] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mt-8 text-white">
              <TaveroLogo variant="dark" size="lg" contextLabel="Partner" />
            </div>
            <h1 className="mt-3 font-display text-5xl font-bold leading-[1.02]">
              Your cafe,
              <span className="block text-[#F2C572]">beautifully operated.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
              Manage your marketplace presence, digital menu, tables, QR ordering, and live service
              from one connected command center.
            </p>
          </div>
          <p className="text-xs text-white/30">Tavero · Discover. Scan. Order.</p>
        </section>

        <section className="p-6 sm:p-10">
          <TaveroLogo
            variant="dark"
            size="sm"
            iconOnly
            contextLabel="Partner"
            className="lg:hidden"
          />
          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#F2C572]">
            Owner access
          </p>
          <h2 className="mt-2 text-3xl font-black">Open Tavero Partner</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Sign in with your owner or staff account. Access is limited to cafes linked to your
            membership.
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-white/45">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder="owner@cafe.com"
                className="tavero-input-dark min-h-14 text-base"
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
                placeholder="Your password"
                className="tavero-input-dark min-h-14 text-base"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="tavero-button-primary min-h-14 w-full disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LockKeyhole size={19} />
              )}
              {submitting ? 'Signing in…' : 'Enter dashboard'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DashboardSession | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState('')

  const applySession = (nextSession: DashboardSession) => {
    setSession(nextSession)
    const storedRestaurantId = localStorage.getItem(dashboardRestaurantStorageKey)
    const selected =
      nextSession.user.memberships.find(
        (membership) => membership.restaurant.id === storedRestaurantId,
      )?.restaurant.id ??
      nextSession.user.memberships[0]?.restaurant.id ??
      ''
    setSelectedRestaurantIdState(selected)
  }

  const refreshSession = async () => {
    const token = localStorage.getItem(dashboardSessionStorageKey)
    if (!token) {
      setSession(null)
      return
    }
    const me = await dashboardApiRequest<{ user: CurrentUser }>('/api/v1/auth/me', { token })
    applySession({ accessToken: token, user: me.user })
  }

  useEffect(() => {
    const restore = async () => {
      try {
        await refreshSession()
      } catch {
        localStorage.removeItem(dashboardSessionStorageKey)
        localStorage.removeItem(dashboardRestaurantStorageKey)
        setSession(null)
      } finally {
        setRestoring(false)
      }
    }
    void restore()
    // refreshSession intentionally reads the current browser storage once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSelectedRestaurantId = (restaurantId: string) => {
    setSelectedRestaurantIdState(restaurantId)
    localStorage.setItem(dashboardRestaurantStorageKey, restaurantId)
  }

  const logout = () => {
    localStorage.removeItem(dashboardSessionStorageKey)
    localStorage.removeItem(dashboardRestaurantStorageKey)
    setSession(null)
    setSelectedRestaurantIdState('')
  }

  const selectedMembership = useMemo(
    () =>
      session?.user.memberships.find(
        (membership) => membership.restaurant.id === selectedRestaurantId,
      ) ?? null,
    [selectedRestaurantId, session],
  )

  if (restoring) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#09100d] text-white/45"
        aria-label="Restoring dashboard session"
        aria-busy="true"
      >
        <Loader2 size={28} className="animate-spin text-[#F2C572]" />
      </main>
    )
  }

  if (!session) {
    return <DashboardLogin onAuthenticated={applySession} />
  }

  return (
    <DashboardContext.Provider
      value={{
        session,
        selectedRestaurantId,
        selectedMembership,
        setSelectedRestaurantId,
        refreshSession,
        logout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used inside DashboardProvider')
  }
  return context
}
