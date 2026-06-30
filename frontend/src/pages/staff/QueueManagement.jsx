import { useState, useEffect } from 'react'
import {
  Play, Pause, Square, ChevronRight, Users, CheckCircle2,
  XCircle, RefreshCw, Send, Info, MapPin, Video
} from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusBadge = {
  waiting:   'bg-blue-100 text-blue-700',
  serving:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show:   'bg-red-100 text-red-600',
}

const SERVICE_INFO = {
  'Registrar':       'Academic records, transcripts, enrollment & graduation letters.',
  'Finance Office':  'Fee payments, balances, financial aid, invoices & receipts.',
  'Health Clinic':   'Medical consultations, prescriptions, referrals & student health.',
  'Student Affairs': 'Student welfare, counseling, clubs, discipline & campus life.',
  'ICT Support':     'Password resets, email setup, portal access & technical help.',
  'Library':         'Book borrowing, printing, research assistance & inter-library loans.',
  'Admissions':      'New student intake, transfers, re-admissions & documentation.',
  'Cafeteria':       'Meal plan management, catering bookings & dietary requests.',
  'Course Advisor':  'Unit registration, course selection, academic planning & appeals.',
}

function matchDeptToQueue(department, queues) {
  if (!department) return null
  const dept = department.toLowerCase()
  return queues.find(q =>
    q.service.name.toLowerCase().includes(dept) ||
    dept.includes(q.service.name.toLowerCase())
  ) || null
}

