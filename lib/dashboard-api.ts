export type UserRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN'

export type Branch = {
  id: string
  restaurantId: string
  name: string
  address: string | null
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Restaurant = {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  currency: string
  taxEnabled: boolean
  gstNumber: string | null
  logoUrl: string | null
  imageUrl: string | null
  isActive: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
  branches?: Branch[]
}

export type RestaurantMembership = {
  id: string
  role: UserRole
  restaurant: Restaurant
  branch: Branch | null
}

export type CurrentUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  memberships: RestaurantMembership[]
}

export type DashboardSession = {
  accessToken: string
  user: CurrentUser
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  code?: string
}

export const dashboardSessionStorageKey = 'restaurant-dashboard-access-token'
export const dashboardRestaurantStorageKey = 'restaurant-dashboard-selected-restaurant'

export const dashboardApiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export class DashboardApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
  }
}

export const dashboardApiRequest = async <T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> => {
  const headers = new Headers(options.headers)
  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${dashboardApiBaseUrl}${path}`, {
    ...options,
    headers,
  })
  const body = (await response.json()) as ApiEnvelope<T>

  if (!response.ok) {
    throw new DashboardApiError(body.message || 'Request failed', response.status, body.code)
  }

  return body.data
}

export const formatDashboardPrice = (priceInPaise: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100)

export const canManageRestaurant = (role?: UserRole) => role === 'OWNER' || role === 'MANAGER'

export const canToggleAvailability = (role?: UserRole) =>
  role === 'OWNER' || role === 'MANAGER' || role === 'KITCHEN'
