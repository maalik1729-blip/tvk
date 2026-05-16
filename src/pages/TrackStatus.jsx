import { useEffect, useState } from 'react'
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react'
import api from '../lib/api'
import { Button, Card, StatusChip, TextField, EmptyState } from '../components/ui'

/**
 * Track Status — single-column lookup by ticket ID.
 * Spec: outputs/02 → W4 (drop the destructive sidebar; promote a clean lookup).
 *       outputs/04 → forms primitive + StatusChip.
 *
 * The endpoint is auth-scoped, so only the current user's tickets resolve.
 */
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function whatsNext(g) {
  switch (g.status) {
    case 'pending':    return 'Under review by the MLA office.'
    case 'accepted':   return 'Accepted. Awaiting assignment to a field team.'
    case 'processing': return 'In progress. The assigned team is working on it.'
    case 'completed':  return g.notes ? 'Resolved. Read the closing note below.' : 'Resolved.'
    case 'rejected':   return g.notes ? 'Closed without action. Read the reason below.' : 'Closed without action.'
    default:           return 'Status unknown.'
  }
}

export default function TrackStatus() {
  const [trackId,  setTrackId]  = useState('')
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [recent,   setRecent]   = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  // Pull a small list of recent grievances so the user always has an entry
  // point even if they don't remember a ticket ID.
  useEffect(() => {
    let alive = true
    api.get('/portal/grievances')
      .then(r => {
        if (!alive) return
        const list = Array.isArray(r.data?.requests) ? r.data.requests : []
        setRecent(list.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => { if (alive) setRecentLoading(false) })
    return () => { alive = false }
  }, [])

  async function handleTrack(e) {
    e.preventDefault()
    setError(''); setResult(null)
    const cleanId = trackId.trim().toUpperCase().replace('#', '')
    if (!cleanId) { setError('Please enter a grievance reference.'); return }

    setLoading(true)
    try {
      const { data } = await api.get(`/portal/grievances/${encodeURIComponent(cleanId)}`)
      setResult(data.request)
    } catch (err) {
      const status = err.response?.status
      if (status === 404) setError(`No grievance found with reference "${cleanId}".`)
      else setError(err.response?.data?.error || 'Could not look up that reference. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function lookupByTicket(id) {
    setTrackId(id)
    // submit programmatically by simulating the flow
    setError(''); setResult(null); setLoading(true)
    api.get(`/portal/grievances/${encodeURIComponent(id)}`)
      .then(({ data }) => setResult(data.request))
      .catch(err => {
        const status = err.response?.status
        if (status === 404) setError(`No grievance found with reference "${id}".`)
        else setError(err.response?.data?.error || 'Could not look up that reference.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
      <div className="max-w-[820px] mx-auto px-4 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
            Track a grievance
          </h1>
          <p className="mt-1 text-[14px] text-ink-500">
            Enter a reference ID, or pick from your recent submissions below.
          </p>
        </div>

        {/* Search form */}
        <Card className="p-4 lg:p-6 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row sm:items-end gap-3">
            <TextField
              label="Reference ID"
              example="MYL-2026-04B-1287"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              error={error}
              iconLeft={<Search className="w-4 h-4" aria-hidden="true" />}
              className="flex-1"
            />
            <Button kind="primary" size="md" type="submit" loading={loading} as="button">
              {loading ? 'Looking up' : 'Track'}
            </Button>
          </form>
        </Card>

        {/* Result */}
        {result && (
          <Card className="p-5 lg:p-6 mb-10">
            <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <StatusChip status={result.status} />
              <span className="font-mono text-[12px] text-ink-500">#{result.ticketId}</span>
            </header>

            <h2 className="text-[18px] font-semibold text-ink-900 leading-snug">
              {result.optionTitle || result.optionId}
            </h2>
            {(result.serviceTitle || result.serviceId) && (
              <p className="mt-1 text-[12px] text-ink-500">
                {result.serviceTitle || result.serviceId}
              </p>
            )}

            <p className="mt-3 inline-flex items-start gap-1.5 text-[13px] text-ink-700">
              <Activity className="w-3.5 h-3.5 mt-0.5 text-ink-500 shrink-0" aria-hidden="true" />
              <span>{whatsNext(result)}</span>
            </p>

            {result.location && (
              <p className="mt-3 inline-flex items-start gap-1.5 text-[13px] text-ink-500">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{result.location}</span>
              </p>
            )}

            {result.description && (
              <div className="mt-4 rounded-md bg-surface-2 border border-hairline px-3 py-2 text-[13px] text-ink-700 leading-relaxed">
                {result.description}
              </div>
            )}

            {result.notes && (
              <div className="mt-3 rounded-md bg-surface-2 border border-hairline px-3 py-2">
                <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  MLA office note
                </div>
                <p className="text-[13px] text-ink-700 leading-relaxed">{result.notes}</p>
              </div>
            )}

            <footer className="mt-5 pt-4 border-t border-hairline flex items-center gap-2 text-[12px] text-ink-500">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Filed {formatDate(result.createdAt)}
              {result.updatedAt && result.updatedAt !== result.createdAt && (
                <> · Updated {formatDate(result.updatedAt)}</>
              )}
            </footer>
          </Card>
        )}

        {/* Recent submissions list */}
        {!result && (
          <section>
            <h3 className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase mb-3">
              Your recent submissions
            </h3>

            {recentLoading ? (
              <Card className="p-6 text-[14px] text-ink-500">Loading…</Card>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={<Search className="w-6 h-6" />}
                title="No grievances yet"
                body="Once you've filed a grievance you'll find it here for one-tap tracking."
                action={null}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-3">
                {recent.map(g => (
                  <li key={g._id || g.ticketId}>
                    <button
                      type="button"
                      onClick={() => lookupByTicket(g.ticketId)}
                      className="w-full text-left rounded-lg border border-hairline bg-panel hover:bg-surface-2 transition-colors p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <StatusChip status={g.status} />
                        <span className="font-mono text-[11px] text-ink-500">#{g.ticketId}</span>
                      </div>
                      <div className="text-[14px] font-medium text-ink-900 truncate">
                        {g.optionTitle || g.optionId || 'Grievance'}
                      </div>
                      <div className="text-[12px] text-ink-500 mt-0.5">
                        Filed {formatDate(g.createdAt)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