function BroadcastModal({ onClose }) {
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!title || !message) { toast.error('Please fill in title and message.'); return }
    setLoading(true)
    try {
      await api.post('/notifications/broadcast/', { title, message })
      toast.success('Broadcast sent to all students!')
      onClose()
    } catch {
      toast.error('Could not send broadcast.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 fade-in">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Send Announcement</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Queue delay notice" className="input-field" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="The Registrar queue will resume at 2 PM…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none h-24"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5">Cancel</button>
          <button onClick={send} disabled={loading} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StaffQueueManagement() {
  const { user } = useAuth()
  const [queues, setQueues]               = useState([])
  const [selectedQueue, setSelectedQueue] = useState(null)
  const [tickets, setTickets]             = useState([])
  const [filter, setFilter]               = useState('all')
  const [loading, setLoading]             = useState(true)
  const [showBroadcast, setShowBroadcast] = useState(false)

  useEffect(() => { fetchQueues() }, [])
  useEffect(() => { if (selectedQueue) fetchTickets(selectedQueue.id) }, [selectedQueue])

  const fetchQueues = async () => {
    try {
      const { data } = await api.get('/queues/queues/')
      setQueues(data)
      const deptQueue = matchDeptToQueue(user?.department, data)
      setSelectedQueue(prev => {
        if (!prev) return deptQueue || (data.length ? data[0] : null)
        // Refresh the selected queue with the latest server data
        return data.find(q => q.id === prev.id) || prev
      })
    } catch {
      toast.error('Could not load queues. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async (queueId) => {
    try {
      const { data } = await api.get('/queues/tickets/', { params: { queue: queueId } })
      setTickets(data)
    } catch {
      setTickets([])
    }
  }

  const queueAction = async (action) => {
    if (!selectedQueue) return
    try {
      const { data } = await api.post(`/queues/queues/${selectedQueue.id}/${action}/`)
      setSelectedQueue(data)
      toast.success(`Queue ${action === 'call_next' ? 'advanced' : action + 'ed'}.`)
      fetchQueues()
      if (action === 'call_next') fetchTickets(selectedQueue.id)
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} queue.`)
    }
  }

  const ticketAction = async (ticketId, action) => {
    try {
      await api.post(`/queues/tickets/${ticketId}/${action}/`)
      toast.success(`Ticket ${action.replace('_', ' ')}.`)
      fetchTickets(selectedQueue.id)
      fetchQueues()
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} ticket.`)
    }
  }

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  const isDeptQueue = (q) => {
    if (!user?.department) return false
    const dept = user.department.toLowerCase()
    return q.service.name.toLowerCase().includes(dept) || dept.includes(q.service.name.toLowerCase())
  }

  return (
    <AppLayout role="staff">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {user?.department
            ? `Managing queues — your department: ${user.department}`
            : 'Manage queues and student tickets.'}
        </p>
        <button
          onClick={() => setShowBroadcast(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <Send size={16} /> Broadcast
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Queue Selector */}
        <div className="lg:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Queue</p>
          <div className="space-y-2">
            {queues.map(q => (
              <button
                key={q.id}
                onClick={() => setSelectedQueue(q)}
                className={`w-full card text-left transition-all ${
                  selectedQueue?.id === q.id
                    ? 'border-2 border-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{q.service.name}</p>
                    {isDeptQueue(q) && (
                      <span className="text-xs bg-primary-100 text-primary-600 font-bold px-1.5 py-0.5 rounded">Mine</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                    q.status_display === 'open'   ? 'bg-green-100 text-green-700' :
                    q.status_display === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{q.status_display}</span>
                </div>
                {SERVICE_INFO[q.service.name] && (
                  <p className="text-xs text-gray-400 mb-2 leading-snug">{SERVICE_INFO[q.service.name]}</p>
                )}
                <div className="flex gap-4">
                  <span className="text-xs text-gray-500"><b className="text-blue-600">{q.waiting_count}</b> waiting</span>
                  <span className="text-xs text-gray-500"><b className="text-green-600">{q.served_count}</b> served</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!loading && queues.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-gray-500 text-sm mb-4">No queue has been started for your department today.</p>
              <button
                onClick={async () => {
                  try {
                    const { data } = await api.post('/queues/queues/start/')
                    toast.success('Queue started!')
                    setQueues([data])
                    setSelectedQueue(data)
                  } catch (err) {
                    toast.error(err.response?.data?.error || 'Could not start queue.')
                  }
                }}
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Play size={15} /> Start Today&apos;s Queue
              </button>
            </div>
          )}
          {selectedQueue && (() => {
            const servingId   = tickets.find(t => t.status === 'serving')?.id
            const totalServed = tickets.filter(t => t.status === 'completed').length
            const totalNoShow = tickets.filter(t => t.status === 'no_show').length
            const totalAll    = tickets.length

            return (
              <>
                {/* ── Queue Controls card ─────────────────────────── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-800">{selectedQueue.service?.name}</h2>
                    <button
                      onClick={() => { fetchQueues(); fetchTickets(selectedQueue.id) }}
                      className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  {SERVICE_INFO[selectedQueue.service?.name] && (
                    <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-4">
                      <Info size={13} className="text-primary-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-500 leading-relaxed">{SERVICE_INFO[selectedQueue.service?.name]}</p>
                    </div>
                  )}

                  {/* ── CLOSED ── */}
                  {!selectedQueue.is_open ? (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <Square size={14} className="text-red-400" />
                        <span className="font-semibold text-red-500">Queue is closed</span>
                      </div>
                      {/* Daily summary */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'Served',   value: totalServed, cls: 'text-green-600' },
                          { label: 'No Shows', value: totalNoShow, cls: 'text-red-500'   },
                          { label: 'Total',    value: totalAll,    cls: 'text-gray-700'  },
                        ].map(({ label, value, cls }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className={`text-2xl font-extrabold ${cls}`}>{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => queueAction('open')}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        <Play size={15} /> Open Queue Again
                      </button>
                    </div>

                  ) : selectedQueue.is_paused ? (
                    /* ── PAUSED ── */
                    <div>
                      <p className="text-sm text-yellow-600 font-semibold mb-3">Queue is paused — students cannot join.</p>
                      <div className="flex gap-2">
                        <button onClick={() => queueAction('resume')} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                          <Play size={14} /> Resume
                        </button>
                        <button onClick={() => queueAction('close')} className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                          <Square size={14} /> Close Queue
                        </button>
                      </div>
                    </div>

                  ) : selectedQueue.current_ticket ? (
                    /* ── SERVING ── */
                    <div>
                      <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Now Serving</p>
                      <div className="bg-primary-50 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-4xl font-extrabold text-primary-600 tracking-tight">
                            {selectedQueue.current_ticket.ticket_code}
                          </p>
                          <p className="text-base font-medium text-primary-500 mt-1">
                            {selectedQueue.current_ticket.student_name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => ticketAction(servingId, 'complete')}
                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                          >
                            <CheckCircle2 size={15} /> Complete
                          </button>
                          <button
                            onClick={() => ticketAction(servingId, 'no_show')}
                            className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                          >
                            <XCircle size={15} /> No Show
                          </button>
                        </div>
                      </div>
                    </div>

                  ) : selectedQueue.waiting_count > 0 ? (
                    /* ── WAITING — READY TO CALL NEXT ── */
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-bold text-primary-600">{selectedQueue.waiting_count}</span> student{selectedQueue.waiting_count !== 1 ? 's' : ''} waiting
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => queueAction('call_next')} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                          <ChevronRight size={15} /> Call Next
                        </button>
                        <button onClick={() => queueAction('pause')} className="flex items-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                          <Pause size={14} /> Pause
                        </button>
                        <button onClick={() => queueAction('close')} className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                          <Square size={14} /> Close
                        </button>
                      </div>
                    </div>

                  ) : (
                    /* ── EMPTY — no one waiting, no one serving ── */
                    <div>
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                        <p className="text-sm font-semibold text-gray-600">No more students in the queue</p>
                        <p className="text-xs text-gray-400 mt-1">{totalServed} served today</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => queueAction('close')} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                          <Square size={14} /> Close Queue
                        </button>
                        <button onClick={() => queueAction('pause')} className="flex items-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                          <Pause size={14} /> Pause (keep open)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Ticket List ─────────────────────────────────── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Today&apos;s Tickets</h3>
                    <div className="flex gap-1 flex-wrap">
                      {['all', 'waiting', 'serving', 'completed', 'no_show'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize transition-colors ${
                            filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {f.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredTickets.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">No tickets in this category.</p>
                    ) : filteredTickets.map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-800 w-16 text-sm">{ticket.ticket_code}</p>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{ticket.student?.first_name} {ticket.student?.last_name}</p>
                            <p className="text-xs text-gray-400">{new Date(ticket.joined_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.queue_type === 'virtual'
                            ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Video size={10} /> Virtual</span>
                            : <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><MapPin size={10} /> Physical</span>
                          }
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[ticket.status] || ''}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          {ticket.status === 'waiting' && (
                            <>
                              <button onClick={() => ticketAction(ticket.id, 'no_show')} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="No Show">
                                <XCircle size={14} />
                              </button>
                              <button onClick={() => ticketAction(ticket.id, 'complete')} className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded" title="Complete">
                                <CheckCircle2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}
    </AppLayout>
  )
}
