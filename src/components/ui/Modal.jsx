import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from './cn'

/**
 * Accessible modal dialog. Renders into <body> via portal.
 * - Closes on Esc and on backdrop click (configurable).
 * - Traps initial focus inside the panel.
 * - Honours prefers-reduced-motion via global CSS.
 *
 * Use <ConfirmDialog/> below for the common yes/no/discard pattern.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',           // 'sm' | 'md' | 'lg'
  closeOnBackdrop = true,
  hideClose = false,
  labelledBy,
  describedBy,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Move initial focus into the panel.
    const t = setTimeout(() => panelRef.current?.focus(), 10)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="presentation"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => closeOnBackdrop && onClose?.()}
        className="absolute inset-0 bg-ink-900/55 backdrop-blur-[2px] animate-[fadeIn_.2s_ease-out]"
      />
      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || (title ? 'modal-title' : undefined)}
        aria-describedby={describedBy || (description ? 'modal-desc' : undefined)}
        tabIndex={-1}
        className={cn(
          'relative w-full mx-3 mb-3 sm:mb-0',
          widths[size] || widths.md,
          'bg-surface rounded-xl shadow-e2 border border-hairline',
          'outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40',
          'animate-[fadeInUp_.25s_cubic-bezier(.22,1,.36,1)]'
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-ink-900 leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="mt-1 text-sm text-ink-500">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={() => onClose?.()}
                aria-label="Close"
                className="shrink-0 -mr-1 -mt-1 p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children && (
          <div className="px-5 py-4 text-[0.95rem] text-ink-700">
            {children}
          </div>
        )}
        {footer && (
          <div className="px-5 pb-5 pt-1 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
