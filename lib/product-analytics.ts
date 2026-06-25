type ProductEvent =
  | 'marketplace_viewed'
  | 'cafe_profile_viewed'
  | 'qr_menu_viewed'
  | 'order_started'
  | 'order_placed'
  | 'cafe_link_copied'
  | 'cafe_shared_whatsapp'
  | 'qr_downloaded'
  | 'admin_cafes_viewed'
  | 'admin_cafe_approval_changed'
  | 'admin_cafe_status_changed'

type SafeProperty = string | number | boolean | null | undefined

const getAnonymousId = () => {
  const storageKey = 'cafe-marketplace-anonymous-id'
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing
  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(storageKey, created)
  return created
}

export const captureProductEvent = (
  event: ProductEvent,
  properties: Record<string, SafeProperty> = {},
) => {
  if (typeof window === 'undefined') return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com').replace(
    /\/$/,
    '',
  )
  if (!apiKey) return

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  )

  void fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      api_key: apiKey,
      event,
      properties: {
        distinct_id: getAnonymousId(),
        $current_url: window.location.href,
        ...safeProperties,
      },
    }),
  }).catch(() => {
    // Product analytics must never interrupt ordering or operations.
  })
}
