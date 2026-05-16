import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Send, ChevronRight, AlertCircle, Camera, X,
  ExternalLink, FileText, ArrowLeft, CheckCircle2, Info,
  Edit2, Upload, Plus, Search, Phone, ArrowRight,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import LocationPicker from '../components/LocationPicker'
import { Button, Card, TextField, EmptyState, ConfirmDialog, cn } from '../components/ui'

/**
 * Grievance wizard.
 *
 * UX shell rebuilt per outputs/02 (W1, W2, W5) + outputs/03 + outputs/04:
 * - Top step indicator + breadcrumb (instead of destructive sidebar mid-wizard)
 * - One sidebar of categories visible only on phase=CATEGORY (left rail) on lg+
 * - Confirm-discard before silently resetting form state when changing category
 * - Sticky bottom action bar inside content phases on mobile
 * - Single primary action per screen, no bespoke buttons
 *
 * Backend contracts are unchanged: /portal/services + /portal/grievances.
 * The PHASE/FLOWS/LABELS machine and RESOURCE_MAP are preserved verbatim.
 */
const PHASE = {
  CATEGORY: 'category',
  OPTION:   'option',
  CTA:      'cta',      // url / pdf actions terminate here (no ticket)
  DETAILS:  'details',
  LOCATION: 'location',
  PHOTO:    'photo',
  CONFIRM:  'confirm',
}

const FLOWS = {
  url:                    [PHASE.CATEGORY, PHASE.OPTION, PHASE.CTA],
  pdf:                    [PHASE.CATEGORY, PHASE.OPTION, PHASE.CTA],
  ticket:                 [PHASE.CATEGORY, PHASE.OPTION, PHASE.DETAILS,  PHASE.CONFIRM],
  details_then_url:       [PHASE.CATEGORY, PHASE.OPTION, PHASE.DETAILS,  PHASE.CONFIRM],
  location_only_ticket:   [PHASE.CATEGORY, PHASE.OPTION, PHASE.LOCATION, PHASE.CONFIRM],
  location_photos_ticket: [PHASE.CATEGORY, PHASE.OPTION, PHASE.LOCATION, PHASE.PHOTO, PHASE.CONFIRM],
}

const LABELS = {
  url:                    ['Category', 'Issue', 'Resource'],
  pdf:                    ['Category', 'Issue', 'Document'],
  ticket:                 ['Category', 'Issue', 'Details',  'Done'],
  details_then_url:       ['Category', 'Issue', 'Details',  'Done'],
  location_only_ticket:   ['Category', 'Issue', 'Location', 'Done'],
  location_photos_ticket: ['Category', 'Issue', 'Location', 'Photo', 'Done'],
}

const DEFAULT_KIND = 'ticket'
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const RESOURCE_MAP = {
  'Income Certificate Issue': { url: 'https://www.tnesevai.tn.gov.in/Citizen/PortalLogin.aspx', contact: '914440164907' },
  'Disaster Relief': { url: 'https://it.tn.gov.in/en/IT_Infrastructure/Tamilnadu_Disaster_Recovery_Centre', contact: '044-2567 0783' },
  'Death / Birth Certificate': { url: 'https://www.crstn.org/birth_death_tn/', contact: null },
  'Update ration card': { url: 'https://www.tnpds.gov.in/pages/registeracard/register-a-card-status.xhtml', contact: 'https://www.tnpds.gov.in/pages/staticPages/contact-us.xhtml' },
  'Flood Compensation': { url: 'https://www.tnagrisnet.tn.gov.in/login', contact: '044-28583323' },
  'Job Recruitment': { url: 'https://www.tnprivatejobs.tn.gov.in/', contact: '044-22500900 / 044-22500911' },
  'Health': { url: 'https://tnhealth.tn.gov.in/', contact: '044-2231 0989 / 044-2232 1090 / 044-2232 1085 / 044-2234 2142' },
  'Vaccination': { url: 'https://uwin.mohfw.gov.in/home', contact: '0120-4783222' },
  'Basic medicine': { url: 'https://tnhealth.tn.gov.in/dph/dphis.php', contact: null },
  'Tamilnadu camp & others': { url: 'https://www.nhm.tn.gov.in/en/node/6367', contact: '044-29510304' },
  'Legal': { url: 'https://tamilnadu.nalsa.gov.in/', contact: '044-25342834 / 044-25343353 / 044-25343144' },
  "CITIZEN'S CHARTER OF TAMIL NADU POLICE": { url: 'https://eservices.tnpolice.gov.in:8443/archived_cctns/CitizenCharter', contact: '044-24957878 / 044-24958585' },
  'Safety': { url: 'https://dish.tn.gov.in/#/', contact: '044-22502103 / 044-22502104' },
}

