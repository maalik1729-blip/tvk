import { cn } from './cn'

/**
 * Card primitive. Uses the standard recipe:
 *   bg-panel · border-hairline · radius-lg · e1 elevation
 * Hover lifts to e2 only when `interactive`.
 * Spec: outputs/03_visual_redesign_direction.md → Card Component Redesign
 */
export default function Card({
  as: As = 'div',
  interactive = false,
  className,
  children,
  ...rest
}) {
  return (
    <As
      className={cn(
        'bg-panel border border-hairline rounded-lg shadow-e1',
        interactive &&
          'transition-shadow hover:shadow-e2 focus-within:ring-2 focus-within:ring-brand-red focus-within:ring-offset-2',
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  )
}
