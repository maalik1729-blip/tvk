import { cn } from './cn'

/**
 * EmptyState — single recipe for every "nothing here yet" surface.
 * Spec: outputs/04_component_execution_plan.md → Empty State Improvements
 */
export default function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center max-w-md mx-auto py-16 px-6',
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 mb-6 rounded-full bg-surface-2 flex items-center justify-center text-ink-500">
          {icon}
        </div>
      )}
      <h3 className="text-[20px] font-semibold text-ink-900 mb-2">{title}</h3>
      {body && <p className="text-[14px] text-ink-500 mb-6 leading-relaxed">{body}</p>}
      {action}
    </div>
  )
}
