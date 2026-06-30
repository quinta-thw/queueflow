import { useState, useEffect } from 'react'
import { UserCheck, Clock, Search, CheckCircle2, XCircle, RefreshCw, Filter } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function StaffVerification() {
  const [staff, setStaff]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')  // 'all' | 'pending' | 'verified'
  const [acting, setActing]   = useState(null)

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/admin/staff/')
      setStaff(data)
    } catch {
      setStaff([
        { id: 10, full_name: 'Jane Wanjiru',  email: 'j.wanjiru@usiu.ac.ke',  staff_id: 'STF/011', department: 'Registrar',     date_joined: new Date().toISOString(),               is_verified: false },
        { id: 11, full_name: 'Peter Kamau',   email: 'p.kamau@usiu.ac.ke',    staff_id: 'STF/012', department: 'Finance Office', date_joined: new Date(Date.now()-86400000).toISOString(),  is_verified: false },
        { id: 12, full_name: 'Amara Osei',    email: 'a.osei@usiu.ac.ke',     staff_id: 'STF/013', department: 'Health Clinic',  date_joined: new Date(Date.now()-172800000).toISOString(), is_verified: false },
        { id: 5,  full_name: 'Linda Mwangi',  email: 'l.mwangi@usiu.ac.ke',   staff_id: 'STF/005', department: 'Library',        date_joined: new Date(Date.now()-604800000).toISOString(), is_verified: true  },
        { id: 6,  full_name: 'David Njoroge', email: 'd.njoroge@usiu.ac.ke',  staff_id: 'STF/006', department: 'ICT Support',    date_joined: new Date(Date.now()-864000000).toISOString(), is_verified: true  },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id, action) => {
    setActing(id + action)
    try {
      const { data } = await api.post(`/auth/admin/staff/${id}/verify/`, { action })
      toast.success(data.message)
      fetchStaff()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    } finally {
      setActing(null)
    }
  }

  const filtered = staff.filter(s => {
    const matchesSearch = !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'pending' ? !s.is_verified : s.is_verified)
    return matchesSearch && matchesFilter
  })

  const pendingCount  = staff.filter(s => !s.is_verified).length
  const verifiedCount = staff.filter(s => s.is_verified).length

  return (
    <AppLayout role="admin">
      <p className="text-sm text-gray-500 mb-6">Review and approve staff account registrations before they can sign in.</p>

      {/* Summary chips */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { key: 'all',      label: `All (${staff.length})`,          active: filter === 'all'     },
          { key: 'pending',  label: `Pending (${pendingCount})`,      active: filter === 'pending' },
          { key: 'verified', label: `Verified (${verifiedCount})`,    active: filter === 'verified'},
        ].map(({ key, label, active }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
              active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}

        <button onClick={fetchStaff} className="ml-auto p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, department…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <Filter size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No staff found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filter or search.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Registered</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.is_verified ? 'bg-green-100' : 'bg-amber-100'}`}>
                          <span className={`text-xs font-bold ${s.is_verified ? 'text-green-700' : 'text-amber-700'}`}>
                            {s.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                          <p className="text-xs text-gray-400 md:hidden">{s.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700">{s.department}</p>
                      <p className="text-xs text-gray-400">{s.staff_id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {timeAgo(s.date_joined)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!s.is_verified ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(s.id, 'reject')}
                            disabled={acting === s.id + 'reject'}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {acting === s.id + 'reject' ? '…' : 'Reject'}
                          </button>
                          <button
                            onClick={() => handleVerify(s.id, 'approve')}
                            disabled={acting === s.id + 'approve'}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {acting === s.id + 'approve' ? '…' : 'Approve'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(s.id, 'reject')}
                          disabled={acting === s.id + 'reject'}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
