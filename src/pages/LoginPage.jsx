import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Loader2, Phone, ShieldCheck, MessageCircle,
  Sparkles, CheckCircle2, Lock, Star, Users,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import TvkWave from '../components/TvkWave'

/**
 * Two-step TVK login: mobile → OTP. WhatsApp Authentication template.
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/grievance'

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const otpInputsRef = useRef([])

  useEffect(() => {
    if (step === 2) setTimeout(() => otpInputsRef.current[0]?.focus(), 80)
  }, [step])

  /* ── Modern segmented-OTP handlers ── */
  const setOtpDigit = useCallback((idx, val) => {
    const digit = (val || '').replace(/\D/g, '').slice(-1)
    const arr = (otp + '      ').slice(0, 6).split('')
    arr[idx] = digit
    const next = arr.join('').replace(/\s/g, '')
    setOtp(next.slice(0, 6))
    if (digit && idx < 5) otpInputsRef.current[idx + 1]?.focus()
  }, [otp])

  const handleOtpKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        e.preventDefault()
        const arr = otp.split('')
        arr[idx - 1] = ''
        setOtp(arr.join(''))
        otpInputsRef.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      otpInputsRef.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 5) {
      otpInputsRef.current[idx + 1]?.focus()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e) => {
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    setOtp(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    setTimeout(() => otpInputsRef.current[focusIdx]?.focus(), 0)
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  async function requestOtp(e) {
    e?.preventDefault()
    setError('')
    if (phone.length !== 10) return setError('Enter a 10-digit mobile number')
    setBusy(true)
    try {
      await api.post('/portal/auth/send-otp', { phone, mode: 'login' })
      setStep(2)
      setInfo(`We sent a 6-digit code to your WhatsApp on +91 ${phone}.`)
      setSecondsLeft(45)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send OTP. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp(e) {
    e?.preventDefault()
    setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/verify-otp', { phone, otp })
      login(data.token, data.user)
      navigate(fromPath, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf7]">
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ═══════ LEFT — TVK red brand panel ═══════ */}
        <div
          className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative overflow-hidden"
          style={{
            background:
              'radial-gradient(900px 500px at 15% 0%, rgba(255,204,0,0.22) 0%, transparent 60%),' +
              'radial-gradient(700px 400px at 100% 100%, rgba(255,140,0,0.18) 0%, transparent 60%),' +
              'linear-gradient(135deg, #5A0000 0%, #8B0000 40%, #C8102E 100%)',
          }}
        >
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #FFCC00 1px, transparent 1px), linear-gradient(to bottom, #FFCC00 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          {/* Floating shapes */}
          <div className="tvk-blob bg-tvk-yellow/30 w-[300px] h-[300px] -top-16 -left-12" />
          <div className="tvk-blob bg-tvk-red/40 w-[360px] h-[360px] -bottom-24 -right-16" style={{ animationDelay: '-4s' }} />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">

            {/* Brand */}
            <div className="auth-mount flex items-center gap-3">
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-tvk-yellow/40 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
              >
                <img
                  src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
                  alt="TVK"
                  className="w-9 h-9 object-cover rounded-md"
                />
              </div>
              <div>
                <div className="text-tvk-yellow text-xs font-extrabold tracking-[0.32em] uppercase">TVK • Mylapore</div>
                <div className="text-white text-lg font-extrabold tracking-tight font-display leading-tight">
                  Citizen Grievance Portal
                </div>
                <div className="font-tamil text-tvk-yellow/80 text-xs font-bold mt-0.5">பொதுமக்கள் குறைதீர்க்கும் சேவை மையம்</div>
              </div>
            </div>

            {/* Leader portraits */}
            <div className="flex-1 flex items-center justify-center my-10 relative z-20">
              <div className="relative w-full max-w-md flex items-center justify-center">
                <img
                  src="/auth-bg.jpg"
                  alt="TVK Leaders"
                  className="w-full h-auto rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-2 ring-tvk-yellow/40 object-contain"
                  loading="eager"
                />
              </div>
            </div>

            {/* Trust strip */}
            <div className="space-y-3 mt-auto pt-8 relative z-20">
              <p className="font-display text-3xl xl:text-4xl font-extrabold text-white leading-tight">
                Your voice matters. <br />
                <span className="tvk-grad-text">Every grievance heard.</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-3">
                {[
                  { Icon: ShieldCheck, t: 'Verified by MLA Office' },
                  { Icon: CheckCircle2, t: 'Resolution in 7 days' },
                  { Icon: Lock, t: 'WhatsApp-secured login' },
                ].map(({ Icon, t }, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(10,10,10,0.4)',
                      border: '1px solid rgba(255,214,10,0.3)',
                      color: '#FFD60A',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT — FORM ═══════ */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-14 xl:px-20 py-8 sm:py-12 overflow-y-auto auth-right-panel">
          {/* Background effects */}
          <div className="auth-dots-pattern" />
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-top-glow" />
          <TvkWave variant="compact" />

          <div className="w-full max-w-md mx-auto relative z-10">

            {/* Back */}
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-tvk-red mb-8 transition-colors font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            {/* Mobile brand (only on small screens) */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden ring-1 ring-[#C8102E]/20"
                style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
              >
                <img
                  src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
                  alt="TVK"
                  className="w-9 h-9 object-cover rounded-md"
                />
              </div>
              <div>
                <div className="text-tvk-red text-[10px] font-extrabold tracking-[0.3em] uppercase">TVK • Mylapore</div>
                <div className="text-tvk-black font-extrabold text-lg leading-tight font-display">Grievance Portal</div>
              </div>
            </div>

            {/* Eyebrow */}
            <div className="auth-mount auth-mount-d1 tvk-eyebrow mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {step === 1 ? 'Sign In' : 'Verify Code'}
            </div>

            {/* Title */}
            <h1 className="auth-mount auth-mount-d2 font-display text-4xl sm:text-5xl font-extrabold text-tvk-black tracking-tight">
              {step === 1 ? (
                <>Welcome <span className="tvk-grad-text-red">back</span></>
              ) : (
                <>Enter <span className="tvk-grad-text-red">OTP</span></>
              )}
            </h1>
            <p className="auth-mount auth-mount-d2 font-tamil text-tvk-red/80 text-sm sm:text-base font-bold mt-2">
              {step === 1 ? 'மீண்டும் வருக • உங்கள் குரல் கேட்கப்படுகிறது' : 'உறுதிப்படுத்தல் குறியீடு'}
            </p>
            <p className="auth-mount auth-mount-d3 text-gray-600 mt-3 mb-10 text-base leading-relaxed">
              {step === 1
                ? 'Login with your mobile number to file or track grievances in Mylapore.'
                : <>We sent a 6-digit code to <strong className="text-tvk-black">+91 {phone}</strong> via WhatsApp.</>}
            </p>

            {/* Alerts */}
            {error && (
              <div className="mb-5 p-4 rounded-2xl flex items-start gap-3"
                   style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.25)' }}>
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#C8102E' }} />
                <span className="text-sm font-semibold" style={{ color: '#8B0000' }}>{error}</span>
              </div>
            )}
            {info && step === 2 && !error && (
              <div className="mb-5 p-4 rounded-2xl flex items-start gap-3"
                   style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)' }}>
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#138808' }} />
                <span className="text-sm font-semibold text-green-800">{info}</span>
              </div>
            )}

            {/* ── STEP 1: PHONE ── */}
            {step === 1 ? (
              <form onSubmit={requestOtp} className="space-y-6">
                <div className="auth-mount auth-mount-d4">
                  <label className="flex items-center justify-between text-sm font-bold text-tvk-black mb-2.5">
                    <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-tvk-red" strokeWidth={2.4} /> Mobile Number</span>
                    {phone.length === 10 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="flex items-center gap-1.5 px-4 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 text-tvk-black text-sm font-extrabold">
                      <span className="text-base">🇮🇳</span>
                      +91
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 px-4 py-4 text-tvk-black placeholder-gray-300 focus:outline-none bg-white text-lg font-bold tracking-[0.08em]"
                      placeholder="98765 43210"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    OTP delivered instantly via <strong className="text-emerald-600">WhatsApp</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={busy || phone.length !== 10}
                  className={`auth-mount auth-mount-d5 group relative overflow-hidden w-full py-4 rounded-2xl text-base font-extrabold text-white inline-flex items-center justify-center gap-2.5 transition-all disabled:cursor-not-allowed ${phone.length !== 10 && !busy ? 'auth-cta-shimmer' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 60%, #5A0000 100%)',
                    boxShadow: '0 14px 30px -8px rgba(200,16,46,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(255,214,10,0.18) 0%, transparent 60%)' }} />
                  {busy ? (
                    <>
                      <Loader2 className="relative w-5 h-5 animate-spin" />
                      <span className="relative">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">Send OTP</span>
                      <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.6} />
                    </>
                  )}
                </button>

                {/* Trust strip */}
                <div className="auth-mount auth-mount-d5 grid grid-cols-3 gap-2 pt-2">
                  {[
                    { Icon: Lock, label: 'Secure OTP' },
                    { Icon: ShieldCheck, label: 'Verified MLA' },
                    { Icon: Users, label: '14,500+ Citizens' },
                  ].map(({ Icon, label }, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <Icon className="w-4 h-4 text-tvk-red" strokeWidth={2.4} />
                      <span className="text-[10px] font-bold text-gray-600 text-center">{label}</span>
                    </div>
                  ))}
                </div>
              </form>
            ) : (
              /* ── STEP 2: OTP (segmented 6-box) ── */
              <form onSubmit={verifyOtp} className="space-y-6">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); setInfo('') }}
                  className="auth-mount auth-mount-d3 text-sm text-gray-600 hover:text-tvk-red flex items-center gap-1.5 font-semibold w-fit"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit number
                </button>

                <div className="auth-mount auth-mount-d4">
                  <label className="flex items-center justify-between text-sm font-bold text-tvk-black mb-3">
                    <span>Enter 6-digit code</span>
                    {otp.length === 6 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </label>

                  <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpInputsRef.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={(e) => setOtpDigit(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        className={`otp-box ${otp[i] ? 'filled' : ''}`}
                        placeholder="•"
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-sm gap-2">
                    <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
                      <Lock className="w-3.5 h-3.5" /> Expires in 5 minutes
                    </span>
                    <button
                      type="button"
                      onClick={requestOtp}
                      disabled={secondsLeft > 0 || busy}
                      className="font-bold text-tvk-red hover:text-tvk-red-dark disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-left inline-flex items-center gap-1.5"
                    >
                      {secondsLeft > 0 ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resend in {secondsLeft}s</>
                      ) : (
                        <>Resend OTP <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || otp.length !== 6}
                  className={`auth-mount auth-mount-d5 group relative overflow-hidden w-full py-4 rounded-2xl text-base font-extrabold text-tvk-black inline-flex items-center justify-center gap-2.5 transition-all disabled:cursor-not-allowed ${otp.length !== 6 && !busy ? 'auth-cta-shimmer' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #FFD60A 0%, #FF8C00 60%, #FFC000 100%)',
                    boxShadow: '0 14px 30px -8px rgba(255,140,0,0.55), inset 0 1px 0 rgba(255,255,255,0.45)',
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)' }} />
                  {busy ? (
                    <>
                      <Loader2 className="relative w-5 h-5 animate-spin" />
                      <span className="relative">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="relative w-5 h-5" strokeWidth={2.6} />
                      <span className="relative">Verify & Sign In</span>
                      <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.6} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#fffcf7] text-gray-400 text-xs font-bold tracking-[0.2em] uppercase">or</span>
              </div>
            </div>

            <p className="text-center text-base text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-tvk-red hover:text-tvk-red-dark transition-colors">
                Register now →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-5 text-center bg-[#fffcf7]">
        <p className="text-xs text-gray-500 font-medium">© 2026 Tamilaga Vetri Kazhagam · Mylapore Office</p>
      </footer>
    </div>
  )
}
