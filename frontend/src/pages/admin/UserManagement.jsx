import { useState, useEffect } from 'react'
import { Search, Trash2, RefreshCw, Users, GraduationCap, UserCheck, Filter } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function UserManagement() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [tab, setTab]         = useState('all')   // 'all' | 'student' | 'staff'
  const [deleting, setDeleting] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/admin/users/')
      setUsers(data)
    } catch {
      toast.error('Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const { data } = await api.delete(`/auth/admin/users/${id}/`)
      toast.success(data.message)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed.')
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  const students = users.filter(u => u.role === 'student')
  const staff    = users.filter(u => u.role === 'staff')
  const shown    = users.filter(u => {
    const matchesTab = tab === 'all' || u.role === tab
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      `${u.full_name} ${u.email} ${u.student_id || ''} ${u.staff_id || ''} ${u.department || ''}`
        .toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  return (
    <AppLayout role="admin">
      <p className="text-sm text-gray-500 mb-6">View and manage all registered users on the platform.</p>

      {/* Summary chips */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { key: 'all',     label: `All (${users.length})`,       Icon: Users         },
          { key: 'student', label: `Students (${students.length})`, Icon: GraduationCap },
          { key: 'staff',   label: `Staff (${staff.length})`,      Icon: UserCheck     },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
              tab === key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
        <button onClick={fetchUsers} className="ml-auto p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
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
          placeholder="Search by name, email, ID…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="card text-center py-14">
          <Filter size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No users found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filter or search.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shown.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.full_name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                        u.role === 'student'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {u.role === 'student' ? 'Student' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.role === 'student' ? (
                        <div>
                          <p className="text-gray-700 text-xs">{u.student_id || '—'}</p>
                          <p className="text-gray-400 text-xs">{u.school || u.programme || ''}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700 text-xs">{u.staff_id || '—'}</p>
                          <p className="text-gray-400 text-xs">{u.department || ''}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {timeAgo(u.date_joined)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {confirmId === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deleting === u.id ? '…' : 'Confirm'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(u.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          <Trash2 size={15} />
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
