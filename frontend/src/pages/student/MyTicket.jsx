import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Users, CheckCircle2, XCircle, RefreshCw, Star } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusConfig = {
  waiting:   { label: 'Waiting',     color: 'text-blue-600 bg-blue-50',    bar: 'bg-blue-500'   },
  serving:   { label: 'Now Serving', color: 'text-yellow-600 bg-yellow-50',bar: 'bg-yellow-500' },
  completed: { label: 'Completed',   color: 'text-green-600 bg-green-50',  bar: 'bg-green-500'  },
  cancelled: { label: 'Cancelled',   color: 'text-red-600 bg-red-50',      bar: 'bg-red-400'    },
  no_show:   { label: 'No Show',     color: 'text-gray-600 bg-gray-50',    bar: 'bg-gray-400'   },
}

function FeedbackModal({ ticket, onClose }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating.'); return }
    setLoading(true)
    try {
      await api.post('/feedback/', { service: ticket.queue, rating, comment })
      toast.success('Feedback submitted. Thank you!')
      onClose()
    } catch { toast.error('Could not submit feedback.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 fade-in">
        <h3 className="font-bold text-gray-800 text-lg mb-1">Rate your experience</h3>
        <p className="text-gray-400 text-sm mb-5">{ticket.service_name}</p>
        <div className="flex justify-center gap-3 mb-5">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
              <Star size={32} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Any comments? (optional)"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none h-20" />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5">Skip</button>
          <button onClick={submit} disabled={loading} className="flex-1 btn-primary py-2.5 disabled:opacity-60">Submit</button>
        </div>
      </div>
    </div>
  )
}

export default function MyTicket() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackTicket, setFeedbackTicket] = useState(null)

  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/queues/tickets/')
      setTickets(data)
    } catch { setTickets([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 15000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  const cancelTicket = async (id) => {
    try {
      await api.post(`/queues/tickets/${id}/cancel/`)
      toast.success('Ticket cancelled.')
      fetchTickets()
    } catch (err) { toast.error(err.response?.data?.error || 'Could not cancel.') }
  }

  const activeTickets = tickets.filter(t => ['waiting','serving'].includes(t.status))
  const pastTickets   = tickets.filter(t => !['waiting','serving'].includes(t.status))

  return (
    <AppLayout role="student">
      {/* Refresh header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Live queue position tracker — updates every 15s</p>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Active Tickets */}
          {activeTickets.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {activeTickets.map(ticket => {
                const cfg = statusConfig[ticket.status] || statusConfig.waiting
                const progress = ticket.status === 'serving' ? 90 : Math.max(10, 100 - (ticket.people_ahead * 20))
                return (
                  <div key={ticket.id} className="card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <p className="text-xs text-gray-400 font-medium">{ticket.service_name}</p>
                    </div>

                    <div className="text-center my-6">
                      <p className="text-xs text-gray-400 mb-1">Your ticket</p>
                      <p className="text-5xl font-extrabold text-gray-900 tracking-wider">{ticket.ticket_code}</p>
                    </div>

                    <div className="mb-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${cfg.bar} transition-all duration-500`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { icon: Users,  label: 'Ahead',    value: ticket.people_ahead },
                        { icon: Ticket, label: 'Position', value: `#${ticket.ticket_number}` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <Icon size={14} className="text-gray-400 mx-auto mb-1" />
                          <p className="font-bold text-gray-800 text-sm">{value}</p>
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    {ticket.status === 'serving' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center mb-3">
                        <p className="text-yellow-700 font-semibold text-sm">It's your turn! Please proceed to the counter.</p>
                      </div>
                    )}

                    {ticket.status === 'waiting' && (
                      <button onClick={() => cancelTicket(ticket.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors">
                        <XCircle size={16} /> Cancel ticket
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card text-center py-14 mb-8 max-w-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket size={28} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-600">No active tickets</p>
              <p className="text-sm text-gray-400 mt-1">Join a queue from the services page.</p>
              <button onClick={() => navigate('/student/services')}
                className="mt-4 bg-primary-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-600 transition-colors">
                Browse services
              </button>
            </div>
          )}

          {/* History */}
          {pastTickets.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Queue History</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {pastTickets.map(ticket => {
                  const cfg = statusConfig[ticket.status] || statusConfig.waiting
                  return (
                    <div key={ticket.id} className="card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                          {ticket.status === 'completed' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{ticket.service_name}</p>
                          <p className="text-xs text-gray-400">{ticket.ticket_code} &bull; {new Date(ticket.joined_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        {ticket.status === 'completed' && (
                          <button onClick={() => setFeedbackTicket(ticket)} className="text-yellow-400 hover:text-yellow-500">
                            <Star size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {feedbackTicket && <FeedbackModal ticket={feedbackTicket} onClose={() => setFeedbackTicket(null)} />}
    </AppLayout>
  )
}