export default function GrievanceHome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [phase, setPhase] = useState(PHASE.CATEGORY)
  const [serviceObj, setServiceObj] = useState(null)
  const [optionObj, setOptionObj] = useState(null)
  const [location, setLocation] = useState({ text: '', lat: null, lng: null })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [certified, setCertified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [grievanceId, setGrievanceId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState(null)

  const [services, setServices] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')

  // Single confirm-discard dialog driven by a pending action.
  // Shape: { title, description, confirmLabel, onConfirm } | null
  const [confirm, setConfirm] = useState(null)
  const askConfirm = (cfg) => setConfirm(cfg)
  const closeConfirm = () => setConfirm(null)

  // Fetch service catalog
  useEffect(() => {
    let alive = true
    setCatalogLoading(true); setCatalogError('')
    api.get('/portal/services')
      .then((res) => {
        if (!alive) return
        const srvs = Array.isArray(res.data?.services) ? res.data.services : []
        setServices(srvs)
      })
      .catch((err) => {
        if (alive) setCatalogError(err.response?.data?.error || 'Could not load services. Please retry in a moment.')
      })
      .finally(() => { if (alive) setCatalogLoading(false) })
    return () => { alive = false }
  }, [])

  const action = optionObj?.action || null
  const kind   = action?.kind || DEFAULT_KIND
  const flow   = FLOWS[kind]  || FLOWS[DEFAULT_KIND]
  const labels = LABELS[kind] || LABELS[DEFAULT_KIND]
  const stepIndex = Math.max(0, flow.indexOf(phase))

  /* ────────────────────────── handlers ────────────────────────── */

  const showToast = (msg, ms = 4000) => {
    setToast(msg)
    setTimeout(() => setToast(null), ms)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      showToast('That photo is too large. Please choose one under 10 MB.')
      e.target.value = ''
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => { setImage(null); setImagePreview(null) }

  const handleLocationSelect = useCallback((loc) => setLocation(loc), [])

  const [geoLoading, setGeoLoading] = useState(false)
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.')
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let { latitude, longitude } = pos.coords
        const inIndia = latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 98
        if (!inIndia) { latitude = 13.0827; longitude = 80.2707 }
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&countrycodes=in`)
          const data = await res.json()
          const addr = data.address || {}
          const shortAddr = [addr.road, addr.suburb || addr.neighbourhood, addr.city || addr.town || addr.county, addr.state].filter(Boolean).join(', ')
          setLocation({
            ...location,
            text: shortAddr || data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            lat: latitude, lng: longitude,
            street: addr.road || '',
          })
          if (!inIndia) showToast('Location outside India — defaulted to Chennai.')
        } catch {
          setLocation({ ...location, text: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, lat: latitude, lng: longitude })
        } finally { setGeoLoading(false) }
      },
      (err) => { showToast('Unable to get location: ' + err.message); setGeoLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  // True if user has typed/picked anything that resetDownstream would discard.
  const hasDirtyDownstream = () =>
    title.trim() || description.trim() || location.text || image

  const resetDownstream = () => {
    setLocation({ text: '', lat: null, lng: null })
    setTitle('')
    setDescription('')
    setImage(null); setImagePreview(null)
    setSubmitError('')
    setGrievanceId(null)
    setCertified(false)
  }

  const pickService = (s) => {
    const apply = () => {
      setServiceObj(s); setOptionObj(null); resetDownstream(); setPhase(PHASE.OPTION)
    }
    if (hasDirtyDownstream()) {
      askConfirm({
        title: 'Switch category?',
        description: "The details you've entered will be discarded.",
        confirmLabel: 'Discard & switch',
        tone: 'danger',
        onConfirm: () => { closeConfirm(); apply() },
      })
      return
    }
    apply()
  }

  const pickOption = (o) => {
    const override = RESOURCE_MAP[o.title]
    if (override) {
      o = {
        ...o,
        action: {
          ...(o.action || {}),
          kind: o.action?.kind || 'url',
          url: override.url || o.action?.url,
          contact: override.contact || o.action?.contact,
        },
      }
    }
    setOptionObj(o); resetDownstream()
    const k = o.action?.kind || DEFAULT_KIND
    if (k === 'url' || k === 'pdf') setPhase(PHASE.CTA)
    else setPhase(PHASE.DETAILS)
  }

  const submitTicket = async () => {
    if (!user) {
      showToast('Please sign in to submit a grievance.')
      navigate('/login'); return
    }
    if (!serviceObj || !optionObj) return
    if (!description || !description.trim()) {
      setSubmitError('Please describe the issue before submitting.'); return
    }
    if (!certified) {
      setSubmitError('Please certify the information is accurate before submitting.'); return
    }

    setLoading(true); setSubmitError('')
    try {
      const fd = new FormData()
      fd.append('serviceId',    serviceObj.id)
      fd.append('serviceTitle', serviceObj.title)
      fd.append('optionId',     optionObj.id)
      fd.append('optionTitle',  optionObj.title)
      const fullDescription = title.trim() ? `${title.trim()}\n\n${description.trim()}` : description.trim()
      fd.append('description',  fullDescription)
      fd.append('location',     location.text || '')
      if (location.lat != null) fd.append('lat', location.lat)
      if (location.lng != null) fd.append('lng', location.lng)
      if (image) {
        fd.append('image', image)
      } else {
        // 1×1 transparent PNG placeholder so backend always receives a file part
        const placeholderBlob = await new Promise((resolve) => {
          const canvas = document.createElement('canvas')
          canvas.width = 1; canvas.height = 1
          canvas.toBlob(resolve, 'image/png')
        })
        fd.append('image', placeholderBlob, 'placeholder.png')
      }
      const res = await api.post('/portal/grievances', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setGrievanceId(res.data.grievanceId)
      setPhase(PHASE.CONFIRM)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Could not submit. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ─── breadcrumb back navigation ────────────────────────────── */

  const goBackOneStep = () => {
    const i = flow.indexOf(phase)
    if (i <= 0) return
    setPhase(flow[i - 1])
    setSubmitError('')
  }

  const startOver = () => {
    const apply = () => {
      setServiceObj(null); setOptionObj(null); resetDownstream()
      setPhase(PHASE.CATEGORY)
    }
    if (hasDirtyDownstream() || serviceObj) {
      askConfirm({
        title: 'Start a new grievance?',
        description: 'Your current draft will be cleared.',
        confirmLabel: 'Start over',
        tone: 'danger',
        onConfirm: () => { closeConfirm(); apply() },
      })
      return
    }
    apply()
  }

  /* ──────────────────────────── render ──────────────────────────── */

  return (
    <div className="bg-surface min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60]">
          <div className="bg-ink-900 text-white px-4 h-11 flex items-center gap-3 rounded-md shadow-e2 max-w-[90vw]">
            <AlertCircle className="w-4 h-4 text-status-warning shrink-0" aria-hidden="true" />
            <span className="text-[14px] font-medium">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white shrink-0 ml-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step indicator + breadcrumb */}
      <div className="border-b border-hairline bg-surface sticky top-14 lg:top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 h-12 flex items-center gap-3">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-ink-500 min-w-0 flex-1">
            <button
              type="button"
              onClick={startOver}
              className="rounded-md px-1.5 py-1 hover:bg-surface-2 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
            >
              Categories
            </button>

            {serviceObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                {phase === PHASE.OPTION ? (
                  <span className="text-ink-900 font-medium truncate">{serviceObj.title}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const apply = () => { resetDownstream(); setPhase(PHASE.OPTION) }
                      if (hasDirtyDownstream()) {
                        askConfirm({
                          title: 'Go back to issue selection?',
                          description: 'Your details will be discarded.',
                          confirmLabel: 'Discard & go back',
                          tone: 'danger',
                          onConfirm: () => { closeConfirm(); apply() },
                        })
                        return
                      }
                      setPhase(PHASE.OPTION)
                    }}
                    className="rounded-md px-1.5 py-1 hover:bg-surface-2 hover:text-ink-900 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                  >
                    {serviceObj.title}
                  </button>
                )}
              </>
            )}

            {optionObj && phase !== PHASE.OPTION && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                <span className="text-ink-900 font-medium truncate">{optionObj.title}</span>
              </>
            )}
          </nav>

          {/* Step counter */}
          {flow.length > 1 && phase !== PHASE.CATEGORY && phase !== PHASE.CONFIRM && (
            <span className="text-[12px] font-semibold text-ink-500 shrink-0 hidden sm:inline">
              Step {stepIndex + 1} of {flow.length} · {labels[stepIndex]}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 lg:py-10">

        {/* ───────────────────────── PHASE: CATEGORY ───────────────────────── */}
        {phase === PHASE.CATEGORY && (
          <section>
            <header className="mb-6 lg:mb-8">
              <h1 className="text-[24px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
                What's wrong?
              </h1>
              <p className="mt-1 text-[14px] text-ink-500">
                Pick a category to get started. Filing takes about a minute and a half.
              </p>
            </header>

            {catalogLoading ? (
              <CatalogLoading />
            ) : catalogError ? (
              <Card className="p-6 flex items-start gap-3 border-status-danger/30 bg-status-danger/5">
                <AlertCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-[14px] text-ink-700">{catalogError}</div>
              </Card>
            ) : services.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-7 h-7" />}
                title="No categories available"
                body="Please try again in a few moments."
                action={null}
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {services.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pickService(s)}
                      className={cn(
                        'w-full text-left h-full bg-panel border border-hairline rounded-lg p-4 lg:p-5',
                        'shadow-e1 hover:shadow-e2 hover:border-border-strong transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-10 h-10 rounded-md bg-surface-2 border border-hairline flex items-center justify-center shrink-0">
                          {s.iconUrl ? (
                            <img src={s.iconUrl} alt="" aria-hidden="true" className="w-5 h-5 object-contain" />
                          ) : (
                            <FileText className="w-5 h-5 text-brand-red" aria-hidden="true" />
                          )}
                        </span>
                        <ChevronRight className="ml-auto w-4 h-4 text-ink-400" aria-hidden="true" />
                      </div>
                      <div className="text-[15px] font-semibold text-ink-900 leading-snug">
                        {s.title}
                      </div>
                      {s.description && (
                        <p className="mt-1 text-[13px] text-ink-500 line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ───────────────────────── PHASE: OPTION ───────────────────────── */}
        {phase === PHASE.OPTION && serviceObj && (
          <section>
            <header className="mb-6">
              <h1 className="text-[22px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
                Which issue under <span className="text-brand-red">{serviceObj.title}</span>?
              </h1>
              <p className="mt-1 text-[14px] text-ink-500">
                Choose the option that best describes your situation.
              </p>
            </header>

            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {(serviceObj.options || []).map((opt, i) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => pickOption(opt)}
                    className={cn(
                      'w-full text-left h-full bg-panel border border-hairline rounded-lg p-4 lg:p-5',
                      'shadow-e1 hover:shadow-e2 hover:border-border-strong transition-all',
                      'flex items-center gap-4',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                    )}
                  >
                    <span className="w-10 h-10 rounded-md bg-surface-2 border border-hairline flex items-center justify-center shrink-0 text-[13px] font-semibold text-ink-700">
                      {opt.iconUrl ? (
                        <img src={opt.iconUrl} alt="" aria-hidden="true" className="w-5 h-5 object-contain" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-ink-900 leading-snug truncate">
                        {opt.title}
                      </div>
                      {opt.description && (
                        <p className="mt-0.5 text-[13px] text-ink-500 line-clamp-2">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex">
              <Button kind="ghost" iconLeft={<ArrowLeft className="w-4 h-4" />} onClick={goBackOneStep}>
                Back to categories
              </Button>
            </div>
          </section>
        )}

        {/* ───────────────────────── PHASE: CTA (url/pdf) ───────────────────────── */}
        {phase === PHASE.CTA && optionObj && action && (
          <section className="max-w-[640px] mx-auto">
            <Card className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-md bg-surface-2 border border-hairline flex items-center justify-center">
                  {kind === 'pdf'
                    ? <FileText className="w-5 h-5 text-brand-red" aria-hidden="true" />
                    : <ExternalLink className="w-5 h-5 text-brand-red" aria-hidden="true" />}
                </span>
                <h2 className="text-[20px] font-semibold text-ink-900">
                  {kind === 'pdf' ? 'Download document' : 'Open service portal'}
                </h2>
              </div>

              <p className="text-[14px] text-ink-700 leading-relaxed">
                <strong className="text-ink-900">{optionObj.title}</strong> is handled by an
                external government portal. We'll send you there in a new tab — no ticket
                is created on the Mylapore Portal for this kind of request.
              </p>

              {action.contact && (
                <div className="mt-5 rounded-md bg-surface-2 border border-hairline p-3 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-ink-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase mb-0.5">Contact</div>
                    <div className="text-[14px] text-ink-700">{action.contact}</div>
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button kind="ghost" iconLeft={<ArrowLeft className="w-4 h-4" />} onClick={goBackOneStep}>
                  Back
                </Button>
                <Button
                  kind="primary"
                  size="md"
                  as="a"
                  href={kind === 'pdf' ? action.pdfUrl : action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  iconRight={<ExternalLink className="w-4 h-4" />}
                >
                  {kind === 'pdf' ? 'Open document' : (action.ctaLabel || 'Open portal')}
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* ───────────────────────── PHASE: DETAILS ───────────────────────── */}
        {phase === PHASE.DETAILS && optionObj && (
          <section className="max-w-[760px] mx-auto">
            <header className="mb-6">
              <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
                Tell us what's happening
              </h1>
              <p className="mt-1 text-[14px] text-ink-500">
                A short title and a clear description help the team triage faster.
              </p>
            </header>

            <Card className="p-5 lg:p-7">
              <div className="flex flex-col gap-5">
                <TextField
                  label="Short title"
                  example="Damaged streetlight on N. Mada Street"
                  optional
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                  help={`${title.length}/80`}
                />

                <div className="flex flex-col gap-2">
                  <label htmlFor="g-desc" className="text-[12px] font-semibold tracking-wide text-ink-700">
                    Description
                  </label>
                  <textarea
                    id="g-desc"
                    rows={5}
                    maxLength={1500}
                    placeholder="Describe the issue — what's wrong, how long it's been happening, any other details that help."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-describedby="g-desc-help"
                    className={cn(
                      'w-full px-3 py-3 rounded-md bg-panel text-[15px] text-ink-900',
                      'border border-hairline transition-colors',
                      'placeholder:text-ink-400',
                      'hover:border-border-strong',
                      'focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/15',
                      'resize-y min-h-[120px]',
                    )}
                  />
                  <p id="g-desc-help" className="text-[13px] text-ink-500">
                    {description.length}/1500 characters
                  </p>
                </div>

                {/* Optional location capture */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-wide text-ink-700 flex items-center gap-2">
                    <span>Location</span>
                    <span className="font-normal text-ink-500">Optional</span>
                  </label>
                  <div className="flex items-stretch gap-2">
                    <input
                      type="text"
                      placeholder="Street, landmark, or area"
                      value={location.text || ''}
                      onChange={(e) => setLocation({ ...location, text: e.target.value })}
                      className={cn(
                        'flex-1 h-11 sm:h-10 px-3 rounded-md bg-panel text-[15px] text-ink-900',
                        'border border-hairline transition-colors',
                        'placeholder:text-ink-400',
                        'hover:border-border-strong',
                        'focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/15',
                      )}
                    />
                    <Button
                      kind="secondary"
                      size="md"
                      onClick={fetchCurrentLocation}
                      loading={geoLoading}
                      iconLeft={<MapPin className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Use my location</span>
                      <span className="sm:hidden">GPS</span>
                    </Button>
                  </div>
                  <p className="text-[12px] text-ink-500">
                    Sharing location helps the field team reach the right spot.
                  </p>
                </div>
              </div>
            </Card>

            {/* Sticky bottom action */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button kind="ghost" iconLeft={<ArrowLeft className="w-4 h-4" />} onClick={goBackOneStep}>
                Back
              </Button>
              <Button
                kind="primary"
                size="md"
                disabled={!description.trim()}
                onClick={() => setPhase(PHASE.CONFIRM)}
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                Continue to review
              </Button>
            </div>
          </section>
        )}

        {/* ───────────────────────── PHASE: LOCATION ───────────────────────── */}
        {phase === PHASE.LOCATION && optionObj && (
          <section className="max-w-[760px] mx-auto">
            <header className="mb-6">
              <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
                Where is the issue?
              </h1>
              <p className="mt-1 text-[14px] text-ink-500">
                Use GPS, drop a pin, or type the address. Precise locations resolve faster.
              </p>
            </header>

            <Card className="p-5 lg:p-7">
              <LocationPicker onLocationSelect={handleLocationSelect} />

              {location.text && (
                <div className="mt-5 rounded-md bg-surface-2 border border-hairline p-3 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-red mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase mb-0.5">
                      Selected
                    </div>
                    <div className="text-[14px] text-ink-700 break-words">{location.text}</div>
                  </div>
                </div>
              )}
            </Card>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button kind="ghost" iconLeft={<ArrowLeft className="w-4 h-4" />} onClick={goBackOneStep}>
                Back
              </Button>
              {kind === 'location_photos_ticket' ? (
                <Button
                  kind="primary"
                  size="md"
                  disabled={!location.text}
                  onClick={() => setPhase(PHASE.PHOTO)}
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to photo
                </Button>
              ) : (
                <Button
                  kind="primary"
                  size="md"
                  disabled={!location.text}
                  loading={loading}
                  onClick={submitTicket}
                  iconRight={<Send className="w-4 h-4" />}
                >
                  {loading ? 'Submitting' : 'Submit'}
                </Button>
              )}
            </div>
          </section>
        )}

        {/* ───────────────────────── PHASE: PHOTO ───────────────────────── */}
        {phase === PHASE.PHOTO && optionObj && (
          <section className="max-w-[640px] mx-auto">
            <header className="mb-6">
              <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
                Add a photo
              </h1>
              <p className="mt-1 text-[14px] text-ink-500">
                Optional — tickets with a photo are usually faster to verify. Avoid faces and licence plates if you can.
              </p>
            </header>

            <Card className="p-5 lg:p-7">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Photo preview"
                    className="w-full max-h-[360px] object-cover rounded-md border border-hairline"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-panel border border-hairline shadow-e1 flex items-center justify-center hover:bg-surface-2 transition-colors"
                  >
                    <X className="w-4 h-4 text-ink-700" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-hairline rounded-md py-12 px-6 cursor-pointer hover:border-border-strong hover:bg-surface-2 transition-colors">
                  <Upload className="w-6 h-6 text-ink-500" aria-hidden="true" />
                  <span className="text-[14px] font-semibold text-ink-900">
                    Drag a photo here, or browse
                  </span>
                  <span className="text-[12px] text-ink-500">JPG / PNG · Max 10 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {submitError && (
                <div role="alert" className="mt-4 rounded-md border border-status-danger/30 bg-status-danger/5 p-3 flex items-start gap-2 text-[13px] text-ink-700">
                  <AlertCircle className="w-4 h-4 text-status-danger mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}
            </Card>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button kind="ghost" iconLeft={<ArrowLeft className="w-4 h-4" />} onClick={goBackOneStep}>
                Back
              </Button>
              <Button
                kind="primary"
                size="md"
                loading={loading}
                onClick={submitTicket}
                iconRight={<Send className="w-4 h-4" />}
              >
                {loading ? 'Submitting' : 'Submit grievance'}
              </Button>
            </div>
          </section>
        )}

        {/* ───────────────────────── PHASE: CONFIRM ───────────────────────── */}
        {phase === PHASE.CONFIRM && (
          grievanceId
            ? <SuccessView
                grievanceId={grievanceId}
                serviceObj={serviceObj}
                optionObj={optionObj}
                title={title}
                description={description}
                location={location}
                imagePreview={imagePreview}
                onTrack={() => navigate('/track')}
                onNew={startOver}
                userName={user?.name}
              />
            : <ReviewView
                serviceObj={serviceObj}
                optionObj={optionObj}
                title={title}
                description={description}
                location={location}
                imagePreview={imagePreview}
                certified={certified}
                setCertified={setCertified}
                submitError={submitError}
                loading={loading}
                onEdit={() => setPhase(PHASE.DETAILS)}
                onSubmit={submitTicket}
                onPickPhoto={handleImageChange}
                onRemovePhoto={removeImage}
              />
        )}
      </div>

      {/* Confirm-discard dialog (replaces native confirms across the wizard) */}
      <ConfirmDialog
        open={!!confirm}
        onClose={closeConfirm}
        onConfirm={confirm?.onConfirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        tone={confirm?.tone || 'primary'}
      />
    </div>
  )
}

/* ──────────────────────────── sub-views ──────────────────────────── */

function CatalogLoading() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4" aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <li key={i}>
          <Card className="p-5">
            <div className="w-10 h-10 rounded-md bg-surface-2 mb-4 animate-pulse" />
            <div className="h-4 w-3/4 bg-surface-2 rounded mb-2 animate-pulse" />
            <div className="h-3 w-1/2 bg-surface-2 rounded animate-pulse" />
          </Card>
        </li>
      ))}
    </ul>
  )
}

function ReviewView({
  serviceObj, optionObj, title, description, location, imagePreview,
  certified, setCertified, submitError, loading,
  onEdit, onSubmit, onPickPhoto, onRemovePhoto,
}) {
  return (
    <section className="max-w-[760px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.015em] text-ink-900">
          Review and submit
        </h1>
        <p className="mt-1 text-[14px] text-ink-500">
          Quick check before we send this to the MLA office.
        </p>
      </header>

      {/* Summary */}
      <Card className="p-5 lg:p-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-ink-900">Summary</h2>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-700 hover:text-ink-900 rounded-md px-2 py-1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
            Edit
          </button>
        </div>

        <dl className="divide-y divide-hairline text-[14px]">
          <ReviewRow term="Category" desc={serviceObj?.title} />
          <ReviewRow term="Issue"    desc={optionObj?.title} />
          {title && <ReviewRow term="Title" desc={title} />}
          <ReviewRow term="Description" desc={description || <span className="text-ink-400">No description</span>} multiline />
          {location.text && <ReviewRow term="Location" desc={location.text} multiline />}
        </dl>
      </Card>

      {/* Photo */}
      <Card className="p-5 lg:p-7 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-ink-900">Photo</h2>
            <p className="text-[12px] text-ink-500 mt-0.5">Optional — usually speeds up resolution.</p>
          </div>
        </div>
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Photo" className="w-full max-h-[280px] object-cover rounded-md border border-hairline" />
            <button
              type="button"
              onClick={onRemovePhoto}
              aria-label="Remove photo"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-panel border border-hairline shadow-e1 flex items-center justify-center hover:bg-surface-2 transition-colors"
            >
              <X className="w-4 h-4 text-ink-700" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 border border-dashed border-hairline rounded-md p-4 cursor-pointer hover:bg-surface-2 transition-colors">
            <Camera className="w-5 h-5 text-ink-500" aria-hidden="true" />
            <span className="text-[14px] text-ink-700">Add a photo</span>
            <span className="text-[12px] text-ink-500 ml-auto">Max 10 MB</span>
            <input type="file" accept="image/*" className="sr-only" onChange={onPickPhoto} />
          </label>
        )}
      </Card>

      {/* Process transparency */}
      <Card className="p-5 lg:p-7 mt-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-ink-500 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-[13px] text-ink-700 leading-relaxed">
            <p className="font-semibold text-ink-900 mb-1">What happens next</p>
            <p>
              The MLA office reviews submissions within 24 hours and assigns a named owner.
              You'll see every status change on the <strong>My Requests</strong> dashboard.
            </p>
          </div>
        </div>
      </Card>

      {/* Certify + submit */}
      <Card className="p-5 lg:p-7 mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertified(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border border-border-strong text-brand-red focus:ring-2 focus:ring-brand-red/30"
          />
          <span className="text-[13px] text-ink-700 leading-relaxed">
            I certify that the information above is accurate and pertains to a genuine public grievance.
          </span>
        </label>

        {submitError && (
          <div role="alert" className="mt-4 rounded-md border border-status-danger/30 bg-status-danger/5 p-3 flex items-start gap-2 text-[13px] text-ink-700">
            <AlertCircle className="w-4 h-4 text-status-danger mt-0.5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end sm:gap-3 gap-3">
          <Button kind="ghost" onClick={onEdit}>
            Back to details
          </Button>
          <Button
            kind="primary"
            size="md"
            disabled={!certified}
            loading={loading}
            onClick={onSubmit}
            iconRight={<Send className="w-4 h-4" />}
          >
            {loading ? 'Submitting' : 'Submit grievance'}
          </Button>
        </div>
      </Card>
    </section>
  )
}

function ReviewRow({ term, desc, multiline }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="sm:w-32 text-ink-500 shrink-0 text-[13px]">{term}</dt>
      <dd className={cn('text-ink-900 flex-1 min-w-0', multiline && 'whitespace-pre-line break-words')}>
        {desc}
      </dd>
    </div>
  )
}

function SuccessView({
  grievanceId, serviceObj, optionObj, title, description, location,
  imagePreview, onTrack, onNew, userName,
}) {
  return (
    <section className="max-w-[760px] mx-auto">
      <Card className="p-6 lg:p-8">
        {/* Acknowledge the user, not the institution (outputs/02 P3) */}
        <div className="flex items-start gap-3 mb-6">
          <span className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-status-success" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase mb-1">
              Submitted
            </p>
            <h1 className="text-[22px] lg:text-[26px] font-bold tracking-[-0.015em] text-ink-900 leading-tight">
              {userName ? `Thanks, ${userName}.` : 'Thanks.'}{' '}
              <span className="font-medium text-ink-700">
                Your complaint about <strong className="text-ink-900">{optionObj?.title || 'this issue'}</strong> is now with the MLA's office.
              </span>
            </h1>
          </div>
        </div>

        {/* Reference */}
        <div className="rounded-md bg-surface-2 border border-hairline p-4 mb-6">
          <div className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase mb-1">
            Your reference
          </div>
          <div className="font-mono text-[20px] lg:text-[24px] font-semibold text-ink-900 break-all select-all">
            {grievanceId}
          </div>
          <p className="mt-2 text-[13px] text-ink-500">
            Save this reference. You'll see live status on the My Requests page.
          </p>
        </div>

        {/* Submitted details */}
        <h2 className="text-[14px] font-semibold text-ink-700 mb-3">Submitted details</h2>
        <dl className="divide-y divide-hairline text-[13px] mb-6">
          <ReviewRow term="Category" desc={serviceObj?.title} />
          <ReviewRow term="Issue"    desc={optionObj?.title} />
          {title && <ReviewRow term="Title" desc={title} />}
          {description && <ReviewRow term="Description" desc={description} multiline />}
          {location.text && <ReviewRow term="Location" desc={location.text} multiline />}
        </dl>

        {/* What's next timeline */}
        <h2 className="text-[14px] font-semibold text-ink-700 mb-3">What happens next</h2>
        <ol className="space-y-3 text-[13px] mb-7">
          <TimelineStep n="1" title="Reviewed within 24 hours" body="A team at the MLA office reads every submission before it's routed." />
          <TimelineStep n="2" title="Assigned to a person" body="You'll see who is responsible for resolving it." />
          <TimelineStep n="3" title="Closed with a note" body="When the work is done you'll see what was done, by whom, and when." />
        </ol>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button kind="secondary" iconLeft={<Plus className="w-4 h-4" />} onClick={onNew}>
            File another
          </Button>
          <Button kind="primary" iconLeft={<Search className="w-4 h-4" />} onClick={onTrack}>
            Track my requests
          </Button>
        </div>
      </Card>
    </section>
  )
}

function TimelineStep({ n, title, body }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-brand-red/10 text-brand-red text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </span>
      <div>
        <div className="font-semibold text-ink-900">{title}</div>
        <p className="text-ink-500 leading-relaxed">{body}</p>
      </div>
    </li>
  )
}
