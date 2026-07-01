import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CheckCircle2, Play, Pause, Square, ChevronRight, RefreshCw, Info
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Service descriptions shown on each queue card
const SERVICE_INFO = {
  'Registrar':       'Academic records, transcripts, enrollment & graduation letters.',
  'Finance Office':  'Fee payments, balances, financial aid, invoices & receipts.',
  'Health Clinic':   'Medical consultations, prescriptions, referrals & student health.',
  'Student Affairs': 'Student welfare, counseling, clubs, discipline & campus life.',
  'ICT Support':     'Password resets, email setup, portal access & technical help.',
  'Library':         'Book borrowing, printing, research assistance & inter-library loans.',
  'Admissions':      'New student intake, transfers, re-admissions & documentation.',
  'Course Advisor':  'Unit registration, course selection, academic planning & appeals.',
}

// Match staff department to a service name (handles partial/case differences)
function matchDeptToService(department, queues) {
  if (!department) return queues
  const dept = department.toLowerCase()
  const matched = queues.filter(q =>
    q.service.name.toLowerCase().includes(dept) ||
    dept.includes(q.service.name.toLowerCase())
  )
  return matched.length > 0 ? matched : queues
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [queues, setQueues] = useState([])
  const [stats, setStats]   = useState({ total: 0, waiting: 0, serving: 0, completed: 0, no_show: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        api.get('/queues/queues/'),
        api.get('/queues/tickets/stats/'),
      ])
      setQueues(qRes.data)
      setStats(sRes.data)
    } catch {
      toast.error('Could not load queue data. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const queueAction = async (queueId, action) => {
    try {
      await api.post(`/queues/queues/${queueId}/${action}/`)
      toast.success(`Queue ${action}ed.`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || `Could not ${action} queue.`)
    }
  }

  const callNext = async (queueId) => {
    try {
      const { data } = await api.post(`/queues/queues/${queueId}/call_next/`)
      toast.success(data.ticket_code ? `Calling ${data.ticket_code}` : 'No more tickets.')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not call next.')
    }
  }

  const statusColors = {
    open:   'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-500',
  }

  // Only show the queue(s) matching this staff member's department
  const myQueues = matchDeptToService(user?.department, queues)
  const showingAll = myQueues.length === queues.length && queues.length > 1

  return (
    <AppLayout role="staff">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 mb-6 text-white">
        <p className="text-primary-100 text-sm">{getGreeting()},</p>
        <h2 className="text-2xl font-extrabold">{user?.first_name} {user?.last_name}</h2>
        <p className="text-primary-200 text-sm mt-1">
          {user?.department || 'Staff'} &bull; Today's queue overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Today', value: stats.total,     color: 'text-gray-800',   bg: 'bg-white'     },
          { label: 'Waiting',     value: stats.waiting,   color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Serving',     value: stats.serving,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Completed',   value: stats.completed, color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'No Shows',    value: stats.no_show,   color: 'text-red-500',    bg: 'bg-red-50'    },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card ${bg} text-center py-4`}>
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Queue Cards */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-800">
            {showingAll ? 'All Active Queues' : `${user?.department} Queue`}
          </h2>
          {!showingAll && (
            <p className="text-xs text-gray-400 mt-0.5">
              {SERVICE_INFO[user?.department] || 'Manage your department queue below.'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => navigate('/staff/queues')} className="text-primary-500 text-sm font-semibold flex items-center gap-1">
            Manage <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : myQueues.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No queue found for your department today.</p>
          <button onClick={() => navigate('/staff/queues')} className="mt-3 text-primary-500 text-sm font-semibold">
            View all queues →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myQueues.map(queue => (
            <div key={queue.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">{queue.service.name}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[queue.status_display] || 'bg-gray-100 text-gray-500'}`}>
                  {queue.status_display}
                </span>
              </div>

              {/* Service description */}
              {SERVICE_INFO[queue.service.name] && (
                <div className="flex items-start gap-1.5 mb-3">
                  <Info size={11} className="text-gray-300 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">{SERVICE_INFO[queue.service.name]}</p>
                </div>
              )}

              {queue.current_ticket ? (
                <div className="bg-primary-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider">Now Serving</p>
                  <p className="text-2xl font-extrabold text-primary-600">{queue.current_ticket.ticket_code}</p>
                  <p className="text-xs text-primary-400">{queue.current_ticket.student_name}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-center">
                  <p className="text-sm text-gray-400">No ticket being served</p>
                </div>
              )}

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">{queue.waiting_count} waiting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">{queue.served_count} served</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!queue.is_open ? (
                  <button onClick={() => queueAction(queue.id, 'open')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                    <Play size={13} /> Open Queue
                  </button>
                ) : queue.is_paused ? (
                  <>
                    <button onClick={() => queueAction(queue.id, 'resume')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                      <Play size={13} /> Resume
                    </button>
                    <button onClick={() => queueAction(queue.id, 'close')}
                      className="flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      <Square size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => callNext(queue.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                      <ChevronRight size={13} /> Call Next
                    </button>
                    <button onClick={() => queueAction(queue.id, 'pause')}
                      className="flex items-center justify-center bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      <Pause size={13} />
                    </button>
                    <button onClick={() => queueAction(queue.id, 'close')}
                      className="flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      <Square size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
