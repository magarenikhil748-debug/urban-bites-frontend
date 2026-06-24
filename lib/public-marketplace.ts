export type PublicCafe = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  imageUrl: string | null
  logoUrl: string | null
  currency: string
  menuUrl: string
}

export type PublicMenuItem = {
  id: string
  branchId: string | null
  name: string
  description: string | null
  priceInPaise: number
  imageUrl: string | null
  foodType: string
  isRecommended: boolean
  preparationTimeMinutes: number | null
  sortOrder: number
}

export type PublicMenuCategory = {
  id: string
  branchId: string | null
  name: string
  description: string | null
  sortOrder: number
  items: PublicMenuItem[]
}

export type PublicTable = {
  id: string
  tableNumber: string
  tableLabel: string | null
  branch: {
    id: string
    name: string
  }
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const publicApiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export const publicApiRequest = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${publicApiBaseUrl}${path}`, { signal })
  const body = (await response.json()) as ApiEnvelope<T>

  if (!response.ok) {
    throw new Error(body.message || 'Unable to load marketplace data.')
  }

  return body.data
}

export const cafeLocation = (cafe: Pick<PublicCafe, 'address' | 'city'>) =>
  [cafe.address, cafe.city].filter(Boolean).join(', ')

export const formatMenuPrice = (priceInPaise: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100)

export const foodTypeMeta = (foodType: string) => {
  switch (foodType) {
    case 'NON_VEG':
      return { label: 'Non-veg', dotClass: 'bg-rose-500', textClass: 'text-rose-700' }
    case 'EGG':
      return { label: 'Contains egg', dotClass: 'bg-amber-500', textClass: 'text-amber-700' }
    case 'BEVERAGE':
      return { label: 'Beverage', dotClass: 'bg-sky-500', textClass: 'text-sky-700' }
    case 'JAIN':
      return { label: 'Jain', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' }
    default:
      return { label: 'Veg', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' }
  }
}
