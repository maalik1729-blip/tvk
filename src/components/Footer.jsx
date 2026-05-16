import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

/**
 * Service-first footer.
 * Spec: outputs/04 → Footer simplification + outputs/02 → N2 (separate party
 * content from service content) + outputs/05 → release readiness "publisher
 * block".
 *
 * Three columns: Services · Help · Policies. Plus a single "About TVK" link
 * tucked into the meta row so the constituency service stays neutral.
 */
const COLUMNS = [
  {
    title: 'Services',
    links: [
      { label: 'File a grievance', to: '/grievance' },
      { label: 'Track status',     to: '/track' },
      { label: 'My requests',      to: '/my-grievances' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'How it works',     to: '/#how-it-works' },
      { label: 'FAQ',              to: '/#faq' },
      { label: 'Contact MLA office', href: 'tel:+914424993000' },
      { label: 'Helpline 1100',    href: 'tel:1100' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy policy',   to: '/privacy' },
      { label: 'Terms of use',     to: '/terms' },
      { label: 'Accessibility',    to: '/accessibility' },
      { label: 'RTI',              to: '/rti' },
    ],
  },
]

export default function Footer() {
  const scrollTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-surface border-t border-hairline mt-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand block */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
                alt=""
                aria-hidden="true"
                width="32"
                height="32"
                className="w-8 h-8 rounded-md object-cover shadow-e1 ring-1 ring-hairline"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-semibold text-ink-900 tracking-tight">Mylapore</span>
                <span className="text-[11px] text-ink-500 font-medium tracking-wide">Grievance Portal</span>
              </span>
            </Link>
            <p className="mt-4 text-[13px] text-ink-500 leading-relaxed">
              An official channel for residents of Mylapore Assembly Constituency
              to file civic grievances and track resolution.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold tracking-wide text-ink-700 uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link
                        to={l.to}
                        className="text-[14px] text-ink-700 hover:text-ink-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-[14px] text-ink-700 hover:text-ink-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Publisher / officer block — required for civic-tech credibility */}
        <div className="mt-12 pt-8 border-t border-hairline grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-ink-500">
          <div className="flex items-start gap-3">
            <img
              src="/mla.png"
              alt="Office of the MLA, Mylapore"
              width="48"
              height="48"
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover bg-surface-2 ring-1 ring-hairline shrink-0"
            />
            <div>
              <div className="font-semibold text-ink-700 mb-1">Published by</div>
              <div>Office of the MLA, Mylapore Assembly Constituency</div>
              <div>Chennai, Tamil Nadu</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-ink-700 mb-1">Grievance Officer (IT Rules 2021)</div>
            <div>Email: <a href="mailto:grievance@mylapore-mla.in" className="hover:text-ink-900 underline underline-offset-2">grievance@mylapore-mla.in</a></div>
            <div>Phone: +91 44 2499 3000</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-ink-500">
          <div>
            © 2026 Mylapore Constituency Office. ·{' '}
            <Link to="/about-tvk" className="hover:text-ink-900 underline underline-offset-2">About TVK</Link>
          </div>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-hairline text-ink-700 hover:bg-surface-2 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
