import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, GraduationCap, CreditCard, Lock, LogOut,
  Camera, ChevronRight, Eye, EyeOff, Check, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function pwdReqs(p) {
  return {
    length:    p.length >= 6,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number:    /[0-9]/.test(p),
  }
}

const REQ_LABELS = [
  { key: 'length',    text: 'At least 6 characters' },
  { key: 'uppercase', text: 'One uppercase letter'  },
  { key: 'lowercase', text: 'One lowercase letter'  },
  { key: 'number',    text: 'One number'             },
]

export default function StudentProfile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing]         = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [showOld, setShowOld]         = useState(false)
  const [showNew, setShowNew]         = useState(false)

  const [form, setForm] = useState({
    first_name:   user?.first_name   || '',
    last_name:    user?.last_name    || '',
    phone_number: user?.phone_number || '',
  })
  const [pwdForm, setPwdForm] = useState({
    old_password: '', new_password: '', confirm_password: '',
  })

  const reqs    = pwdReqs(pwdForm.new_password)
  const allPass = Object.values(reqs).every(Boolean)
  const matches = pwdForm.new_password && pwdForm.confirm_password === pwdForm.new_password

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.patch('/auth/me/', form)
      updateUser(data)
      setEditing(false)
      toast.success('Profile updated.')
    } catch {
      toast.error('Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePwd = async () => {
    const p = pwdForm.new_password
    if (!p.length)       { toast.error('Enter a new password.'); return }
    if (!reqs.length)    { toast.error('Password must be at least 6 characters.'); return }
    if (!reqs.uppercase) { toast.error('Password must include an uppercase letter.'); return }
    if (!reqs.lowercase) { toast.error('Password must include a lowercase letter.'); return }
    if (!reqs.number)    { toast.error('Password must include a number.'); return }
    if (!matches)        { toast.error('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password/', pwdForm)
      toast.success('Password changed.')
      setChangingPwd(false)
      setPwdForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change password.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/signin')
  }

  return (
    <AppLayout role="student">
      {/* Profile Header */}
      <div className="card mb-6 flex flex-col sm:flex-row items-center gap-5 py-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-primary-500">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
            <Camera size={13} className="text-white" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-2 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
            {user?.programme || 'Student'} &bull; Year {user?.year_of_study}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Personal Information</h3>
            <button onClick={() => editing ? handleSave() : setEditing(true)} className="text-primary-500 text-sm font-semibold">
              {editing ? (loading ? 'Saving…' : 'Save') : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} className="input-field" placeholder="+254 700 000 000" />
              </div>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: User,       label: 'Full Name',  value: `${user?.first_name} ${user?.last_name}` },
                { icon: Mail,       label: 'Email',      value: user?.email },
                { icon: Phone,      label: 'Phone',      value: user?.phone_number || 'Not set' },
                { icon: CreditCard, label: 'Student ID', value: user?.student_id },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Details */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Academic Details</h3>
          <div className="space-y-4">
            {[
              { icon: GraduationCap, label: 'School',        value: user?.school },
              { icon: GraduationCap, label: 'Programme',     value: user?.programme },
              { icon: CreditCard,    label: 'Year of Study', value: user?.year_of_study },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value || 'Not set'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings — Change Password only */}
        <div className="card md:col-span-2">
          <h3 className="font-bold text-gray-800 mb-3">Settings</h3>
          <button
            onClick={() => setChangingPwd(!changingPwd)}
            className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-xl transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Change Password</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          {changingPwd && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Current password */}
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={pwdForm.old_password}
                      onChange={e => setPwdForm(p => ({ ...p, old_password: e.target.value }))}
                      className="input-field pl-9 pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={pwdForm.new_password}
                      onChange={e => setPwdForm(p => ({ ...p, new_password: e.target.value }))}
                      className="input-field pl-9 pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pwdForm.new_password && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {REQ_LABELS.map(({ key, text }) => (
                        <div key={key} className={`flex items-center gap-1.5 text-xs ${reqs[key] ? 'text-green-600' : 'text-gray-400'}`}>
                          {reqs[key] ? <Check size={11} /> : <X size={11} />}
                          {text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={pwdForm.confirm_password}
                      onChange={e => setPwdForm(p => ({ ...p, confirm_password: e.target.value }))}
                      className="input-field pl-9 pr-10"
                      placeholder="••••••••"
                    />
                    {pwdForm.confirm_password && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${matches ? 'text-green-500' : 'text-red-400'}`}>
                        {matches ? <Check size={14} /> : <X size={14} />}
                      </span>
                    )}
                  </div>
                  {pwdForm.confirm_password && !matches && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleChangePwd}
                disabled={loading || !allPass || !matches}
                className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 py-3 px-6 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 font-semibold transition-colors"
      >
        <LogOut size={18} /> Sign out
      </button>
    </AppLayout>
  )
}
