import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, Clock, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState({ total_students: 0, total_staff: 0, pending_staff: 0, verified_staff: 0 })
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [statsRes, staffRes] = await Promise.all([
        api.get('/auth/admin/stats/'),
        api.get('/auth/admin/staff/'),
      ])
      setStats(statsRes.data)
      setPending(staffRes.data.filter(s => !s.is_verified))
    } catch {
      toast.error('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id, action) => {
    try {
      const { data } = await api.post(`/auth/admin/staff/${id}/verify/`, { action })
      toast.success(data.message)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    }
  }

  return (
    <AppLayout role="admin">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={22} className="text-primary-200" />
          <p className="text-primary-100 text-sm">Admin Panel</p>
        </div>
        <h2 className="text-2xl font-extrabold">Welcome, {user?.first_name}</h2>
        <p className="text-primary-200 text-sm mt-1">Manage staff accounts and system access.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users,       label: 'Total Students',  value: stats.total_students,  color: 'text-blue-600',   bg: 'bg-blue-50'    },
          { icon: UserCheck,   label: 'Verified Staff',  value: stats.verified_staff,  color: 'text-green-600',  bg: 'bg-green-50'   },
          { icon: Clock,       label: 'Pending Approval',value: stats.pending_staff,   color: 'text-amber-600',  bg: 'bg-amber-50'   },
          { icon: Users,       label: 'Total Staff',     value: stats.total_staff,     color: 'text-primary-600',bg: 'bg-primary-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`card ${bg} py-5 text-center`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-2">
              <Icon size={20} className={color} />
            </div>
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800">Pending Staff Approvals</h3>
            <p className="text-xs text-gray-400 mt-0.5">Review and approve new staff registrations</p>
          </div>
          <button onClick={() => navigate('/admin/staff')} className="text-sm font-semibold text-primary-500 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 size={36} className="text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-600 text-sm">All staff are verified!</p>
            <p className="text-xs text-gray-400 mt-1">No pending approvals right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map(staff => (
              <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold text-xs">{staff.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{staff.full_name}</p>
                    <p className="text-xs text-gray-400">{staff.department} &bull; {staff.staff_id}</p>
                    <p className="text-xs text-gray-400">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify(staff.id, 'reject')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(staff.id, 'approve')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
