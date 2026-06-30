import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, GraduationCap,
  CreditCard, BookOpen, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft,
  KeyRound, Check, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SCHOOLS = [
  'School of Science & Technology',
  'School of Business',
  'School of Humanities & Social Sciences',
  'School of Pharmacy & Health Sciences',
  'School of Law',
]

const PROGRAMMES = {
  'School of Science & Technology': ['BSc. Information Technology', 'BSc. Computer Science', 'BSc. Electrical Engineering'],
  'School of Business': ['BBA', 'BCom Accounting', 'BCom Finance', 'BSc. Economics'],
  'School of Humanities & Social Sciences': ['BA Communication', 'BA International Relations', 'BA Journalism'],
  'School of Pharmacy & Health Sciences': ['BSc. Pharmacy', 'BSc. Nursing', 'BSc. Clinical Medicine'],
  'School of Law': ['LLB'],
}

const YEARS = ['Y1', 'Y2', 'Y3', 'Y4']

export default function StudentSignUp() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    password: '', confirm_password: '',
    school: '', programme: '', year_of_study: '', student_id: '',
    agree: false,
  })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const pwdReqs = {
    length:    form.password.length >= 6,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number:    /[0-9]/.test(form.password),
  }
  const metCount = Object.values(pwdReqs).filter(Boolean).length

  const passwordStrength = () => {
    if (!form.password) return { label: '', textColor: '', barColor: '', width: '0%' }
    if (metCount === 1) return { label: 'Very Weak',  textColor: 'text-red-500',    barColor: 'bg-red-400',    width: '20%'  }
    if (metCount === 2) return { label: 'Weak',       textColor: 'text-orange-500', barColor: 'bg-orange-400', width: '40%'  }
    if (metCount === 3) return { label: 'Good',       textColor: 'text-yellow-600', barColor: 'bg-yellow-400', width: '65%'  }
    if (!pwdReqs.length) return { label: 'Strong',   textColor: 'text-blue-500',   barColor: 'bg-blue-400',   width: '80%'  }
    return                      { label: 'Very Strong', textColor: 'text-green-600', barColor: 'bg-green-500',  width: '100%' }
  }

  const validateStep1 = () => {
    if (!form.first_name || !form.last_name) { toast.error('Please enter your full name.'); return false }
    if (!form.email.endsWith('@usiu.ac.ke')) { toast.error('Please use your USIU email (@usiu.ac.ke).'); return false }
    if (!form.student_id) { toast.error('Please enter your Student ID.'); return false }
    if (!form.phone_number) { toast.error('Please enter your phone number.'); return false }
    if (!pwdReqs.length)    { toast.error('Password must be at least 6 characters.'); return false }
    if (!pwdReqs.uppercase) { toast.error('Password must include an uppercase letter.'); return false }
    if (!pwdReqs.lowercase) { toast.error('Password must include a lowercase letter.'); return false }
    if (!pwdReqs.number)    { toast.error('Password must include a number.'); return false }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match.'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.school) { toast.error('Please select your school.'); return false }
    if (!form.programme) { toast.error('Please select your programme.'); return false }
    if (!form.year_of_study) { toast.error('Please select your year of study.'); return false }
    if (!form.agree) { toast.error('Please agree to the terms of service.'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const user = await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        student_id: form.student_id,
        school: form.school,
        programme: form.programme,
        year_of_study: form.year_of_study,
        password: form.password,
        confirm_password: form.confirm_password,
      })
      setRegisteredUser(user)
      setStep(3)
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        const msg = Object.values(errors).flat().join(' ')
        toast.error(msg)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength()
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col relative">
      {/* Back arrow */}
      <Link to="/" className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 transition-all">
        <ArrowLeft size={15} /> Back
      </Link>
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Student signup</h1>
        <p className="text-primary-100 text-sm mt-1">
          {step === 1 ? 'Personal details' : step === 2 ? 'Academic details' : 'Account created'}
        </p>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s < step ? 'bg-white text-primary-500' :
                    s === step ? 'bg-white text-primary-500 ring-4 ring-white/30' :
                    'bg-white/20 text-white/60'
                  }`}
                >
                  {s < step ? <CheckCircle2 size={16} /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl p-6 fade-in">
        <div className="max-w-md mx-auto">

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="Angela" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Wanjiru" className="input-field" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Student ID</label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.student_id} onChange={set('student_id')} placeholder="IST/24/0087" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">University Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="a.wanjiru@usiu.ac.ke" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone_number} onChange={set('phone_number')} placeholder="+254 701 234 567" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••••"
                    className="input-field px-10"
                  />
                  <KeyRound size={15} className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-300" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {form.password && (
                  <>
                    {/* Strength bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 font-medium">Password Strength</span>
                        <span className={`text-xs font-bold ${strength.textColor}`}>{strength.label}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.barColor} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                      </div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="mt-3 p-3 bg-gray-100 rounded-xl">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Requirements:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: 'length',    label: '6+ characters' },
                          { key: 'uppercase', label: 'Uppercase'     },
                          { key: 'lowercase', label: 'Lowercase'     },
                          { key: 'number',    label: 'Number'        },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${pwdReqs[key] ? 'bg-green-500' : 'bg-gray-300'}`}>
                              {pwdReqs[key] ? <Check size={10} className="text-white" strokeWidth={3} /> : <X size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-medium ${pwdReqs[key] ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    placeholder="Confirm your password"
                    className="input-field pr-10"
                  />
                  {form.confirm_password && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${form.confirm_password === form.password ? 'bg-green-500' : 'bg-red-400'}`}>
                      {form.confirm_password === form.password
                        ? <Check size={11} className="text-white" strokeWidth={3} />
                        : <X size={11} className="text-white" strokeWidth={3} />}
                    </div>
                  )}
                </div>
                {form.confirm_password && form.confirm_password !== form.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match</p>
                )}
              </div>

              <button onClick={handleNext} className="btn-primary mt-2">
                Continue <ChevronRight size={18} />
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/signin" className="text-primary-500 font-semibold">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step 2: Academic Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">School / Faculty</label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    value={form.school}
                    onChange={e => setForm(p => ({ ...p, school: e.target.value, programme: '' }))}
                    className="input-field appearance-none bg-white"
                  >
                    <option value="">Select school…</option>
                    {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Programme</label>
                <div className="relative">
                  <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    value={form.programme}
                    onChange={set('programme')}
                    className="input-field appearance-none bg-white"
                    disabled={!form.school}
                  >
                    <option value="">Select programme…</option>
                    {(PROGRAMMES[form.school] || []).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Year of Study</label>
                <div className="grid grid-cols-4 gap-2">
                  {YEARS.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, year_of_study: y }))}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.year_of_study === y
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-200 text-gray-500 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-bold">{y}</div>
                      <div className="text-xs opacity-70">Year {y[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={e => setForm(p => ({ ...p, agree: e.target.checked }))}
                  className="w-4 h-4 mt-0.5 rounded accent-primary-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <span className="text-primary-500 font-semibold">terms of service</span>{' '}
                  and{' '}
                  <span className="text-primary-500 font-semibold">privacy policy</span>
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 btn-outline">
                  <ChevronLeft size={18} /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : 'Create account'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center fade-in">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">You're in!</h2>
              <p className="text-gray-500 text-sm mb-2">Account activated</p>

              <div className="my-6 p-4 bg-primary-50 rounded-2xl text-left space-y-1">
                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-3">Welcome, {registeredUser?.first_name}!</p>
                <p className="text-sm text-gray-500">Your student account is ready. Start joining queues now.</p>
              </div>

              <div className="card text-left space-y-3 mb-6">
                {[
                  ['Name', `${registeredUser?.first_name} ${registeredUser?.last_name}`],
                  ['Student ID', registeredUser?.student_id],
                  ['Programme', registeredUser?.programme],
                  ['Status', null],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{label}</span>
                    {label === 'Status' ? (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/student')} className="btn-primary">
                Go to home <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
