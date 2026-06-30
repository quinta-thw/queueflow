import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap, Briefcase, ShieldCheck, Clock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'staff' ? 'staff'
    : searchParams.get('role') === 'admin' ? 'admin' : 'student'

  const [role, setRole]               = useState(initialRole)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPendingVerification(false)
    setLoading(true)
    try {
      const user = await login(email, password, role)
      toast.success(`Welcome back, ${user.first_name}!`)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'staff') navigate('/staff')
      else navigate('/student')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.'
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('verification')) {
        setPendingVerification(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'student', label: 'Student', icon: GraduationCap },
    { key: 'staff',   label: 'Staff',   icon: Briefcase     },
    { key: 'admin',   label: 'Admin',   icon: ShieldCheck   },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Back to landing page */}
      <Link to="/" className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 transition-all">
        <ArrowLeft size={15} /> Back
      </Link>
      {/* Image hero side */}
      <div className="lg:w-5/12 relative overflow-hidden min-h-[30vh] lg:min-h-screen">
        {/* Full-cover image */}
        <img
          src="/QUEUE.png"
          alt="Queue management"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-primary-900/60" />

        {/* Content on top */}
        <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">USIU Queue</span>
          </Link>
          <div className="mt-auto">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">
              Welcome back<br />to the queue
            </h1>
            <p className="text-white/80 text-sm">
              Sign in to join queues, track your ticket, or manage your service counter — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md fade-in">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">Choose your account type and enter your credentials.</p>

          {/* Role tabs */}
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl mb-6">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setRole(key); setPendingVerification(false) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === key ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Pending verification notice */}
          {pendingVerification && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Account pending verification</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Your staff account has been created but needs admin approval before you can sign in. Please check back later.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                {role === 'student' ? 'Student Email' : role === 'admin' ? 'Admin Email' : 'Staff Email'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    role === 'student' ? 'a.wanjiru@usiu.ac.ke'
                    : role === 'admin' ? 'admin@usiu.ac.ke'
                    : 'staff@usiu.ac.ke'
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : `Sign in as ${role}`}
            </button>
          </form>

          {/* Signup link — only for student / staff */}
          {role !== 'admin' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link
                to={role === 'student' ? '/signup' : '/signup/staff'}
                className="text-primary-500 font-semibold hover:underline"
              >
                {role === 'student' ? 'Create student account' : 'Create staff account'}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
