import { cn } from './cn'

/**
 * Single status chip recipe — six tones, identical shape.
 * Spec: outputs/03_visual_redesign_direction.md → Color Hierarchy → Status chip palette
 */
const TONES = {
  open: {
    label: 'Open',
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#9A3412]',
    dot: 'bg-[#F97316]',
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#3B82F6]',
  },
  processing: {
    label: 'In progress',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#3B82F6] animate-pulse',
  },
  completed: {
    label: 'Resolved',
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#065F46]',
    dot: 'bg-[#10B981]',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#991B1B]',
    dot: 'bg-[#EF4444]',
  },
  awaiting: {
    label: 'Awaiting you',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#92400E]',
    dot: 'bg-[#F59E0B]',
  },
}

// Convenience aliases for the existing API status strings.
const STATUS_TO_TONE = {
  pending: 'open',
  open: 'open',
  accepted: 'accepted',
  processing: 'processing',
  in_progress: 'processing',
  completed: 'completed',
  resolved: 'completed',
  rejected: 'rejected',
  awaiting: 'awaiting',
  awaiting_user: 'awaiting',
}

export default function StatusChip({ status, tone, label, className }) {
  const t = TONES[tone || STATUS_TO_TONE[status] || 'open']
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-[22px] px-2 rounded-sm',
        'text-[11px] font-semibold tracking-wide',
        t.bg,
        t.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.dot)} aria-hidden="true" />
      {label || t.label}
    </span>
  )
}
