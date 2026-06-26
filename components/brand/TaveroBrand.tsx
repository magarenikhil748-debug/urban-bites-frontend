import { TaveroLogo } from './TaveroLogo'

export function TaveroBrand({
  compact = false,
  inverse = false,
  label = 'Tavero',
}: {
  compact?: boolean
  inverse?: boolean
  label?: string
}) {
  const contextLabel = label === 'Tavero' ? undefined : label.replace(/^Tavero\s*/i, '').trim()

  return (
    <TaveroLogo
      variant={inverse ? 'dark' : 'light'}
      size={compact ? 'sm' : 'md'}
      showTagline
      contextLabel={contextLabel || undefined}
    />
  )
}
