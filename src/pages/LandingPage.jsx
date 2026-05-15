import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useCallback, useState } from 'react'
import {
  ShieldCheck, UserPlus, Search, ArrowRight, MapPin, FileText, Eye, Phone, Mail,
  Globe, ChevronRight, AlertCircle, CheckCircle2, Timer, Users, Upload, Clock, Lock,
  Flame, Sparkles, Megaphone, ShieldAlert, Star, Activity, Heart, Quote,
} from 'lucide-react'
import { useLang } from '../i18n'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import TvkFlagDecor from '../components/TvkFlagDecor'

/* ——— Safe image fallback (avoids loop) ——— */
function imgFallback(fallbackSrc) {
  return (e) => {
    if (!e.currentTarget.dataset.fb) {
      e.currentTarget.dataset.fb = '1'
      e.currentTarget.src = fallbackSrc
    }
  }
}

/* ——— Scroll-triggered reveal ——— */
function useReveal() {
  const ref = useRef(null)
  const init = useCallback(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    el.querySelectorAll('.rv').forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])
  useEffect(init, [init])
  return ref
}

/* ——— Mouse-follow parallax for hero portrait ——— */
function useParallax() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) / r.width
        const y = (e.clientY - r.top - r.height / 2) / r.height
        el.style.transform = `translate3d(${x * -10}px, ${y * -10}px, 0)`
      })
    }
    const onLeave = () => { el.style.transform = 'translate3d(0,0,0)' }
    const parent = el.parentElement
    parent?.addEventListener('mousemove', onMove)
    parent?.addEventListener('mouseleave', onLeave)
    return () => {
      parent?.removeEventListener('mousemove', onMove)
      parent?.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])
  return ref
}

