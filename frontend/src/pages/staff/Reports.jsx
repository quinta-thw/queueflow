import { useState, useEffect } from 'react'
import { TrendingUp, Users, Star, CheckCircle2, XCircle } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'

const emptyStats = {
  total: 0, completed: 0, no_show: 0, cancelled: 0,
  waiting: 0, serving: 0, avg_wait_minutes: 0, peak_hour: '—', completion_rate: 0,
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12} className={s <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value?.toFixed(1)}</span>
    </div>
  )
}

export default function StaffReports() {
  const [stats, setStats]                   = useState(emptyStats)
  const [feedbackSummary, setFeedbackSummary] = useState([])

  useEffect(() => {
    api.get('/queues/tickets/stats/').then(r => setStats(r.data)).catch(() => {})
    api.get('/feedback/summary/').then(r => setFeedbackSummary(r.data)).catch(() => {})
  }, [])

  return (
    <AppLayout role="staff">
      <p className="text-sm text-gray-500 mb-6">Today's queue performance summary.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Users,        label: 'Total Served',   value: stats.total,  color: 'text-primary-600', bg: 'bg-primary-50' },
          { icon: CheckCircle2, label: 'Completion Rate', value: `${stats.completion_rate || Math.round((stats.completed / stats.total) * 100) || 0}%`, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: XCircle,      label: 'No Shows',        value: stats.no_show, color: 'text-red-500',    bg: 'bg-red-50'     },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`card ${bg} text-center py-5`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 bg-white">
              <Icon size={20} className={color} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mb-6">
        {/* Status Breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500" />
            <h3 className="font-bold text-gray-800">Ticket Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Completed', value: stats.completed, total: stats.total, color: 'bg-green-500' },
              { label: 'Cancelled', value: stats.cancelled, total: stats.total, color: 'bg-gray-400'  },
              { label: 'No Shows',  value: stats.no_show,   total: stats.total, color: 'bg-red-400'   },
            ].map(({ label, value, total, color }) => {
              const pct = total ? Math.round((value / total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="font-bold text-gray-800">{value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 text-center">
            {[
              { label: 'Waiting', value: stats.waiting || 0, color: 'text-blue-600'  },
              { label: 'Serving', value: stats.serving || 0, color: 'text-yellow-600'},
              { label: 'Total',   value: stats.total,         color: 'text-gray-800'  },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-yellow-400" />
          <h3 className="font-bold text-gray-800">Student Satisfaction by Service</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left pb-3">Service</th>
                <th className="text-center pb-3">Ratings</th>
                <th className="text-center pb-3">Average Score</th>
                <th className="text-right pb-3">Stars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feedbackSummary.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No feedback submitted yet.</td></tr>
              ) : feedbackSummary.map(row => (
                <tr key={row.service} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{row.service}</td>
                  <td className="py-3 text-center text-gray-500">{row.total_ratings}</td>
                  <td className="py-3 text-center font-bold text-gray-800">{row.average_rating ? `${row.average_rating}/5` : '—'}</td>
                  <td className="py-3 flex justify-end"><StarRating value={row.average_rating} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
