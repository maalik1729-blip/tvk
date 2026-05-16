import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from './cn'

/**
 * Single Button primitive used everywhere.
 * Five kinds × three sizes. No bespoke buttons elsewhere.
 *
 * Spec: outputs/04_component_execution_plan.md → Button System Improvements
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-all duration-150 select-none whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

const sizes = {
  sm: 'h-8  px-3 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-5 text-[15px]',
}

const kinds = {
  primary:
    'text-white shadow-e1 hover:shadow-e2 active:translate-y-px ' +
    'focus-visible:ring-brand-red/25',
  secondary:
    'bg-panel text-ink-900 border border-hairline ' +
    'hover:bg-surface-2 hover:border-border-strong ' +
    'focus-visible:ring-ink-900/15',
  ghost:
    'text-ink-700 hover:bg-surface-2 hover:text-ink-900 ' +
    'focus-visible:ring-ink-900/15',
  destructive:
    'bg-status-danger text-white hover:brightness-[1.05] ' +
    'focus-visible:ring-status-danger/30',
  link:
    'h-auto px-0 text-ink-700 underline underline-offset-2 ' +
    'hover:text-ink-900 focus-visible:ring-ink-900/15',
}

const PRIMARY_GRADIENT =
  'linear-gradient(180deg, #DA1A38 0%, #B40C26 100%)'

const Button = forwardRef(function Button(
  {
    kind = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    loading = false,
    disabled,
    fullWidth,
    as: As = 'button',
    className,
    children,
    style,
    type,
    ...rest
  },
  ref,
) {
  const isPrimary = kind === 'primary'
  const sizeClass = kind === 'link' ? '' : sizes[size]

  const inlineStyle = isPrimary
    ? { background: PRIMARY_GRADIENT, ...style }
    : style

  // Default native button type to "button" so it never accidentally submits.
  const buttonProps = As === 'button' ? { type: type || 'button' } : {}

  return (
    <As
      ref={ref}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cn(base, sizeClass, kinds[kind], fullWidth && 'w-full', className)}
      style={inlineStyle}
      {...buttonProps}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      {children}
      {!loading && iconRight}
    </As>
  )
})

export default Button
