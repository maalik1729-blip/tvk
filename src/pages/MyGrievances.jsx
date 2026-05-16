import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, MapPin, Clock, Activity, CheckCircle2, MessageSquare,
  RefreshCw, ChevronDown, FileText,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Card, StatusChip, EmptyState, cn } from '../components/ui'

/**
 * My Requests — citizen dashboard.
 * Spec: outputs/04 → Dashboard Card Changes + Sidebar Changes
 *       outputs/02 → D1 (action strip) + D2 (30s polling, visibility-aware)
 *                  + D3 (what's-next per ticket) + D4 (mobile pill row)
 */
const POLL_VISIBLE_MS = 30_000

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'open',    label: 'Open' },
  { id: 'active',  label: 'Active' },
  { id: 'closed',  label: 'Closed' },
]

function bucket(status) {
  if (status === 'pending') return 'open'
  if (status === 'accepted' || status === 'processing') return 'active'
  if (status === 'completed' || status === 'rejected') return 'closed'
  return 'open'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function relTime(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(d)
}

/** Derive a one-line "what's next" from status + presence of MLA notes. */
function whatsNext(g) {
  switch (g.status) {
    case 'pending':
      return 'Under review by the MLA office.'
    case 'accepted':
      return 'Accepted. Awaiting assignment to a field team.'
    case 'processing':
      return 'In progress. The assigned team is working on it.'
    case 'completed':
      return g.notes
        ? 'Resolved. Read the closing note below.'
        : 'Resolved.'
    case 'rejected':
      return g.notes
        ? 'Closed without action. Read the reason below.'
        : 'Closed without action.'
    default:
      return 'Status unknown.'
  }
}

export default function MyGrievances() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [showClosed, setShowClosed] = useState(false)
  const [lastFetched, setLastFetched] = useState(null)

  // Fetch + visibility-aware polling.
  useEffect(() => {
    let cancelled = false
    let interval

    async function fetchRequests() {
      try {
        const r = await api.get('/portal/grievances')
        if (cancelled) return
        setRequests(Array.isArray(r.data?.requests) ? r.data.requests : [])
        setLastFetched(new Date())
      } catch {
        /* keep prior state on transient failure */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRequests()
    interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchRequests()
    }, POLL_VISIBLE_MS)

    function onVisible() {
      if (document.visibilityState === 'visible') fetchRequests()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Buckets for the action strip + counts.
  const grouped = useMemo(() => {
    const out = { open: [], active: [], closed: [], awaiting: [] }
    for (const g of requests) {
      const b = bucket(g.status)
      out[b].push(g)
      // crude "awaiting you" heuristic: status pending + > 3 days old
      if (b === 'open') {
        const ageDays = (Date.now() - new Date(g.createdAt).getTime()) / 86_400_000
        if (ageDays > 3) out.awaiting.push(g)
      }
    }
    return out
  }, [requests])

  const counts = {
    all:    requests.length,
    open:   grouped.open.length,
    active: grouped.active.length,
    closed: grouped.closed.length,
  }

  const filtered = useMemo(() => {
    if (filter === 'all')    return requests.filter(r => bucket(r.status) !== 'closed')
    if (filter === 'closed') return grouped.closed
    return grouped[filter] || []
  }, [filter, requests, grouped])

  function refresh() {
    setLoading(true)
    api.get('/portal/grievances')
      .then(r => setRequests(Array.isArray(r.data?.requests) ? r.data.requests : []))
      .catch(() => {})
      .finally(() => { setLoading(false); setLastFetched(new Date()) })
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
      <div className="lg:flex">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex w-[240px] shrink-0 border-r border-hairline bg-surface">
          <nav className="flex flex-col py-4 px-2 gap-0.5 w-full" aria-label="Filter">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-500 uppercase">
              Filter
            </div>
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex items-center gap-3 px-3 h-9 rounded-md w-full text-left text-[14px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                  filter === f.id
                    ? 'text-ink-900 bg-surface-2 relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-brand-red before:rounded-r'
                    : 'text-ink-700 hover:bg-surface-2 hover:text-ink-900',
                )}
              >
                <span className="truncate">{f.label}</span>
                <span className="ml-auto text-[12px] font-semibold text-ink-500">
                  {counts[f.id] ?? 0}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-6 lg:py-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
                  My Requests
                </h1>
                <p className="mt-1 text-[14px] text-ink-500">
                  {user?.name || 'Mylapore resident'} · {requests.length} grievance{requests.length === 1 ? '' : 's'}
                </p>
              </div>
              <Button
                kind="primary"
                size="md"
                iconLeft={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/grievance')}
              >
                New request
              </Button>
            </div>

            {/* Mobile filter pill row */}
            <div
              role="tablist"
              aria-label="Filter"
              className="lg:hidden -mx-4 px-4 mb-5 flex gap-2 overflow-x-auto pb-1"
            >
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                    filter === f.id
                      ? 'bg-ink-900 text-white border border-ink-900'
                      : 'bg-surface text-ink-700 border border-hairline hover:bg-surface-2',
                  )}
                >
                  {f.label}
                  <span className={cn(
                    'text-[11px] font-semibold rounded-sm px-1.5 py-0.5 -mr-1',
                    filter === f.id ? 'bg-white/15 text-white' : 'bg-surface-2 text-ink-500',
                  )}>
                    {counts[f.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Action strip — show only if there are real signals */}
            {(grouped.awaiting.length > 0 || grouped.active.length > 0) && filter !== 'closed' && (
              <Card className="p-4 lg:p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-brand-red" aria-hidden="true" />
                  <span className="text-[12px] font-semibold tracking-wide text-ink-700 uppercase">
                    What needs attention
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
                  {grouped.awaiting.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilter('open')}
                      className="text-left rounded-md px-3 py-2 -mx-3 -my-2 hover:bg-surface-2 transition-colors"
                    >
                      <span className="text-ink-900 font-semibold">Awaiting review</span>{' '}
                      <span className="text-ink-500">({grouped.awaiting.length} older than 3 days)</span>
                    </button>
                  )}
                  {grouped.active.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilter('active')}
                      className="text-left rounded-md px-3 py-2 -mx-3 -my-2 hover:bg-surface-2 transition-colors"
                    >
                      <span className="text-ink-900 font-semibold">In progress</span>{' '}
                      <span className="text-ink-500">({grouped.active.length})</span>
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Refresh meta */}
            {!loading && requests.length > 0 && (
              <div className="flex items-center justify-between text-[12px] text-ink-500 mb-3">
                <span>
                  {lastFetched
                    ? `Checked ${relTime(lastFetched)}`
                    : 'Live updates every 30 seconds'}
                </span>
                <button
                  type="button"
                  onClick={refresh}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  Refresh
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <LoadingState />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-7 h-7" />}
                title={
                  filter === 'all'
                    ? 'Start with your first complaint'
                    : `No ${filter} requests`
                }
                body={
                  filter === 'all'
                    ? 'Most Mylapore residents start with Streetlight or Garbage. Filing takes about a minute and a half.'
                    : 'Try a different filter, or file a new request.'
                }
                action={
                  filter === 'all' ? (
                    <Button
                      kind="primary"
                      size="md"
                      iconLeft={<Plus className="w-4 h-4" />}
                      onClick={() => navigate('/grievance')}
                    >
                      File a grievance
                    </Button>
                  ) : (
                    <Button kind="secondary" size="md" onClick={() => setFilter('all')}>
                      View all
                    </Button>
                  )
                }
              />
            ) : (
              <>
                {/* Active list */}
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filtered
                    .filter(g => filter === 'closed' || bucket(g.status) !== 'closed')
                    .map(g => (
                      <li key={g._id || g.ticketId}>
                        <GrievanceCard g={g} />
                      </li>
                    ))}
                </ul>

                {/* Closed group (only when looking at all/open/active) */}
                {filter !== 'closed' && grouped.closed.length > 0 && (
                  <div className="mt-10">
                    <button
                      type="button"
                      onClick={() => setShowClosed(v => !v)}
                      aria-expanded={showClosed}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-md border border-hairline hover:bg-surface-2 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                    >
                      <span className="text-[14px] font-semibold text-ink-900">
                        Closed ({grouped.closed.length})
                      </span>
                      <ChevronDown
                        className={cn('w-4 h-4 text-ink-500 transition-transform', showClosed && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>

                    {showClosed && (
                      <ul className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {grouped.closed.map(g => (
                          <li key={g._id || g.ticketId}>
                            <GrievanceCard g={g} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── sub-components ──────────────────────────── */

function GrievanceCard({ g }) {
  const isClosed = g.status === 'completed' || g.status === 'rejected'
  return (
    <Card interactive className="p-4 lg:p-5 h-full flex flex-col">
      {/* Top row */}
      <header className="flex items-center justify-between gap-3 mb-2">
        <StatusChip status={g.status} />
        <span className="font-mono text-[11px] text-ink-500 truncate" title={g.ticketId}>
          #{g.ticketId}
        </span>
      </header>

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-ink-900 leading-snug">
        {g.optionTitle || g.optionId || 'Grievance'}
      </h3>

      {/* Category line */}
      {(g.serviceTitle || g.serviceId) && (
        <p className="mt-1 text-[12px] text-ink-500">
          {g.serviceTitle || g.serviceId}
        </p>
      )}

      {/* Description */}
      {g.description && (
        <p className="mt-2 text-[14px] text-ink-700 leading-relaxed line-clamp-2">
          {g.description}
        </p>
      )}

      {/* Location */}
      {g.location && (
        <p className="mt-2 inline-flex items-start gap-1.5 text-[13px] text-ink-500">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{g.location}</span>
        </p>
      )}

      {/* What's next */}
      <p className="mt-3 inline-flex items-start gap-1.5 text-[13px] text-ink-700">
        <Activity className="w-3.5 h-3.5 mt-0.5 text-ink-500 shrink-0" aria-hidden="true" />
        <span>{whatsNext(g)}</span>
      </p>

      {/* MLA note (if any) */}
      {g.notes && (
        <div className="mt-3 rounded-md bg-surface-2 border border-hairline px-3 py-2">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            MLA office note
          </div>
          <p className="text-[13px] text-ink-700 leading-relaxed">{g.notes}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-4 flex items-center justify-between text-[12px] text-ink-500">
        <span className="inline-flex items-center gap-1" title={g.updatedAt || g.createdAt}>
          <Clock className="w-3 h-3" aria-hidden="true" />
          {isClosed
            ? `Closed ${formatDate(g.updatedAt || g.createdAt)}`
            : `Updated ${relTime(g.updatedAt || g.createdAt)}`}
        </span>
      </footer>
    </Card>
  )
}

function LoadingState() {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3" aria-busy="true" aria-live="polite">
      {[0, 1, 2, 3].map(i => (
        <li key={i}>
          <Card className="p-5">
            <div className="h-5 w-20 bg-surface-2 rounded mb-3 animate-pulse" />
            <div className="h-5 w-3/4 bg-surface-2 rounded mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-surface-2 rounded mb-3 animate-pulse" />
            <div className="h-4 w-full bg-surface-2 rounded animate-pulse" />
          </Card>
        </li>
      ))}
    </ul>
  )
}
