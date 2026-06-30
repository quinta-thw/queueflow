import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Briefcase,
  CreditCard, CheckCircle2, ChevronRight, ChevronLeft, GraduationCap, ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const DEPARTMENTS = [
  'Registrar',
  'Finance Office',
  'Health Clinic',
  'Student Affairs',
  'ICT Support',
  'Library',
  'Admissions',
  'Cafeteria',
  'Course Advisor',
]

export default function StaffSignUp() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const { registerStaff } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    staff_id: '', department: '',
    password: '', confirm_password: '',
  })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const passwordStrength = () => {
    const p = form.password
    if (!p) return { label: '', color: '', width: '0%' }
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' }
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '50%' }
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: 'bg-yellow-400', width: '75%' }
    return { label: 'Strong password', color: 'bg-green-500', width: '100%' }
  }

  const validateStep1 = () => {
    if (!form.first_name || !form.last_name) { toast.error('Please enter your full name.'); return false }
    if (!form.email.includes('@')) { toast.error('Please enter a valid email address.'); return false }
    if (!form.staff_id) { toast.error('Please enter your Staff ID.'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.department) { toast.error('Please select your department.'); return false }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return false }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match.'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const user = await registerStaff({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        staff_id: form.staff_id,
        department: form.department,
        password: form.password,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-700 to-primary-900 flex flex-col relative">
      {/* Back arrow */}
      <Link to="/" className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 transition-all">
        <ArrowLeft size={15} /> Back
      </Link>
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Staff signup</h1>
        <p className="text-primary-200 text-sm mt-1">
          {step === 1 ? 'Personal details' : step === 2 ? 'Account setup' : 'Account created'}
        </p>

        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step ? 'bg-white text-primary-600' :
                  s === step ? 'bg-white text-primary-600 ring-4 ring-white/30' :
                  'bg-white/20 text-white/60'
                }`}>
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
                    <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="Jane" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Doe" className="input-field" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Staff ID</label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.staff_id} onChange={set('staff_id')} placeholder="STF/001" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">Work Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="jane.doe@usiu.ac.ke" className="input-field" />
                </div>
              </div>

              <button onClick={handleNext} className="btn-primary mt-2">
                Continue <ChevronRight size={18} />
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/signin?role=staff" className="text-primary-500 font-semibold">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step 2: Department & Password */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Department</label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    value={form.department}
                    onChange={set('department')}
                    className="input-field appearance-none bg-white"
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
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
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                    </div>
                    <p className="text-xs mt-1 font-medium text-gray-500">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    placeholder="••••••••••"
                    className="input-field"
                  />
                </div>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Info note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> Staff accounts require verification. You'll be able to manage queues once your account is approved.
                </p>
              </div>

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

          {/* Step 3: Pending Verification */}
          {step === 3 && (
            <div className="text-center fade-in">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Account created!</h2>
              <p className="text-gray-500 text-sm mb-4">Your application is awaiting admin approval.</p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">What happens next?</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  The system admin will review your account details and approve your access.
                  Once approved, you'll be able to sign in and manage your department's queue.
                  This usually takes 1 business day.
                </p>
              </div>

              <div className="card text-left space-y-3 mb-6">
                {[
                  ['Name',       `${registeredUser?.first_name} ${registeredUser?.last_name}`],
                  ['Email',      registeredUser?.email],
                  ['Staff ID',   registeredUser?.staff_id],
                  ['Department', registeredUser?.department],
                  ['Status',     null],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{label}</span>
                    {label === 'Status' ? (
                      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Pending Approval</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/signin?role=staff')} className="btn-primary">
                Back to sign in <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
