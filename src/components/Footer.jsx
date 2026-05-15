import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, ArrowUp } from 'lucide-react';
import { useLang } from '../i18n';
import TvkWave from './TvkWave';

export default function Footer() {
  const { t } = useLang();

  const scrollTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkColumns = [
    {
      title: '2026 Election',
      links: [
        { label: 'Candidates', href: '/en/election-candidates/tamilnadu' },
        { label: 'Guarantees',  href: '/en/manifesto' },
        { label: 'Disclosures', href: '/en/disclosures/TN2026C7form' },
      ],
    },
    {
      title: 'Party',
      links: [
        { label: 'About',       href: '/en/about-party' },
        { label: 'Ideology',    href: '/en/ideology' },
        { label: 'Action Plan', href: '/en/action-plan' },
      ],
    },
    {
      title: 'Organisation',
      links: [
        { label: 'Leadership', href: '/en/leadership' },
        { label: 'Districts',  href: '/en/district-leadership' },
        { label: 'Wings',      href: '/en/wings' },
        { label: 'Committees', href: '/en/committees' },
      ],
    },
    {
      title: 'Updates',
      links: [
        { label: 'Resolutions', href: '/en/resolutions' },
        { label: 'News',        href: '/en/announcements' },
        { label: 'Events',      href: '/en/events' },
      ],
    },
    {
      title: 'More',
      links: [
        { label: 'Gallery', href: '/en/gallery' },
        { label: 'Contact', href: '/en/contact-us' },
      ],
    },
  ];

  const socials = [
    {
      label: 'Twitter',
      href: 'https://x.com/TVKVijayHQ',
      path: <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75-2.45 7-7 7-11.6V3z" />,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/tvkvijayhq/',
      path: (<><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="#8B0000" /><circle cx="17.5" cy="6.5" r="1.5" fill="#8B0000" /></>),
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/TVKVijayHQ/',
      path: <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@TVKVijayHQ-Offl',
      path: (<><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.54c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.25z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#8B0000" /></>),
    },
    {
      label: 'Threads',
      href: 'https://www.threads.com/@tvkvijayhq',
      path: (<><circle cx="12" cy="12" r="1" /><path d="M12 13a8 8 0 0 1 0-16 8 8 0 0 1 0 16m0-2a6 6 0 0 0 0-12 6 6 0 0 0 0 12" /></>),
    },
  ];


  return (
    <footer className="tvk-footer relative w-full overflow-x-hidden text-white">
      {/* TVK colored wave at top of footer */}
      <TvkWave position="top" variant="compact" />
      {/* Cinematic background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          src="/bg.png"
          loading="lazy"
        />
        <div className="absolute inset-0 tvk-footer-overlay" />
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-32 w-[440px] h-[440px] rounded-full bg-[#FFD60A]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[520px] h-[520px] rounded-full bg-[#5A0000]/40 blur-3xl" />
      </div>

      {/* ════════ COMPACT TOP STRIP — Brand + CTA + Socials ════════ */}
      <section className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/20"
                 style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}>
              <img src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png" alt="TVK" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-white font-extrabold text-base leading-tight font-display tracking-tight">Tamilaga Vetri Kazhagam</div>
              <div className="text-tvk-yellow text-[10px] font-extrabold uppercase tracking-[0.24em] mt-0.5">Mylapore • Citizen Portal</div>
            </div>
          </Link>

          {/* Socials + Join CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-tvk-yellow"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,214,10,0.22)' }}
                >
                  <svg className="w-4 h-4 text-white group-hover:text-[#8B0000] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    {s.path}
                  </svg>
                </a>
              ))}
            </div>
            <a
              href="https://tvk.family/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-tvk-black text-[13px] font-extrabold tracking-wide transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 100%)',
                boxShadow: '0 8px 20px -6px rgba(255,140,0,0.5)',
              }}
            >
              Join TVK
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.6} />
            </a>
          </div>
        </div>
      </section>

      {/* ════════ COMPACT LINKS GRID ════════ */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-6">
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-tvk-yellow font-extrabold text-[11px] uppercase tracking-[0.22em] mb-3">
                {col.title}
              </h4>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-block text-[13px] text-white/75 hover:text-tvk-yellow transition-colors relative"
                    >
                      {l.label}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-tvk-yellow group-hover:w-full transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ BOTTOM BAR ════════ */}
      <section className="relative z-10 border-t border-white/10 bg-black/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/70 text-xs font-medium text-center sm:text-left">
            © 2026 <strong className="text-white font-extrabold">Tamilaga Vetri Kazhagam</strong> · Mylapore Office.
          </p>

          <div className="flex items-center gap-3 text-xs text-white/60">
            <a href="/en/privacy" className="hover:text-tvk-yellow transition-colors font-semibold">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <a href="/en/terms"   className="hover:text-tvk-yellow transition-colors font-semibold">Terms</a>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-tvk-yellow" fill="currentColor" /> in Mylapore
            </span>
          </div>

          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="group w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 100%)',
              boxShadow: '0 6px 14px -4px rgba(255,140,0,0.5)',
            }}
          >
            <ArrowUp className="w-4 h-4 text-tvk-black transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.8} />
          </button>
        </div>
      </section>
    </footer>
  );
}
