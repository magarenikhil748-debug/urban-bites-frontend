type TaveroLogoVariant = 'light' | 'dark'
type TaveroLogoSize = 'sm' | 'md' | 'lg'

type TaveroLogoProps = {
  variant?: TaveroLogoVariant
  size?: TaveroLogoSize
  showTagline?: boolean
  iconOnly?: boolean
  className?: string
  contextLabel?: string
}

const palette = {
  light: {
    iconPrimary: '#2C1810',
    wordmark: '#2C1810',
    accent: '#C17F3E',
    knockout: '#FAF7F2',
    rule: '#E8CFB9',
    tagline: '#8B7163',
  },
  dark: {
    iconPrimary: '#FAF7F2',
    wordmark: '#FAF7F2',
    accent: '#C17F3E',
    knockout: '#160B07',
    rule: '#8A5729',
    tagline: '#A58D7F',
  },
} as const

const sizes = {
  sm: {
    root: 'gap-2.5',
    icon: 'h-10 w-10',
    wordmark: 'text-[1.35rem]',
    rule: 'mt-1 hidden h-0.5 w-24 sm:block',
    tagline: 'mt-1 hidden text-[0.45rem] tracking-[0.18em] sm:block',
  },
  md: {
    root: 'gap-3',
    icon: 'h-12 w-12',
    wordmark: 'text-[1.85rem]',
    rule: 'mt-1.5 h-0.5 w-36',
    tagline: 'mt-1 text-[0.55rem] tracking-[0.2em]',
  },
  lg: {
    root: 'gap-4',
    icon: 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]',
    wordmark: 'text-5xl sm:text-6xl',
    rule: 'mt-2 h-1 w-56 sm:w-72',
    tagline: 'mt-2 text-[0.68rem] tracking-[0.22em] sm:text-xs',
  },
} as const

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export function TaveroIconMark({
  variant = 'light',
  className,
  title,
}: {
  variant?: TaveroLogoVariant
  className?: string
  title?: string
}) {
  const colors = palette[variant]
  const circleFill = variant === 'dark' ? colors.accent : colors.iconPrimary

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <line
        x1="18"
        y1="54"
        x2="32"
        y2="24"
        stroke={colors.iconPrimary}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="54"
        x2="32"
        y2="24"
        stroke={colors.accent}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="32" cy="17" r="11" fill={circleFill} />
      <circle cx="32" cy="17" r="4.6" fill={colors.knockout} />
    </svg>
  )
}

export function TaveroLogo({
  variant = 'light',
  size = 'md',
  showTagline = true,
  iconOnly = false,
  className,
  contextLabel,
}: TaveroLogoProps) {
  const colors = palette[variant]
  const logoSize = sizes[size]
  const accessibleLabel = contextLabel
    ? `Tavero ${contextLabel} — Discover. Scan. Order.`
    : 'Tavero — Discover. Scan. Order.'

  if (iconOnly) {
    return (
      <span className={cx('inline-flex shrink-0 items-center', className)} aria-label={accessibleLabel}>
        <TaveroIconMark variant={variant} className={logoSize.icon} title={accessibleLabel} />
      </span>
    )
  }

  return (
    <span
      className={cx('inline-flex min-w-0 items-center', logoSize.root, className)}
      aria-label={accessibleLabel}
    >
      <TaveroIconMark variant={variant} className={cx('shrink-0', logoSize.icon)} />
      <span className="min-w-0">
        <span
          className={cx(
            'block whitespace-nowrap font-body leading-none tracking-[-0.065em]',
            logoSize.wordmark,
          )}
          style={{ color: colors.wordmark }}
        >
          <span className="font-semibold">T</span>
          <span className="font-light">avero</span>
        </span>
        {showTagline && (
          <>
            <span
              className={cx('block rounded-full', logoSize.rule)}
              style={{ backgroundColor: colors.rule }}
            />
            <span
              className={cx(
                'block whitespace-nowrap font-accent font-medium uppercase leading-none',
                logoSize.tagline,
              )}
              style={{ color: colors.tagline }}
            >
              DISCOVER · SCAN · ORDER
            </span>
          </>
        )}
      </span>
    </span>
  )
}