export default function LandingPage() {
  const go = useNavigate()
  const root = useReveal()
  const portraitRef = useParallax()
  const { t } = useLang()
  const { user } = useAuth()

  const [stats, setStats] = useState({
    totalReceived: '1,247',
    totalResolved: '834',
    avgResponseTime: '7 days',
    satisfaction: '14,500+'
  })

  useEffect(() => {
    let cancelled = false
    api.get('/portal/stats')
      .then((r) => {
        if (cancelled || !r.data?.success) return
        const s = r.data.stats || {}
        setStats({
          totalReceived: Number(s.totalReceived || 0).toLocaleString('en-IN'),
          totalResolved: Number(s.totalResolved || 0).toLocaleString('en-IN'),
          avgResponseTime: s.avgResponseTime || '7 days',
          satisfaction: s.satisfaction || '0+',
        })
      })
      .catch(() => { /* keep defaults */ })
    return () => { cancelled = true }
  }, [])

  const marqueeItems = [
    'Mylapore Citizen Grievance Portal',
    'MLA Venkatramanan • TVK',
    'Resolve civic issues in 7 working days',
    'GPS-tagged complaints',
    'Verified responses from MLA office',
    'வெற்றி பெறுவோம் • தமிழகம் வாழ்க',
  ]

  return (
    <div ref={root} className="bg-white">

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(900px 600px at 20% 30%, rgba(255,204,0,0.12) 0%, transparent 60%),' +
            'radial-gradient(800px 500px at 100% 100%, rgba(255,140,0,0.10) 0%, transparent 60%),' +
            'linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 50%, #0A0A0A 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="tvk-blob bg-tvk-yellow/20 w-[420px] h-[420px] -top-20 -left-24" />
        <div className="tvk-blob bg-tvk-yellow/15 w-[520px] h-[520px] -bottom-32 -right-24" style={{ animationDelay: '-5s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFCC00 1px, transparent 1px), linear-gradient(to bottom, #FFCC00 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* BG image — TVK flag */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img
            src="/9a355bb7-ad98-488e-8575-f587165170ac.png"
            alt=""
            aria-hidden="true"
            className="h-[110%] w-auto max-w-none object-contain opacity-[0.18] mix-blend-screen"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28 md:pt-24 md:pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* Left — Copy */}
            <div className="lg:col-span-7 max-w-full">
              {/* Pill — live status (vibrant green) */}
              <div
                className="hero-anim inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold px-3.5 py-2 rounded-full mb-6 tracking-[0.18em] uppercase backdrop-blur-sm"
                style={{
                  background: 'rgba(0, 230, 118, 0.12)',
                  border: '1px solid rgba(0, 230, 118, 0.45)',
                  color: '#00E676',
                  boxShadow: '0 0 24px rgba(0, 230, 118, 0.18)',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping" style={{ background: '#00E676' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#00E676' }} />
                </span>
                <span style={{ color: '#00E676' }}>{t('portalActive')}</span>
                <span style={{ color: 'rgba(0, 230, 118, 0.55)' }}>•</span>
                <span style={{ color: 'rgba(0, 230, 118, 0.95)' }}>TVK Digital Initiative</span>
              </div>

              {/* Title */}
              <h1 className="hero-anim hero-anim-d1 font-bold text-white leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                {t('heroTitle1')}<br />
                <span className="text-white">{t('heroTitle2')}</span>{' '}
                <span className="tvk-grad-text">{t('heroTitle3')}</span>
              </h1>

              {/* Description */}
              <p className="hero-anim hero-anim-d2 text-white/80 text-base sm:text-lg md:text-xl leading-relaxed mt-6 max-w-xl">
                {t('heroDesc')}{' '}
                <strong className="text-tvk-yellow">{t('heroMLA')}</strong>.
                {' '}{t('heroResponse')}{' '}
                <strong className="text-tvk-yellow">{t('heroResponseDays')}</strong>.
              </p>

              {/* CTAs */}
              <div className="hero-anim hero-anim-d3 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-8">
                {user ? (
                  <>
                    <button
                      onClick={() => go('/grievance')}
                      className="tvk-cta-primary tvk-cta px-7 sm:px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" /> File a Grievance
                    </button>
                    <button
                      onClick={() => go('/my-grievances')}
                      className="tvk-cta-ghost tvk-cta px-7 sm:px-8 py-4 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                    >
                      My Requests <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => go('/login')}
                      className="tvk-cta-primary tvk-cta px-7 sm:px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2"
                    >
                      <Flame className="w-5 h-5" /> Login Now
                    </button>
                    <button
                      onClick={() => go('/register')}
                      className="tvk-cta-ghost tvk-cta px-7 sm:px-8 py-4 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                    >
                      Register Now <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Mini stats */}
              <div className="hero-anim hero-anim-d4 grid grid-cols-3 gap-3 sm:gap-6 mt-12 pt-8 border-t border-tvk-yellow/20 max-w-lg">
                {[
                  { n: stats.totalReceived, l: t('received') },
                  { n: stats.totalResolved, l: t('resolved') },
                  { n: stats.avgResponseTime, l: t('avgResponse') },
                ].map((s, i) => (
                  <div key={i} className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-black text-white tvk-stat-glow leading-none">{s.n}</div>
                    <div className="text-[10px] sm:text-xs text-tvk-yellow/80 uppercase tracking-[0.2em] mt-2 font-semibold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — MLA Hero Card */}
            <div className="lg:col-span-5 relative flex justify-center items-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-[440px]">

                {/* Decorative geometric accents (subtle, fixed positions) */}
                <div className="hidden lg:block absolute -top-6 -left-6 w-16 h-16 rounded-2xl border-2 border-tvk-yellow/35 rotate-12 pointer-events-none" />
                <div className="hidden lg:block absolute -bottom-8 -right-8 w-20 h-20 rounded-full border-2 border-tvk-yellow/35 pointer-events-none" />

                {/* The hero card */}
                <div
                  className="img-reveal relative rounded-[28px] overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(90,0,0,0.45) 100%)',
                    border: '1px solid rgba(255,214,10,0.28)',
                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                  }}
                >
                  {/* Soft yellow halo behind portrait */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(closest-side at 50% 35%, rgba(255,204,0,0.28), rgba(255,204,0,0) 70%)',
                    }}
                  />

                  {/* Verified badge — anchored to card corner */}
                  <div
                    className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(10,10,10,0.55)',
                      border: '1px solid rgba(255,214,10,0.45)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} strokeWidth={2.6} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#FFD60A' }}>
                      Verified MLA
                    </span>
                  </div>

                  {/* Live pill — anchored to card corner */}
                  <div
                    className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(0,230,118,0.12)',
                      border: '1px solid rgba(0,230,118,0.4)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping" style={{ background: '#00E676' }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#00E676' }} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#00E676' }}>
                      Live
                    </span>
                  </div>

                  {/* Portrait area */}
                  <div className="relative px-4 pt-4 pb-0 z-10">
                    <img
                      ref={portraitRef}
                      src="/mla.png"
                      alt="MLA Venkatramanan"
                      className="relative w-full h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out"
                      loading="eager"
                      decoding="async"
                    />
                  </div>

                  {/* Identity strip */}
                  <div
                    className="relative z-10 px-5 pt-3 pb-4 border-t"
                    style={{
                      borderColor: 'rgba(255,214,10,0.18)',
                      background:
                        'linear-gradient(180deg, rgba(10,10,10,0.0) 0%, rgba(10,10,10,0.55) 100%)',
                    }}
                  >
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: '#FFD60A' }}>
                          Hon'ble MLA • Mylapore
                        </div>
                        <div className="text-white text-xl font-extrabold leading-tight mt-1 font-display">
                          Venkatramanan
                        </div>
                        <div className="text-white/70 text-xs font-medium mt-0.5">
                          Tamilaga Vetri Kazhagam (TVK) · 2026–2031
                        </div>
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 100%)' }}
                      >
                        <Star className="w-6 h-6 text-tvk-black" strokeWidth={2.4} fill="currentColor" />
                      </div>
                    </div>

                    {/* Inline mini stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,214,10,0.15)' }}>
                      {[
                        { Icon: Activity, label: 'Resolved In', value: stats.avgResponseTime, color: '#FFD60A' },
                        { Icon: CheckCircle2, label: 'Resolved', value: stats.totalResolved, color: '#00E676' },
                        { Icon: Users, label: 'Citizens', value: stats.satisfaction, color: '#FFD60A' },
                      ].map((m, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                          <m.Icon className="w-3.5 h-3.5 mb-1" style={{ color: m.color }} strokeWidth={2.4} />
                          <div className="text-white text-sm font-extrabold leading-none tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {m.value}
                          </div>
                          <div className="text-[9px] text-white/60 uppercase tracking-[0.14em] font-bold mt-1 leading-tight">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating ribbon badge — bottom, anchored, won't overlap */}
                <div
                  className="img-reveal hidden sm:flex absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 100%)',
                    color: '#0A0A0A',
                    boxShadow: '0 12px 30px -8px rgba(255,140,0,0.55), 0 0 0 4px rgba(255,140,0,0.12)',
                  }}
                >
                  <Flame className="w-4 h-4" strokeWidth={2.6} />
                  <span className="text-xs font-extrabold tracking-wider uppercase">Serving Mylapore</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white/0 pointer-events-none" />
      </section>

      {/* ═══════════════ TAMIL PLEDGE BANNER ═══════════════ */}
      <section className="tvk-pledge-banner relative overflow-hidden">
        <TvkFlagDecor position="bottom-right" variant="dark" size="h-80" />
        <div className="absolute inset-0 z-0">
          <img
            src="/vijay-rally.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            onError={imgFallback('/e.jpg')}
          />
          <div className="absolute inset-0 tvk-pledge-overlay" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 text-center">
          <div className="rv rv-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7 backdrop-blur-md"
               style={{ background: 'rgba(255,214,10,0.12)', border: '1px solid rgba(255,214,10,0.45)' }}>
            <img
              src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
              alt="TVK"
              className="w-6 h-4 rounded-[2px] object-cover"
            />
            <span className="text-tvk-yellow text-[11px] font-bold uppercase tracking-[0.3em]">
              Tamilaga Vetri Kazhagam
            </span>
          </div>

          <h2 className="rv rv-up font-display font-black text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight tvk-pledge-glow" data-d="1">
            <span className="font-tamil block mb-3 text-tvk-yellow" style={{ fontSize: '0.85em' }}>
              மக்களின் குரல், மக்களுக்காகவே
            </span>
            <span className="block">The People's Voice,</span>
            <span className="block tvk-grad-text">For The People.</span>
          </h2>

          <p className="rv rv-up text-white/85 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-7" data-d="2">
            Every grievance you raise is a step toward a stronger Mylapore.
            <br className="hidden sm:block" />
            <strong className="text-tvk-yellow">We listen. We act. We honour your trust.</strong>
          </p>

          <div className="rv rv-up flex flex-wrap justify-center gap-3 mt-10" data-d="3">
            <button onClick={() => go(user ? '/grievance' : '/login')}
                    className="tvk-cta-primary tvk-cta px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-2">
              <Heart className="w-5 h-5" fill="currentColor" /> Raise Your Voice
            </button>
            <button onClick={() => go('/track')}
                    className="tvk-cta-ghost tvk-cta px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2">
              Track a Complaint <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Floating quote ribbon */}
          <div className="rv rv-up mt-14 inline-flex items-start gap-3 max-w-2xl mx-auto px-6 py-4 rounded-2xl backdrop-blur-md text-left"
               style={{ background: 'rgba(10,10,10,0.45)', border: '1px solid rgba(255,214,10,0.22)' }} data-d="4">
            <Quote className="w-7 h-7 text-tvk-yellow shrink-0 mt-0.5" />
            <div>
              <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed">
                "A government that listens is a government that serves. Mylapore deserves both."
              </p>
              <p className="text-tvk-yellow/80 text-xs font-bold uppercase tracking-[0.22em] mt-2">
                — Tamilaga Vetri Kazhagam
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <section className="tvk-marquee py-3.5 overflow-hidden border-y border-tvk-yellow/30">
        <div className="whitespace-nowrap">
          <div className="marquee">
            {[...marqueeItems, ...marqueeItems].map((m, i) => (
              <span key={i} className="text-tvk-yellow font-bold tracking-widest text-sm uppercase mx-8 inline-flex items-center gap-3">
                <Flame className="w-4 h-4 inline" />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES ═══════════════ */}
      <section className="py-20 sm:py-24 md:py-28 bg-tvk-cream/40 relative overflow-hidden">
        <TvkFlagDecor position="top-right" variant="light" size="h-80" />
        {/* Decorative */}
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-tvk-red/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-tvk-yellow/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="text-center mb-16 rv rv-up">
            <p className="text-xs sm:text-sm font-extrabold text-tvk-red uppercase tracking-[0.4em] mb-4 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {t('whatYouCanDo')}
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-tvk-black mb-5 tracking-tight">
              {t('ourServices')}
            </h2>
            <span className="tvk-underline" />
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mt-6">
              Modern, secure and efficient tools to simplify your grievance redressal experience — built with the people of Mylapore in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
            {[
              {
                title: t('fileGrievance'),
                desc: t('fileGrievanceDesc'),
                to: '/grievance',
                number: '01',
                btnText: 'Get started',
                features: ['GPS location tagging', 'Upload photos & details', 'Instant reference ID'],
                accent: '#C8102E',
                Icon: FileText,
              },
              {
                title: t('trackStatus'),
                desc: t('trackStatusDesc'),
                to: '/track',
                number: '02',
                btnText: 'Track now',
                features: ['Real-time status updates', 'Status timeline', 'SMS & email notifications'],
                accent: '#FFCC00',
                Icon: Search,
              },
              {
                title: t('viewResponse'),
                desc: t('viewResponseDesc'),
                to: '/my-grievances',
                number: '03',
                btnText: 'View responses',
                features: ['Official MLA response', 'Resolution updates', 'Download documents'],
                accent: '#0A0A0A',
                Icon: Eye,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rv rv-up tvk-bordered group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_50px_rgba(200,16,46,0.15)] transition-all duration-500 flex flex-col relative overflow-hidden"
                data-d={i + 1}
              >
                {/* Number watermark */}
                <span
                  className="absolute -top-2 -right-2 text-[120px] font-black select-none pointer-events-none leading-none"
                  style={{ color: s.accent, opacity: 0.06 }}
                >
                  {s.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 mb-7">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: s.accent === '#FFCC00'
                        ? 'linear-gradient(135deg, #FFCC00 0%, #FF8C00 100%)'
                        : s.accent === '#0A0A0A'
                        ? 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)'
                        : 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
                    }}
                  >
                    <s.Icon className={`w-7 h-7 ${s.accent === '#FFCC00' ? 'text-tvk-black' : 'text-white'}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-tvk-black text-2xl mb-3 relative z-10">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 relative z-10">{s.desc}</p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1 relative z-10">
                  {s.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-[18px] h-[18px] flex-shrink-0" style={{ color: s.accent === '#FFCC00' ? '#FF8C00' : s.accent }} />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => go(s.to)}
                  className="tvk-cta inline-flex items-center justify-between px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mt-auto relative z-10 group/btn"
                  style={{
                    background: s.accent === '#FFCC00' ? '#FFCC00' : s.accent === '#0A0A0A' ? '#0A0A0A' : '#C8102E',
                    color: s.accent === '#FFCC00' ? '#0A0A0A' : '#FFFFFF',
                  }}
                >
                  <span>{s.btnText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DUAL LEADERSHIP ═══════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-24 md:py-28 bg-white">
        <TvkFlagDecor position="bottom-left" variant="light" size="h-80" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-tvk-red/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-tvk-yellow/[0.08] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="text-center mb-16 rv rv-up">
            <p className="text-xs sm:text-sm font-extrabold text-tvk-red uppercase tracking-[0.4em] mb-4 inline-flex items-center gap-2">
              <Star className="w-4 h-4" fill="currentColor" /> Our Leadership
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-tvk-black mb-5 tracking-tight">
              Inspired by Vision. <span className="tvk-grad-text">Powered by Service.</span>
            </h2>
            <span className="tvk-underline" />
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mt-6 font-tamil">
              தலைவரின் கனவு • உங்கள் பிரதிநிதியின் சேவை
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">

            {/* Thalaivar Vijay — Inspiration */}
            <div className="rv rv-up tvk-leader-card group" data-d="1">
              <div className="tvk-leader-portrait">
                <img
                  src="/vijay-thalaivar.jpg"
                  alt="Thalaivar Vijay"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={imgFallback('/vijay.png')}
                />
                <div className="tvk-leader-portrait-shade" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
                     style={{ background: 'rgba(10,10,10,0.55)', border: '1px solid rgba(255,214,10,0.4)' }}>
                  <img src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png" className="w-5 h-3 object-cover rounded-[2px]" alt="" />
                  <span className="text-tvk-yellow text-[10px] font-bold uppercase tracking-[0.2em]">Party President</span>
                </div>
              </div>
              <div className="tvk-leader-body">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-tvk-red mb-2">Our Inspiration</div>
                <h3 className="font-display font-black text-tvk-black text-3xl sm:text-4xl leading-tight">
                  Thalaivar <span className="tvk-grad-text-red">Vijay</span>
                </h3>
                <p className="font-tamil text-gray-500 text-sm mt-1">தலைவர் விஜய் • தமிழக வெற்றிக் கழகம்</p>
                <p className="text-gray-600 text-base leading-relaxed mt-5">
                  A movement born of the people, for the people. Thalaivar's vision lights the path —
                  a Tamil Nadu where every citizen is heard, respected, and uplifted.
                </p>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-gray-100">
                  <Sparkles className="w-4 h-4 text-tvk-red" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vision • Unity • Victory</span>
                </div>
              </div>
            </div>

            {/* Hon'ble MLA Venkat Ramanan — Serving you */}
            <div className="rv rv-up tvk-leader-card group" data-d="2">
              <div className="tvk-leader-portrait" style={{ background: 'linear-gradient(180deg, #FFF8E7 0%, #FFE9A8 100%)' }}>
                <img
                  src="/mla.png"
                  alt="MLA Venkat Ramanan"
                  className="w-full h-full object-contain object-bottom transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="tvk-leader-portrait-shade" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
                     style={{ background: 'rgba(200,16,46,0.92)', border: '1px solid rgba(255,214,10,0.5)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-tvk-yellow" strokeWidth={2.6} />
                  <span className="text-tvk-yellow text-[10px] font-bold uppercase tracking-[0.2em]">Hon'ble MLA</span>
                </div>
              </div>
              <div className="tvk-leader-body">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-tvk-red mb-2">Your Representative</div>
                <h3 className="font-display font-black text-tvk-black text-3xl sm:text-4xl leading-tight">
                  Venkat <span className="tvk-grad-text-red">Ramanan</span>
                </h3>
                <p className="font-tamil text-gray-500 text-sm mt-1">உங்கள் சேவகர் • மயிலாப்பூர் தொகுதி</p>
                <p className="text-gray-600 text-base leading-relaxed mt-5">
                  Walking with the people of Mylapore, every single day. From water and roads
                  to safety and dignity — your voice reaches him directly through this portal.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-tvk-red text-xl font-black tabular-nums">{stats.totalResolved}</div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Resolved</div>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <div className="text-tvk-red text-xl font-black">{stats.avgResponseTime}</div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Avg. Reply</div>
                  </div>
                  <div className="text-center">
                    <div className="text-tvk-red text-xl font-black tabular-nums">{stats.satisfaction}</div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Citizens</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
        <TvkFlagDecor position="top-right" variant="light" size="h-72" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="text-center mb-16 rv rv-up">
            <p className="text-xs sm:text-sm font-extrabold text-tvk-red uppercase tracking-[0.4em] mb-4">{t('simpleProcess')}</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-tvk-black tracking-tight">{t('howItWorks')}</h2>
            <span className="tvk-underline mt-6" />
          </div>

          {/* Connector line (desktop) */}
          <div className="relative">
            <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-tvk-red via-tvk-yellow to-tvk-red opacity-30" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 relative">
              {[
                { n: '01', Icon: ShieldCheck, t: t('step1'), d: t('step1Desc') },
                { n: '02', Icon: FileText, t: t('step2'), d: t('step2Desc') },
                { n: '03', Icon: MapPin, t: t('step3'), d: t('step3Desc') },
                { n: '04', Icon: CheckCircle2, t: t('step4'), d: t('step4Desc') },
              ].map((s, i) => (
                <div key={i} className="rv rv-up text-center" data-d={i + 1}>
                  <div className="relative inline-block mb-5">
                    <div className="w-[88px] h-[88px] rounded-2xl bg-white border-2 border-tvk-red/15 flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(200,16,46,0.08)] transition-all duration-300 hover:border-tvk-red hover:shadow-[0_12px_30px_rgba(200,16,46,0.2)] hover:-translate-y-1">
                      <s.Icon className="w-9 h-9 text-tvk-red" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-tvk-yellow text-tvk-black text-xs font-black flex items-center justify-center shadow-lg ring-4 ring-white">
                      {s.n}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-lg sm:text-xl text-tvk-black mb-2">{s.t}</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="rv rv-up overflow-hidden relative">
        <TvkFlagDecor position="top-left" variant="light" size="h-64" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
          <div className="rounded-3xl tvk-bg-dark text-white p-8 md:p-12 relative overflow-hidden border border-tvk-yellow/15">
            <div className="absolute top-0 right-0 w-72 h-72 bg-tvk-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-tvk-yellow/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { v: stats.totalReceived, l: t('totalReceived'), Icon: FileText, c: 'text-white' },
                { v: stats.totalResolved, l: t('totalResolved'), Icon: CheckCircle2, c: 'text-tvk-yellow' },
                { v: stats.avgResponseTime, l: t('responseTime'), Icon: Timer, c: 'text-white' },
                { v: stats.satisfaction, l: t('satisfaction'), Icon: Users, c: 'text-tvk-yellow' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-tvk-red/20 border border-tvk-yellow/20 flex items-center justify-center flex-shrink-0">
                    <s.Icon className="w-7 h-7 text-tvk-yellow" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-4xl md:text-5xl font-black leading-none tracking-tight tvk-stat-glow ${s.c}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {s.v}
                    </div>
                    <div className="text-[11px] sm:text-xs text-tvk-yellow/70 uppercase tracking-[0.2em] mt-2.5 font-semibold">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PEOPLE PLEDGE BANNER ═══════════════ */}
      <section className="tvk-people-banner relative overflow-hidden">
        <TvkFlagDecor position="top-right" variant="dark" size="h-80" />
        <div className="absolute inset-0 z-0">
          <img
            src="/vijay-people.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            onError={imgFallback('/vijay.png')}
          />
          <div className="absolute inset-0 tvk-people-overlay" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-20 sm:py-28">
          <div className="rv rv-up max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                 style={{ background: 'rgba(255,214,10,0.14)', border: '1px solid rgba(255,214,10,0.4)' }}>
              <Users className="w-4 h-4 text-tvk-yellow" />
              <span className="text-tvk-yellow text-[11px] font-bold uppercase tracking-[0.3em]">Our Promise To You</span>
            </div>

            <h2 className="font-display font-black text-white text-3xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight">
              <span className="font-tamil block text-tvk-yellow text-2xl sm:text-3xl md:text-4xl mb-3">
                ஒவ்வொரு கை. ஒவ்வொரு குரல். ஒவ்வொரு குடிமகனும்.
              </span>
              Every hand we hold. Every story we hear.
              <span className="block tvk-grad-text">Every promise we keep.</span>
            </h2>

            <p className="text-white/85 text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
              You are not a complaint number. You are a citizen of Mylapore — and your
              dignity matters here. This portal exists so that no voice ever goes unheard.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-2xl">
              {[
                { Icon: Heart, label: 'Compassion First', desc: 'Every case treated with care' },
                { Icon: ShieldCheck, label: 'Verified Action', desc: 'Tracked by MLA office' },
                { Icon: Timer, label: '7-Day Promise', desc: 'Average resolution time' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-md"
                     style={{ background: 'rgba(10,10,10,0.45)', border: '1px solid rgba(255,214,10,0.2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 100%)' }}>
                    <p.Icon className="w-4 h-4 text-tvk-black" strokeWidth={2.4} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-extrabold leading-tight">{p.label}</div>
                    <div className="text-white/60 text-[11px] mt-1 leading-snug">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ INFO GRID ═══════════════ */}
      <section className="py-16 sm:py-20 bg-white overflow-hidden relative">
        <TvkFlagDecor position="bottom-right" variant="light" size="h-72" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid md:grid-cols-2 gap-6">

          {/* Announcements */}
          <div className="rv rv-left bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(200,16,46,0.1)] transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-tvk-red to-tvk-red-dark flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-extrabold text-xl text-tvk-black">{t('announcements')}</h3>
            </div>
            <ul className="space-y-1">
              {[
                { t: t('ann1'), d: '05 May 2026' },
                { t: t('ann2'), d: '03 May 2026' },
                { t: t('ann3'), d: '28 Apr 2026' },
              ].map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-base text-gray-800 py-4 border-b border-gray-100 last:border-0 hover:bg-tvk-cream/40 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-tvk-yellow ring-4 ring-tvk-yellow/20 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="leading-relaxed font-bold text-tvk-black">{a.t}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{a.d}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
                </li>
              ))}
            </ul>
          </div>

          {/* Constituency */}
          <div className="rv rv-up bg-tvk-bg text-white rounded-3xl p-8 relative overflow-hidden border border-tvk-yellow/20" data-d="2">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-tvk-yellow/10 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-tvk-yellow flex items-center justify-center">
                  <Globe className="w-5 h-5 text-tvk-black" />
                </div>
                <h3 className="font-extrabold text-xl text-white">{t('constituencyInfo')}</h3>
              </div>
              <div className="space-y-0 text-base">
                {[
                  [t('infoConstituency'), t('infoConstVal')],
                  [t('infoDistrict'), t('infoDistVal')],
                  [t('infoMLA'), t('infoMLAVal')],
                  [t('infoParty'), t('infoPartyVal')],
                  [t('infoTerm'), t('infoTermVal')],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between py-3.5 border-b border-tvk-yellow/15 last:border-0">
                    <span className="text-tvk-yellow/80 font-medium uppercase text-xs tracking-widest">{k}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-20 sm:py-24 tvk-bg text-white overflow-hidden rv rv-up">
        <TvkFlagDecor position="bottom-left" variant="dark" size="h-80" />
        <div className="tvk-blob bg-tvk-yellow/30 w-[400px] h-[400px] -top-32 left-1/2 -translate-x-1/2" />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFCC00 1px, transparent 1px), linear-gradient(to bottom, #FFCC00 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
          <Flame className="w-12 h-12 text-tvk-yellow mx-auto mb-6 tvk-flame" />
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight">
            {t('ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('ctaDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => go(user ? '/grievance' : '/login')}
              className="tvk-cta bg-tvk-yellow text-tvk-black px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-2 shadow-xl shadow-tvk-yellow/30"
            >
              {t('ctaBtn')} <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(user ? '/track' : '/register')}
              className="tvk-cta tvk-glass border-2 border-tvk-yellow/30 text-white px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2"
            >
              {user ? t('trackBtn') : 'Register Now'} <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
