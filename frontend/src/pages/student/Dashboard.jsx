import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, ChevronRight, Plus, BookOpen, DollarSign, Heart, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import JoinModal from '../../components/JoinModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const serviceIcons = {
  registrar: BookOpen, finance: DollarSign, health: Heart, student_affairs: Users,
  course_advisor: BookOpen,
}
const iconColors = {
  registrar:      'text-blue-500 bg-blue-50',
  finance:        'text-green-500 bg-green-50',
  health:         'text-red-500 bg-red-50',
  student_affairs:'text-purple-500 bg-purple-50',
  course_advisor: 'text-teal-500 bg-teal-50',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [queueMap, setQueueMap] = useState({})
  const [activeTickets, setActiveTickets] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [stats, setStats] = useState({ activeQueues: 0, myTickets: 0 })
  const [modal, setModal] = useState(null)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [sRes, qRes, aRes, rRes] = await Promise.all([
        api.get('/services/'),
        api.get('/queues/queues/'),
        api.get('/queues/tickets/active/'),
        api.get('/queues/tickets/'),
      ])
      const activeServices = sRes.data.filter(s => s.is_active)
      // Only count queues with real people — open + not paused + at least 1 waiting or serving
      const openQueues = qRes.data.filter(q =>
        q.is_open && !q.is_paused && (q.waiting_count > 0 || q.current_ticket !== null)
      )
      const activeTickets = aRes.data

      // build service_id → queue lookup for live stats on cards
      const map = {}
      qRes.data.forEach(q => { map[q.service.id] = q })

      setServices(activeServices.slice(0, 8))
      setQueueMap(map)
      setActiveTickets(activeTickets)
      setRecentTickets(rRes.data.slice(0, 5))
      setStats({
        activeQueues: openQueues.length,
        myTickets: activeTickets.length,
      })
    } catch {
      toast.error('Could not load dashboard data. Check your connection.')
    }
  }

  const joinQueue = async (queueType) => {
    if (!modal) return
    setJoining(modal.id)
    try {
      const { data } = await api.post('/queues/queues/join/', { service_id: modal.id, queue_type: queueType })
      toast.success(`Joined queue! Your ticket: ${data.ticket_code}`)
      setModal(null)
      navigate('/student/ticket')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join queue.')
    } finally {
      setJoining(null)
    }
  }

  return (
    <>
    <AppLayout role="student">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 mb-6 text-white">
        <p className="text-primary-100 text-sm">{getGreeting()},</p>
        <h2 className="text-2xl font-extrabold mt-0.5">{user?.first_name} {user?.last_name}</h2>
        <p className="text-primary-200 text-sm mt-1">{user?.programme} &bull; {user?.student_id}</p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {[
            { label: 'Total Queues', value: stats.activeQueues },
            { label: 'My Queues',    value: stats.myTickets },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-primary-100 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Ticket Banner */}
      {activeTickets.length > 0 && (
        <div className="mb-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {activeTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => navigate('/student/ticket')}
              className="bg-white rounded-2xl shadow-sm border border-primary-100 p-4 border-l-4 border-l-primary-500 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Active Ticket</p>
                  <p className="text-2xl font-extrabold text-gray-900">{ticket.ticket_code}</p>
                  <p className="text-sm text-gray-500">{ticket.service_name} &bull; {ticket.people_ahead} ahead</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Est. wait</p>
                  <p className="text-xl font-bold text-gray-800">~{ticket.estimated_wait}m</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Services */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 text-base">Active Services Today</h2>
        <button onClick={() => navigate('/student/services')} className="text-primary-500 text-sm font-semibold flex items-center gap-1 hover:underline">
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {services.map(service => {
          const Icon = serviceIcons[service.icon] || BookOpen
          const colors = iconColors[service.icon] || 'text-blue-500 bg-blue-50'
          const q = queueMap[service.id]
          const waiting = q?.waiting_count ?? 0
          const isOpen  = !q || (q.is_open && !q.is_paused)   // no queue yet = joinable

          return (
            <button
              key={service.id}
              onClick={() => isOpen && setModal({ id: service.id, name: service.name })}
              disabled={!isOpen}
              className={`card text-left transition-all group ${isOpen ? 'hover:shadow-md active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors}`}>
                <Icon size={18} />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{service.name}</p>
              <div className="mt-0.5">
                {waiting > 0
                  ? <span className="text-xs font-semibold text-primary-600">{waiting} {waiting === 1 ? 'person' : 'people'} ahead</span>
                  : <span className="text-xs text-gray-400">No one waiting</span>
                }
              </div>
              {isOpen
                ? <p className="text-xs text-primary-500 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Tap to join →</p>
                : <p className="text-xs text-gray-400 mt-2">Closed</p>
              }
            </button>
          )
        })}
      </div>

      {/* Recent Activity */}
      {recentTickets.length > 0 && (
        <>
          <h2 className="font-bold text-gray-800 text-base mb-3">Recent Activity</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {recentTickets.map(ticket => (
              <div key={ticket.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Ticket size={14} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{ticket.service_name}</p>
                    <p className="text-xs text-gray-400">{ticket.ticket_code} &bull; {new Date(ticket.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  ticket.status === 'completed' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'waiting'   ? 'bg-blue-100 text-blue-700' :
                  ticket.status === 'serving'   ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{ticket.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => navigate('/student/services')}
        className="md:hidden fixed bottom-6 right-4 w-12 h-12 bg-primary-500 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all z-40"
      >
        <Plus size={22} className="text-white" />
      </button>
    </AppLayout>

    {modal && (
      <JoinModal
        serviceName={modal.name}
        loading={joining === modal.id}
        onConfirm={joinQueue}
        onClose={() => setModal(null)}
      />
    )}
    </>
  )
}
