import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck, MessageCircle, Phone } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Card, TextField, cn } from '../components/ui'

/**
 * Sign-in — phone → OTP. WhatsApp-secured.
 * Spec: outputs/02 → W6 (single screen, stateful CTA, visible cooldown).
 *       outputs/04 → unified Button + TextField + Card primitives.
 *
 * Backend contract is unchanged: POST /portal/auth/send-otp + verify-otp.
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/grievance'

  const [phone, setPhone]               = useState('')
  const [otp,   setOtp]                 = useState('')
  const [otpSent, setOtpSent]           = useState(false)
  const [busy, setBusy]                 = useState(false)
  const [error, setError]               = useState('')
  const [info,  setInfo]                = useState('')
  const [cooldown, setCooldown]         = useState(0)
  const otpInputsRef = useRef([])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Focus first OTP cell when it appears
  useEffect(() => {
    if (otpSent) setTimeout(() => otpInputsRef.current[0]?.focus(), 80)
  }, [otpSent])

  // OTP input wiring (segmented 6-digit)
  const setOtpDigit = useCallback((idx, val) => {
    const digit = (val || '').replace(/\D/g, '').slice(-1)
    const arr = (otp + '      ').slice(0, 6).split('')
    arr[idx] = digit
    const next = arr.join('').replace(/\s/g, '').slice(0, 6)
    setOtp(next)
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

  async function requestOtp(e) {
    e?.preventDefault()
    setError(''); setInfo('')
    if (phone.length !== 10) return setError('Enter a 10-digit mobile number.')
    setBusy(true)
    try {
      await api.post('/portal/auth/send-otp', { phone, mode: 'login' })
      setOtpSent(true)
      setInfo(`We sent a 6-digit code to your WhatsApp on +91 ${phone}.`)
      setCooldown(45)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send the code. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp(e) {
    e?.preventDefault()
    setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code.')
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/verify-otp', { phone, otp })
      login(data.token, data.user)
      navigate(fromPath, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code.')
    } finally {
      setBusy(false)
    }
  }

  function changeNumber() {
    setOtpSent(false); setOtp(''); setError(''); setInfo(''); setCooldown(0)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar — minimal */}
      <header className="h-14 flex items-center px-4 lg:px-8 border-b border-hairline">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] text-ink-700 hover:text-ink-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to home
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          <img
            src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
            alt=""
            aria-hidden="true"
            width="28"
            height="28"
            className="w-7 h-7 rounded-md object-cover ring-1 ring-hairline"
          />
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-900">Mylapore</div>
            <div className="text-[10px] text-ink-500">Grievance Portal</div>
          </div>
        </div>
      </header>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 lg:py-16">
        <div className="w-full max-w-[420px]">

          {/* Trust strip — visible on mobile too (per outputs/04 → R3) */}
          <div className="flex items-center gap-2 mb-6 text-[12px] text-ink-500">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
            <span>Official portal · Secure WhatsApp sign-in</span>
          </div>

          <h1 className="text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
            Sign in
          </h1>
          <p className="mt-2 text-[14px] text-ink-500">
            We'll send a 6-digit code to your WhatsApp.
          </p>

          <Card className="mt-6 p-5 lg:p-6">
            {!otpSent ? (
              <form onSubmit={requestOtp} className="flex flex-col gap-5" noValidate>
                <TextField
                  label="Mobile number"
                  example="98765 43210"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  iconLeft={<Phone className="w-4 h-4" aria-hidden="true" />}
                  help="We use this only to verify it's you."
                  error={error}
                />
                <Button kind="primary" size="lg" type="submit" loading={busy} fullWidth iconRight={<ArrowRight className="w-4 h-4" />}>
                  {busy ? 'Sending code' : 'Send code on WhatsApp'}
                </Button>
                <div className="text-[13px] text-ink-500 text-center">
                  New here?{' '}
                  <Link to="/register" className="text-ink-900 underline underline-offset-2 hover:text-brand-red">
                    Register
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="flex flex-col gap-5" noValidate>
                <div role="status" aria-live="polite" className="rounded-md bg-surface-2 border border-hairline px-3 py-2.5 text-[13px] text-ink-700 flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-status-success" aria-hidden="true" />
                  <span>{info}</span>
                </div>

                {/* OTP segmented input */}
                <div>
                  <label className="text-[12px] font-semibold tracking-wide text-ink-700 block mb-2">
                    6-digit code
                  </label>
                  <div className="flex gap-2 justify-between">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpInputsRef.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={(e) => setOtpDigit(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        aria-label={`Digit ${i + 1} of 6`}
                        className={cn(
                          'w-11 h-12 sm:w-12 sm:h-12 text-center font-mono text-[18px] font-semibold',
                          'rounded-md border border-hairline bg-panel text-ink-900',
                          'focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/15',
                        )}
                      />
                    ))}
                  </div>
                  {error && (
                    <p role="alert" className="mt-2 text-[13px] text-status-danger">{error}</p>
                  )}
                </div>

                <Button kind="primary" size="lg" type="submit" loading={busy} fullWidth iconRight={<ArrowRight className="w-4 h-4" />}>
                  {busy ? 'Verifying' : 'Verify and sign in'}
                </Button>

                <div className="flex items-center justify-between text-[13px]">
                  <button
                    type="button"
                    onClick={changeNumber}
                    className="text-ink-700 hover:text-ink-900 underline underline-offset-2"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || busy}
                    onClick={requestOtp}
                    className="text-ink-700 hover:text-ink-900 disabled:text-ink-400 disabled:cursor-not-allowed disabled:no-underline underline underline-offset-2"
                  >
                    {cooldown > 0 ? `Resend in 0:${cooldown.toString().padStart(2, '0')}` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </Card>

          <p className="mt-5 text-[12px] text-ink-500 text-center">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-ink-900">terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-ink-900">privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
