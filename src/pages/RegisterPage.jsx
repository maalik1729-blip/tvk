import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, ShieldCheck, MessageCircle, Phone, User,
  Calendar, CreditCard,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Card, TextField, cn } from '../components/ui'

/**
 * Register — Manual is the default path, EPIC is a secondary toggle.
 * Spec: outputs/02 → W3 (decouple registration from verification, smart default).
 *       outputs/04 → unified Button + TextField + Card primitives, single OTP screen.
 *
 * Flow:
 *   Manual:  details → OTP → register
 *   EPIC:    details → voter confirm → OTP → register
 *
 * Backend contract preserved: lookup-epic, send-otp, verify via /register.
 */
const SLOT = '      ' // 6 spaces for OTP scaffold

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]       = useState('manual') // 'manual' | 'epic'
  const [step, setStep]       = useState(1)        // 1 details · 2 voter (epic) · 3 otp
  const [form, setForm]       = useState({ name: '', phone: '', dob: '', epic: '', gender: '' })
  const [voter, setVoter]     = useState(null)
  const [otp,   setOtp]       = useState('')
  const [busy,  setBusy]      = useState(false)
  const [error, setError]     = useState('')
  const [info,  setInfo]      = useState('')
  const [cooldown, setCooldown] = useState(0)
  const otpInputsRef = useRef([])

  const totalSteps = mode === 'epic' ? 3 : 2
  const stepIndex  = mode === 'manual' && step === 3 ? 2 : step

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Focus first OTP cell when entering step 3
  useEffect(() => {
    if (step === 3) setTimeout(() => otpInputsRef.current[0]?.focus(), 80)
  }, [step])

  // OTP segmented input handlers
  const setOtpDigit = useCallback((idx, val) => {
    const digit = (val || '').replace(/\D/g, '').slice(-1)
    const arr = (otp + SLOT).slice(0, 6).split('')
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

  function validateManual() {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Enter your full name.'
    if (form.phone.length !== 10) return 'Enter a 10-digit mobile number.'
    if (!form.gender) return 'Select your gender.'
    if (!form.dob) return 'Select your date of birth.'
    return ''
  }

  function validateEpic() {
    const e = form.epic.trim().toUpperCase()
    if (!/^[A-Z]{2,3}[0-9]{6,7}$/.test(e)) return 'EPIC format looks invalid (e.g. RJE0667055).'
    if (form.phone.length !== 10) return 'Enter a 10-digit mobile number.'
    if (!form.dob) return 'Select your date of birth.'
    return ''
  }

  async function lookupEpic(e) {
    e?.preventDefault(); setError('')
    const err = validateEpic(); if (err) return setError(err)
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/lookup-epic', {
        epic: form.epic.trim().toUpperCase(),
        phone: form.phone,
        dob: form.dob,
      })
      setVoter(data.voter)
      setForm(f => ({ ...f, name: data.voter?.name || f.name }))
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not verify your Voter ID. Please check and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function sendOtp(forResend = false) {
    if (!forResend) setError('')
    setBusy(true)
    try {
      await api.post('/portal/auth/send-otp', { phone: form.phone, mode: 'register' })
      setStep(3)
      setInfo(`We sent a 6-digit code to your WhatsApp on +91 ${form.phone}.`)
      setCooldown(45)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send the code. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function manualContinue(e) {
    e?.preventDefault(); setError('')
    const err = validateManual(); if (err) return setError(err)
    sendOtp()
  }

  async function completeRegister(e) {
    e?.preventDefault(); setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code.')
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/register', {
        phone: form.phone,
        otp,
        name: form.name.trim() || voter?.name || '',
        dob: form.dob,
        epic:   mode === 'epic'   ? form.epic.trim().toUpperCase() : '',
        gender: mode === 'manual' ? form.gender : (voter?.gender || ''),
      })
      login(data.token, data.user)
      navigate('/grievance', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(newMode) {
    if (newMode === mode) return
    setMode(newMode); setStep(1); setError(''); setInfo(''); setVoter(null); setOtp('')
  }

  function backOneStep() {
    setError('')
    if (step === 3) setStep(mode === 'epic' ? 2 : 1)
    else if (step === 2) setStep(1)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
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
      <div className="flex-1 flex items-start justify-center px-4 py-10 lg:py-16">
        <div className="w-full max-w-[460px]">

          {/* Trust strip */}
          <div className="flex items-center gap-2 mb-6 text-[12px] text-ink-500">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
            <span>Official portal · Secure WhatsApp sign-in</span>
          </div>

          <h1 className="text-[28px] lg:text-[32px] font-bold tracking-[-0.015em] text-ink-900">
            Register
          </h1>
          <p className="mt-2 text-[14px] text-ink-500">
            Step {stepIndex} of {totalSteps}
          </p>

          {/* Step strip */}
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i < stepIndex ? 'bg-brand-red' : 'bg-hairline',
                )}
              />
            ))}
          </div>

          <Card className="mt-6 p-5 lg:p-6">

            {/* ── Step 1 — details ── */}
            {step === 1 && (
              <>
                {/* Mode toggle */}
                <div role="tablist" aria-label="Registration mode" className="mb-5 grid grid-cols-2 gap-2 p-1 bg-surface-2 rounded-md">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'manual'}
                    onClick={() => switchMode('manual')}
                    className={cn(
                      'h-9 rounded text-[13px] font-semibold transition-colors',
                      mode === 'manual'
                        ? 'bg-panel text-ink-900 shadow-e1'
                        : 'text-ink-500 hover:text-ink-900',
                    )}
                  >
                    Quick
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'epic'}
                    onClick={() => switchMode('epic')}
                    className={cn(
                      'h-9 rounded text-[13px] font-semibold transition-colors',
                      mode === 'epic'
                        ? 'bg-panel text-ink-900 shadow-e1'
                        : 'text-ink-500 hover:text-ink-900',
                    )}
                  >
                    Use Voter ID
                  </button>
                </div>

                {mode === 'manual' ? (
                  <form onSubmit={manualContinue} className="flex flex-col gap-4" noValidate>
                    <TextField
                      label="Full name"
                      example="Ananya Iyer"
                      autoComplete="name"
                      value={form.name}
                      onChange={set('name')}
                      iconLeft={<User className="w-4 h-4" aria-hidden="true" />}
                    />
                    <TextField
                      label="Mobile number"
                      example="98765 43210"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      iconLeft={<Phone className="w-4 h-4" aria-hidden="true" />}
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-semibold tracking-wide text-ink-700">Gender</label>
                      <div role="radiogroup" className="grid grid-cols-3 gap-2">
                        {['Female', 'Male', 'Other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            role="radio"
                            aria-checked={form.gender === g}
                            onClick={() => setForm({ ...form, gender: g })}
                            className={cn(
                              'h-10 rounded-md border text-[13px] font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                              form.gender === g
                                ? 'bg-ink-900 text-white border-ink-900'
                                : 'bg-panel text-ink-700 border-hairline hover:bg-surface-2',
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <TextField
                      label="Date of birth"
                      type="date"
                      value={form.dob}
                      onChange={set('dob')}
                      iconLeft={<Calendar className="w-4 h-4" aria-hidden="true" />}
                    />
                    {error && <p role="alert" className="text-[13px] text-status-danger">{error}</p>}
                    <Button kind="primary" size="lg" type="submit" loading={busy} fullWidth iconRight={<ArrowRight className="w-4 h-4" />}>
                      {busy ? 'Sending code' : 'Continue'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={lookupEpic} className="flex flex-col gap-4" noValidate>
                    <TextField
                      label="Voter ID (EPIC)"
                      example="RJE0667055"
                      value={form.epic}
                      onChange={(e) => setForm({ ...form, epic: e.target.value.toUpperCase() })}
                      iconLeft={<CreditCard className="w-4 h-4" aria-hidden="true" />}
                    />
                    <TextField
                      label="Mobile number"
                      example="98765 43210"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      iconLeft={<Phone className="w-4 h-4" aria-hidden="true" />}
                    />
                    <TextField
                      label="Date of birth"
                      type="date"
                      value={form.dob}
                      onChange={set('dob')}
                      iconLeft={<Calendar className="w-4 h-4" aria-hidden="true" />}
                    />
                    {error && <p role="alert" className="text-[13px] text-status-danger">{error}</p>}
                    <Button kind="primary" size="lg" type="submit" loading={busy} fullWidth iconRight={<ArrowRight className="w-4 h-4" />}>
                      {busy ? 'Looking up' : 'Verify Voter ID'}
                    </Button>
                  </form>
                )}

                <div className="mt-5 text-[13px] text-ink-500 text-center">
                  Already registered?{' '}
                  <Link to="/login" className="text-ink-900 underline underline-offset-2 hover:text-brand-red">
                    Sign in
                  </Link>
                </div>
              </>
            )}

            {/* ── Step 2 — voter confirm (EPIC only) ── */}
            {step === 2 && voter && (
              <div className="flex flex-col gap-5">
                <div role="status" aria-live="polite" className="rounded-md bg-surface-2 border border-hairline px-4 py-3 text-[13px]">
                  <p className="font-semibold text-ink-900 mb-2">We found your voter record:</p>
                  <ul className="space-y-1 text-ink-700">
                    <li><span className="text-ink-500">Name:</span> {voter.name}</li>
                    {voter.gender && <li><span className="text-ink-500">Gender:</span> {voter.gender}</li>}
                    {voter.address && <li><span className="text-ink-500">Address:</span> {voter.address}</li>}
                  </ul>
                </div>

                {error && <p role="alert" className="text-[13px] text-status-danger">{error}</p>}

                <div className="flex items-center gap-3">
                  <Button kind="ghost" size="md" onClick={backOneStep}>
                    Back
                  </Button>
                  <Button kind="primary" size="md" onClick={() => sendOtp()} loading={busy} iconRight={<ArrowRight className="w-4 h-4" />} className="ml-auto">
                    {busy ? 'Sending code' : 'Confirm and continue'}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3 — OTP ── */}
            {step === 3 && (
              <form onSubmit={completeRegister} className="flex flex-col gap-5" noValidate>
                <div role="status" aria-live="polite" className="rounded-md bg-surface-2 border border-hairline px-3 py-2.5 text-[13px] text-ink-700 flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-status-success" aria-hidden="true" />
                  <span>{info}</span>
                </div>

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
                  {error && <p role="alert" className="mt-2 text-[13px] text-status-danger">{error}</p>}
                </div>

                <Button kind="primary" size="lg" type="submit" loading={busy} fullWidth iconRight={<ArrowRight className="w-4 h-4" />}>
                  {busy ? 'Creating your account' : 'Complete registration'}
                </Button>

                <div className="flex items-center justify-between text-[13px]">
                  <button type="button" onClick={backOneStep} className="text-ink-700 hover:text-ink-900 underline underline-offset-2">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || busy}
                    onClick={() => sendOtp(true)}
                    className="text-ink-700 hover:text-ink-900 disabled:text-ink-400 disabled:cursor-not-allowed disabled:no-underline underline underline-offset-2"
                  >
                    {cooldown > 0 ? `Resend in 0:${cooldown.toString().padStart(2, '0')}` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </Card>

          <p className="mt-5 text-[12px] text-ink-500 text-center">
            By registering, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-ink-900">terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-ink-900">privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
