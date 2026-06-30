import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, DollarSign, Heart, Users, Wifi, BookMarked,
  Coffee, ClipboardList, Lock, PauseCircle,
} from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import JoinModal from '../../components/JoinModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const iconMap = {
  registrar:       { Icon: BookOpen,      color: 'bg-blue-50 text-blue-500'    },
  finance:         { Icon: DollarSign,    color: 'bg-green-50 text-green-500'  },
  health:          { Icon: Heart,         color: 'bg-red-50 text-red-500'      },
  student_affairs: { Icon: Users,         color: 'bg-purple-50 text-purple-500'},
  ict:             { Icon: Wifi,          color: 'bg-cyan-50 text-cyan-500'    },
  library:         { Icon: BookMarked,    color: 'bg-amber-50 text-amber-500'  },
  cafeteria:       { Icon: Coffee,        color: 'bg-orange-50 text-orange-500'},
  admissions:      { Icon: ClipboardList, color: 'bg-indigo-50 text-indigo-500'},
  course_advisor:  { Icon: ClipboardList, color: 'bg-teal-50 text-teal-500'   },
}

export default function StudentServices() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [queueMap, setQueueMap] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)
  const [modal, setModal] = useState(null)   // { id, name } of service being joined

  useEffect(() => {
    Promise.all([api.get('/services/'), api.get('/queues/queues/')])
      .then(([sRes, qRes]) => {
        setServices(sRes.data)
        const map = {}
        qRes.data.forEach(q => { map[q.service.id] = q })
        setQueueMap(map)
      })
      .catch(() => toast.error('Could not load services. Check your connection.'))
      .finally(() => setLoading(false))
  }, [])

  const joinQueue = async (queueType) => {
    if (!modal) return
    setJoining(modal.id)
    try {
      const { data } = await api.post('/queues/queues/join/', { service_id: modal.id, queue_type: queueType })
      toast.success(`Joined ${modal.name}! Ticket: ${data.ticket_code}`)
      setModal(null)
      navigate('/student/ticket')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join queue.')
    } finally {
      setJoining(null)
    }
  }

  const getQueueStatus = (service) => {
    if (!service.is_active) return 'inactive'
    const q = queueMap[service.id]
    if (!q) return 'open'                    // no queue yet — student joining will create it
    if (q.is_paused) return 'paused'
    if (!q.is_open) return 'closed'          // staff explicitly closed it
    return 'open'
  }

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const open    = filtered.filter(s => getQueueStatus(s) === 'open')
  const paused  = filtered.filter(s => getQueueStatus(s) === 'paused')
  const closed  = filtered.filter(s => ['closed', 'inactive'].includes(getQueueStatus(s)))

  const ServiceCard = ({ service, status }) => {
    const { Icon, color } = iconMap[service.icon] || { Icon: ClipboardList, color: 'bg-gray-50 text-gray-500' }
    const q = queueMap[service.id]
    const isJoinable = status === 'open'
    const waiting = q?.waiting_count ?? 0

    const badge = {
      open:     <span className="shrink-0 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>,
      paused:   <span className="shrink-0 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Paused</span>,
      closed:   <span className="shrink-0 text-xs font-semibold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Closed</span>,
      inactive: <span className="shrink-0 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Closed</span>,
    }[status]

    return (
      <div className={`card flex flex-col gap-3 transition-shadow ${isJoinable ? 'hover:shadow-md' : 'opacity-60'}`}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">{service.name}</p>
            <div className="mt-1">
              {isJoinable
                ? waiting > 0
                  ? <span className="text-xs font-semibold text-primary-600">{waiting} {waiting === 1 ? 'person' : 'people'} ahead</span>
                  : <span className="text-xs text-gray-400">No one waiting</span>
                : null
              }
            </div>
          </div>
          {badge}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>

        {/* Action */}
        {isJoinable ? (
          <button
            onClick={() => setModal({ id: service.id, name: service.name })}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 mt-auto"
          >
            Join Queue
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-400 text-sm mt-auto">
            {status === 'paused'
              ? <><PauseCircle size={15} /> Queue is paused</>
              : <><Lock size={14} /> Closed by staff</>}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    <AppLayout role="student">
      {/* Search */}
      <div className="relative mb-6 max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Available Now</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {open.map(s => <ServiceCard key={s.id} service={s} status="open" />)}
              </div>
            </section>
          )}

          {paused.length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-4">Temporarily Paused</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paused.map(s => <ServiceCard key={s.id} service={s} status="paused" />)}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Closed by Staff</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {closed.map(s => <ServiceCard key={s.id} service={s} status={getQueueStatus(s)} />)}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No services match "{search}"</p>
            </div>
          )}
        </>
      )}
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
