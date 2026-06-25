const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const getPublicAppBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return trimTrailingSlash(configured)
  if (typeof window !== 'undefined') return trimTrailingSlash(window.location.origin)
  return 'http://localhost:3000'
}

export const getCafeProfileUrl = (slug: string) =>
  `${getPublicAppBaseUrl()}/cafe/${encodeURIComponent(slug)}`

export const getCafeMenuUrl = (slug: string) =>
  `${getPublicAppBaseUrl()}/cafe/${encodeURIComponent(slug)}/menu`

export const getWhatsAppShareUrl = (message: string) =>
  `https://wa.me/?text=${encodeURIComponent(message)}`

export const isLocalUrl = (value: string) => {
  try {
    const hostname = new URL(value, getPublicAppBaseUrl()).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return true
  }
}
