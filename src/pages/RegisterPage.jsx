import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Loader2, Phone, User, Calendar, CreditCard, Lock, ArrowLeft, ShieldCheck, UserCheck, CheckCircle2, Home, MapPin, Users } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import TvkWave from '../components/TvkWave'

/**
 * Registration flow:
 *   Mode A (EPIC): epic + phone + dob → lookup voter record → confirm & send OTP → verify OTP
 *   Mode B (Manual): name + phone + gender + dob → send OTP → verify OTP
 *
 * Steps: 1 = form input, 2 = voter record confirm (EPIC only), 3 = OTP verify
 */
export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // 'epic' or 'manual'
  const [mode, setMode] = useState('epic')
  // Step 1 = input, 2 = voter confirm (epic mode), 3 = OTP
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    epic: '',
    gender: '',
  })
  const [voterData, setVoterData] = useState(null)
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const otpRef = useRef(null)

  useEffect(() => { if (step === 3) setTimeout(() => otpRef.current?.focus(), 50) }, [step])
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Progress bar step indicator
  const totalSteps = mode === 'epic' ? 3 : 2
  const currentProgress = step

  function validateEpicStep() {
    const e = form.epic.trim().toUpperCase()
    if (!/^[A-Z]{2,3}[0-9]{6,7}$/.test(e)) return 'EPIC format looks invalid (e.g. RJE0667055)'
    if (form.phone.length !== 10) return 'Enter a 10-digit mobile number'
    if (!form.dob) return 'Select your date of birth'
    const dobDate = new Date(form.dob)
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) return 'Date of birth looks invalid'
    return ''
  }

  function validateManualStep() {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Enter your full name'
    if (form.phone.length !== 10) return 'Enter a 10-digit mobile number'
    if (!form.gender) return 'Select your gender'
    if (!form.dob) return 'Select your date of birth'
    const dobDate = new Date(form.dob)
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) return 'Date of birth looks invalid'
    return ''
  }

  async function handleEpicContinue(e) {
    e?.preventDefault()
    setError('')
    const err = validateEpicStep()
    if (err) return setError(err)
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/lookup-epic', {
        epic: form.epic.trim().toUpperCase(),
        phone: form.phone,
        dob: form.dob,
      })
      setVoterData(data.voter)
      setForm((f) => ({ ...f, name: data.voter?.name || f.name }))
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not verify EPIC. Please check and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmAndSendOtp() {
    setError('')
    setBusy(true)
    try {
      await api.post('/portal/auth/send-otp', { phone: form.phone, mode: 'register' })
      setStep(3)
      setInfo(`We sent a 6-digit code to your WhatsApp on +91 ${form.phone}.`)
      setSecondsLeft(45)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send OTP. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleManualContinue(e) {
    e?.preventDefault()
    setError('')
    const err = validateManualStep()
    if (err) return setError(err)
    setBusy(true)
    try {
      await api.post('/portal/auth/send-otp', { phone: form.phone, mode: 'register' })
      setStep(3)
      setInfo(`We sent a 6-digit code to your WhatsApp on +91 ${form.phone}.`)
      setSecondsLeft(45)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send OTP. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function completeRegister(e) {
    e?.preventDefault()
    setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setBusy(true)
    try {
      const { data } = await api.post('/portal/auth/register', {
        phone: form.phone,
        otp,
        name: form.name.trim() || voterData?.name || '',
        dob: form.dob,
        epic: mode === 'epic' ? form.epic.trim().toUpperCase() : '',
        gender: mode === 'manual' ? form.gender : (voterData?.gender || ''),
      })
      login(data.token, data.user)
      navigate('/grievance', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setStep(1)
    setError('')
    setInfo('')
    setVoterData(null)
    setOtp('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf7]">
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ═══════ LEFT — TVK red brand panel ═══════ */}
        <div
          className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative overflow-hidden shrink-0"
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

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full sticky top-0 h-screen">

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

        {/* ─── RIGHT: REGISTER FORM ─── */}
        <div className="flex-1 flex flex-col justify-center px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-8 overflow-y-auto auth-right-panel">
          {/* Background effects */}
          <div className="auth-dots-pattern" />
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-top-glow" />
          <TvkWave variant="compact" />

          <div className="w-full max-w-md mx-auto relative z-10">

            {/* Back button */}
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-600 mb-6 sm:mb-8 transition-colors">
              <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" /> Back
            </Link>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Create Account</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-6 sm:mb-8">Join the Mylapore Citizen Portal</p>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-[5px] flex-1 rounded-full transition-all duration-300 ${
                    i < currentProgress ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Mobile leader image */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <img src="/auth-bg.jpg" alt="TVK Leaders" className="w-full max-w-[280px] sm:max-w-xs rounded-2xl shadow-lg object-contain" />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            {info && step === 3 && !error && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" /> {info}
              </div>
            )}

            {/* ═══ STEP 1: EPIC MODE ═══ */}
            {step === 1 && mode === 'epic' && (
              <form onSubmit={handleEpicContinue} className="space-y-6">
                {/* Voter ID */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Voter ID (EPIC)</label>
                  <input
                    type="text"
                    value={form.epic}
                    onChange={(e) => setForm({ ...form, epic: e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 10) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 uppercase tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white font-semibold text-lg"
                    placeholder="TNA1234567"
                    maxLength={10}
                    autoFocus
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Mobile Number</label>
                  <div className="flex border-2 border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all bg-white">
                    <span className="px-4 flex items-center text-gray-500 text-sm font-semibold border-r-2 border-gray-200 bg-gray-50 rounded-l-xl">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="flex-1 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none rounded-r-xl bg-white text-lg font-semibold"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={set('dob')}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-4 rounded-xl text-base font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Don't have an EPIC card?{' '}
                  <button type="button" onClick={() => switchMode('manual')} className="font-bold text-red-700 hover:text-red-800 transition-colors">
                    Register Manually
                  </button>
                </p>
              </form>
            )}

            {/* ═══ STEP 1: MANUAL MODE ═══ */}
            {step === 1 && mode === 'manual' && (
              <form onSubmit={handleManualContinue} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white font-medium"
                    placeholder="As on your government ID"
                    autoFocus
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Mobile Number</label>
                  <div className="flex border-2 border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all bg-white">
                    <span className="px-4 flex items-center text-gray-500 text-sm font-semibold border-r-2 border-gray-200 bg-gray-50 rounded-l-xl">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="flex-1 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none rounded-r-xl bg-white text-lg font-semibold"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.gender === g
                            ? 'border-yellow-400 bg-yellow-50 text-gray-900'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={set('dob')}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-4 rounded-xl text-base font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Have an EPIC card?{' '}
                  <button type="button" onClick={() => switchMode('epic')} className="font-bold text-red-700 hover:text-red-800 transition-colors">
                    Use EPIC instead
                  </button>
                </p>
              </form>
            )}

            {/* ═══ STEP 2: VOTER RECORD CONFIRM (EPIC mode only) ═══ */}
            {step === 2 && mode === 'epic' && voterData && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setVoterData(null) }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit details
                </button>

                {/* Voter Record Card */}
                <div className="border-2 border-yellow-300 rounded-2xl p-6 bg-yellow-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-widest">Voter Record Found</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{voterData.name || '-'}</h3>
                  <p className="text-sm text-gray-500 mb-5 font-medium">{form.epic.trim().toUpperCase()}</p>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
                        <Users className="w-3.5 h-3.5" /> Gender
                      </div>
                      <p className="text-base font-bold text-gray-900">{voterData.gender || voterData.sex || '-'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
                        <User className="w-3.5 h-3.5" /> {voterData.relationLabel || voterData.relationType || 'Husband'}
                      </div>
                      <p className="text-base font-bold text-gray-900">{voterData.relation || voterData.relationName || voterData.husbandName || voterData.fatherName || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
                        <Home className="w-3.5 h-3.5" /> House No
                      </div>
                      <p className="text-base font-bold text-gray-900">{voterData.houseNo || voterData.houseNumber || voterData.house_no || '-'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Constituency
                      </div>
                      <p className="text-base font-bold text-gray-900">{voterData.constituency || voterData.constituencyName || voterData.assembly || 'Mylapore (25)'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Your account will be registered under the name shown on the voter roll. If this is not you, please{' '}
                  <button type="button" onClick={() => { setStep(1); setError(''); setVoterData(null) }} className="font-bold text-red-700 hover:underline">
                    edit your EPIC
                  </button>.
                </p>

                <button
                  type="button"
                  onClick={handleConfirmAndSendOtp}
                  disabled={busy}
                  className="w-full py-4 rounded-xl text-base font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm & Send OTP'}
                </button>
              </div>
            )}

            {/* ═══ STEP 3: OTP VERIFICATION ═══ */}
            {step === 3 && (
              <form onSubmit={completeRegister} className="space-y-6">
                <button
                  type="button"
                  onClick={() => { setStep(mode === 'epic' ? 2 : 1); setOtp(''); setError(''); setInfo('') }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2.5">6-Digit Code</label>
                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-gray-900 font-bold tracking-[0.5em] text-center text-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white"
                    placeholder="••••••"
                    required
                  />
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-gray-500 font-medium">Code expires in 5 minutes</span>
                    <button
                      type="button"
                      onClick={mode === 'epic' ? handleConfirmAndSendOtp : handleManualContinue}
                      disabled={secondsLeft > 0 || busy}
                      className="font-bold text-yellow-600 hover:text-yellow-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || otp.length !== 6}
                  className="w-full py-4 rounded-xl text-base font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Create Account'}
                </button>
              </form>
            )}

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-red-700 hover:text-red-800 transition-colors">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200 py-5 text-center bg-[#fffcf7]">
        <p className="text-xs text-gray-600 font-medium">© 2024 Tamilaga Vettri Kazhagam. All Rights Reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-600">
          <span className="hover:text-gray-800 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="text-gray-300">|</span>
          <span className="hover:text-gray-800 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}
