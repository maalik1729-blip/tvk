import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from './cn'

/**
 * One TextField primitive. Persistent label, validate-on-blur friendly,
 * accessible error/help wiring.
 * Spec: outputs/04_component_execution_plan.md → Form Improvements
 */
const TextField = forwardRef(function TextField(
  {
    label,
    optional,
    example,
    help,
    error,
    iconLeft,
    iconRight,
    type = 'text',
    className,
    inputClassName,
    id: idProp,
    ...rest
  },
  ref,
) {
  const reactId = useId()
  const id = idProp || reactId
  const helpId = `${id}-help`
  const errorId = `${id}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[12px] font-semibold tracking-wide text-ink-700 flex items-center gap-2"
        >
          <span>{label}</span>
          {optional && (
            <span className="font-normal text-ink-500">Optional</span>
          )}
        </label>
      )}

      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : help ? helpId : undefined}
          placeholder={example ? `e.g. ${example}` : rest.placeholder}
          {...rest}
          className={cn(
            'w-full h-11 sm:h-10 px-3 rounded-md bg-panel text-[15px] text-ink-900',
            'border border-hairline transition-colors',
            'placeholder:text-ink-400',
            'hover:border-border-strong',
            'focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/15',
            'disabled:bg-surface-2 disabled:text-ink-500 disabled:cursor-not-allowed',
            iconLeft && 'pl-9',
            iconRight && 'pr-9',
            error &&
              'border-status-danger focus:border-status-danger focus:ring-status-danger/15',
            inputClassName,
          )}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">
            {iconRight}
          </span>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          className="text-[13px] text-status-danger flex items-start gap-1.5"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : help ? (
        <p id={helpId} className="text-[13px] text-ink-500">
          {help}
        </p>
      ) : null}
    </div>
  )
})

export default TextField
