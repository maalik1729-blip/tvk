import { Link } from 'react-router-dom'
import {
  ArrowRight, FileText, Search, Eye, MapPin, Camera,
  CheckCircle2, Lightbulb, ShieldCheck, Phone,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useLang } from '../i18n'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

/**
 * Landing page — service-first, calm, civic.
 * Spec: outputs/03 → "Strip the hero to five elements maximum"
 *       outputs/04 → Landing simplification
 *       outputs/05 → no unverified claims, no zero-stats
 *
 * Sections (in order):
 *   1. Hero (5 elements: eyebrow · headline · subhead · primary CTA · secondary)
 *   2. How it works (3 steps)
 *   3. What you can do (services)
 *   4. Process transparency strip (replaces the headline "7-day SLA" promise)
 *   5. Final CTA
 */
export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useLang()

  const isLoggedIn = !!user

  return (
    <div className="bg-surface text-ink-900">

      {/* ───────────────────────────── HERO ───────────────────────────── */}
      <section className="relative">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pt-12 pb-20 lg:pt-24 lg:pb-32 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div className="max-w-3xl">

            {/* (1) Eyebrow — single trust microcopy line, calm */}
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide text-ink-500">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
              <span>Official portal · MLA, Mylapore Assembly Constituency</span>
            </p>

            {/* (2) Headline */}
            <h1 className="mt-5 text-[36px] sm:text-[44px] lg:text-[56px] leading-[1.05] font-bold tracking-[-0.02em] text-ink-900">
              File a civic grievance.
              <br className="hidden sm:block" />
              <span className="relative inline-block">
                Track it to resolution.
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-1 h-[6px] bg-brand-yellow/60 rounded-sm -z-10"
                />
              </span>
            </h1>

            {/* (3) Subhead */}
            <p className="mt-6 max-w-[60ch] text-[16px] lg:text-[17px] leading-relaxed text-ink-700">
              A direct line to the MLA's office for residents of Mylapore.
              Report what's wrong, share your location, and follow each step
              from <em>received</em> to <em>resolved</em>.
            </p>

            {/* (4) + (5) CTAs — primary + one secondary link */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                as={Link}
                to={isLoggedIn ? '/grievance' : '/register'}
                kind="primary"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {isLoggedIn ? 'File a grievance' : 'Get started'}
              </Button>
              <Link
                to={isLoggedIn ? '/my-grievances' : '/login'}
                className="inline-flex items-center gap-1.5 h-12 px-3 text-[15px] font-medium text-ink-700 hover:text-ink-900 underline underline-offset-4 decoration-ink-400 hover:decoration-ink-700 transition-colors"
              >
                {isLoggedIn ? 'View my requests' : 'Sign in'}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Hero artwork — TVK flag, decorative, lg+ only */}
          <div className="hidden lg:flex items-center justify-center relative min-h-[320px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full blur-3xl opacity-30 z-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(245,182,0,0.45), transparent 70%)',
              }}
            />
            <img
              src="/9a355bb7-ad98-488e-8575-f587165170ac.png"
              alt="TVK party flag"
              width="420"
              height="420"
              className="relative z-10 w-full max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(200,16,46,0.18)]"
            />
          </div>
        </div>

        {/* Single accent stroke — not a wallpaper */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-hairline" />
      </section>

      {/* ───────────────────────── HOW IT WORKS ────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-24 bg-surface-2 border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">How it works</p>
            <h2 className="mt-3 text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
              Three steps. About a minute and a half.
            </h2>
            <p className="mt-3 text-[15px] text-ink-700 max-w-[60ch]">
              You don't need a reference number, a printed form, or a queue.
              Just a phone and a quick description of the issue.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                Icon: FileText,
                title: 'What\'s wrong?',
                body: 'Pick a category and tell us briefly what\'s happening.',
              },
              {
                n: '02',
                Icon: MapPin,
                title: 'Where & details',
                body: 'Share your location (GPS, map, or address) and add a photo if you have one.',
              },
              {
                n: '03',
                Icon: CheckCircle2,
                title: 'Submit & track',
                body: 'You\'ll get a short reference. Watch every step from the dashboard.',
              },
            ].map(s => (
              <li key={s.n}>
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-semibold tracking-wide text-ink-500">{s.n}</span>
                    <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
                    <s.Icon className="w-5 h-5 text-brand-red" aria-hidden="true" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink-900 leading-snug">{s.title}</h3>
                  <p className="mt-2 text-[14px] text-ink-700 leading-relaxed">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ──────────────────────── WHAT YOU CAN DO ──────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">What you can do</p>
            <h2 className="mt-3 text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
              Three jobs. One portal.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              Icon={FileText}
              title="File a grievance"
              body="Report a civic issue with location and (optional) photo. You'll get a short reference."
              cta="File now"
              to={isLoggedIn ? '/grievance' : '/register'}
            />
            <ServiceCard
              Icon={Search}
              title="Track status"
              body="See exactly where your complaint is — received, reviewed, in progress, or resolved."
              cta="Track"
              to={isLoggedIn ? '/track' : '/login'}
            />
            <ServiceCard
              Icon={Eye}
              title="View MLA response"
              body="Read official updates and resolution notes from the MLA's office, on every ticket."
              cta="My requests"
              to={isLoggedIn ? '/my-grievances' : '/login'}
            />
          </div>
        </div>
      </section>

      {/* ───────────────── PROCESS TRANSPARENCY (no SLA promise) ────────────────── */}
      <section className="py-16 lg:py-20 bg-surface-2 border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessStep
              n="A"
              title="Reviewed within 24 hours"
              body="Every submission is read by a team at the MLA office before it's routed."
            />
            <ProcessStep
              n="B"
              title="Assigned to a person"
              body="Your complaint gets a named owner — engineer, official, or the office directly."
            />
            <ProcessStep
              n="C"
              title="Closed with a note"
              body="When the work is done you'll see what was done, by whom, and when."
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FINAL CTA ─────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[820px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-[28px] lg:text-[36px] font-bold tracking-[-0.015em] text-ink-900">
            Have a civic issue?
          </h2>
          <p className="mt-4 text-[15px] text-ink-700 max-w-[55ch] mx-auto">
            Filing takes about a minute and a half. You'll see exactly what happens next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              as={Link}
              to={isLoggedIn ? '/grievance' : '/register'}
              kind="primary"
              size="lg"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              {isLoggedIn ? 'File a grievance' : 'Get started'}
            </Button>
            <a
              href="tel:1100"
              className="inline-flex items-center gap-1.5 h-12 px-3 text-[15px] font-medium text-ink-700 hover:text-ink-900 transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Or call helpline 1100
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ──────────────────────────── sub-components ──────────────────────────── */

function ServiceCard({ Icon, title, body, cta, to }) {
  return (
    <Card interactive className="p-6 flex flex-col h-full">
      <div className="w-10 h-10 rounded-md bg-surface-2 border border-hairline flex items-center justify-center mb-5">
        <Icon className="w-5 h-5 text-brand-red" aria-hidden="true" />
      </div>
      <h3 className="text-[18px] font-semibold text-ink-900 leading-snug">{title}</h3>
      <p className="mt-2 text-[14px] text-ink-700 leading-relaxed flex-1">{body}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-900 hover:text-brand-red transition-colors group/cta"
      >
        {cta}
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-0.5" aria-hidden="true" />
      </Link>
    </Card>
  )
}

function ProcessStep({ n, title, body }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-brand-red/10 text-brand-red text-[12px] font-bold flex items-center justify-center">
          {n}
        </span>
        <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-semibold text-ink-900 leading-snug">{title}</h3>
      <p className="mt-2 text-[14px] text-ink-700 leading-relaxed">{body}</p>
    </div>
  )
}
