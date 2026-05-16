import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react'
import { Button, Card } from '../components/ui'

/**
 * About TVK — clearly labeled party page.
 *
 * This is the ONLY surface in the app where party content lives. It exists
 * specifically to honour outputs/02 N2 ("Separate party content from service
 * content") so the constituency service stays neutral on Landing / Login /
 * Register / Grievance / Track / MyGrievances.
 *
 * Per outputs/05 release readiness:
 * - This page links back to service flows so it never traps the user.
 * - No unverified statistics or campaign claims.
 */
export default function AboutTvk() {
  return (
    <div className="bg-surface text-ink-900">

      {/* Page header */}
      <section className="border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 flex items-center gap-3 text-[13px]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-ink-700 hover:text-ink-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to portal
          </Link>
          <span className="text-ink-400">·</span>
          <span className="text-ink-500">About TVK</span>
        </div>
      </section>

      {/* Disclaimer strip — honours outputs/02 N2 */}
      <section className="bg-surface-2 border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-3 text-[12px] text-ink-500 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-red" aria-hidden="true" />
          <span>
            This page is informational. The grievance portal is a constituency
            service and operates independently of party affiliation.
          </span>
        </div>
      </section>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-12 lg:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">
              Background
            </p>
            <h1 className="mt-3 text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.05] font-bold tracking-[-0.02em] text-ink-900">
              About{' '}
              <span className="relative inline-block">
                Tamilaga Vettri Kazhagam
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-1 h-[6px] bg-brand-yellow/60 rounded-sm z-0"
                />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-[60ch] text-[16px] text-ink-700 leading-relaxed">
              Tamilaga Vettri Kazhagam (TVK) is the Tamil Nadu state
              political party founded in 2024 by{' '}
              <strong>Joseph Vijay</strong>, who currently serves as the{' '}
              <strong>Chief Minister of Tamil Nadu</strong>. This page
              explains the party context for residents who reach the portal
              through the Mylapore office.
            </p>
            <p className="mt-3 max-w-[60ch] text-[15px] text-ink-500 leading-relaxed">
              The Mylapore Grievance Portal is a constituency service. Any
              resident of Mylapore can file a grievance here regardless of
              political affiliation, and every submission is handled on the
              same standard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                as={Link}
                to="/grievance"
                kind="primary"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                File a grievance
              </Button>
              <a
                href="https://www.tvkparty.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-12 px-3 text-[15px] font-medium text-ink-700 hover:text-ink-900 underline underline-offset-4 decoration-ink-400 hover:decoration-ink-700 transition-colors"
              >
                Visit tvkparty.com
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Hero portrait — Vijay (party president) */}
          <div className="relative flex items-center justify-center min-h-[320px]">
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full blur-3xl opacity-40 z-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(245,182,0,0.55), transparent 70%)',
              }}
            />
            <img
              src="/login-right.png"
              alt="Vijay, founder of Tamilaga Vettri Kazhagam"
              width="520"
              height="640"
              className="relative z-10 w-full max-w-[440px] h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 lg:py-20 bg-surface-2 border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">Leadership</p>
            <h2 className="mt-3 text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
              Who you're hearing from.
            </h2>
            <p className="mt-3 text-[15px] text-ink-700 max-w-[60ch]">
              Two roles, one accountable office. Party leadership is informational;
              your grievance is handled by the constituency office.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chief Minister & TVK founder */}
            <Card className="p-6 flex items-start gap-5">
              <img
                src="/login-right.png"
                alt="Joseph Vijay, Chief Minister of Tamil Nadu"
                width="96"
                height="96"
                className="w-24 h-24 rounded-2xl object-cover bg-surface-2 ring-1 ring-hairline shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">
                  Chief Minister, Tamil Nadu
                </p>
                <h3 className="mt-1 text-[20px] font-semibold text-ink-900">
                  Joseph Vijay
                </h3>
                <p className="mt-2 text-[14px] text-ink-700 leading-relaxed">
                  Founder and President of Tamilaga Vettri Kazhagam, and the
                  current Chief Minister of Tamil Nadu.
                </p>
              </div>
            </Card>

            {/* Constituency MLA */}
            <Card className="p-6 flex items-start gap-5">
              <img
                src="/mla.png"
                alt="MLA, Mylapore Assembly Constituency"
                width="96"
                height="96"
                className="w-24 h-24 rounded-2xl object-cover bg-surface-2 ring-1 ring-hairline shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">
                  Constituency MLA
                </p>
                <h3 className="mt-1 text-[20px] font-semibold text-ink-900">
                  MLA, Mylapore
                </h3>
                <p className="mt-2 text-[14px] text-ink-700 leading-relaxed">
                  Runs the Mylapore office. Final accountable owner of every
                  grievance filed through this portal.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Symbol / flag — small, informational */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-ink-500 uppercase">Symbol</p>
            <h2 className="mt-3 text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
              The party flag.
            </h2>
            <p className="mt-3 text-[15px] text-ink-700 max-w-[58ch] leading-relaxed">
              Red and yellow bands with twin elephants flanking a central
              emblem — the official insignia of Tamilaga Vettri Kazhagam.
            </p>
            <p className="mt-4 text-[13px] text-ink-500 max-w-[58ch] leading-relaxed">
              The portal uses a small version of this symbol in the header so
              residents can identify the office at a glance. It appears on
              service pages purely as identification, not endorsement.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/9a355bb7-ad98-488e-8575-f587165170ac.png"
              alt="TVK party flag on a desk stand"
              width="420"
              height="420"
              loading="lazy"
              className="w-full max-w-[360px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(200,16,46,0.18)]"
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA back to service */}
      <section className="py-12 lg:py-16 bg-surface-2 border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-semibold text-ink-900">
              Ready to file a grievance?
            </h3>
            <p className="mt-1 text-[14px] text-ink-700">
              Open to every resident of Mylapore — regardless of party affiliation.
            </p>
          </div>
          <Button
            as={Link}
            to="/grievance"
            kind="primary"
            size="lg"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            File now
          </Button>
        </div>
      </section>
    </div>
  )
}
