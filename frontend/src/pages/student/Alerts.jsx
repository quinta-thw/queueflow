import { useState, useEffect } from 'react'
import {
  Bell, CheckCheck, Trash2, Ticket, AlertCircle,
  CheckCircle2, XCircle, PauseCircle, Megaphone,
} from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const typeConfig = {
  queue_joined:      { icon: Ticket,       bg: 'bg-blue-100',   icon_color: 'text-blue-600',   label: 'Queue Joined'      },
  almost_turn:       { icon: AlertCircle,  bg: 'bg-amber-100',  icon_color: 'text-amber-600',  label: 'Almost Your Turn'  },
  your_turn:         { icon: Bell,         bg: 'bg-green-100',  icon_color: 'text-green-600',  label: 'Your Turn!'        },
  queue_cancelled:   { icon: XCircle,      bg: 'bg-red-100',    icon_color: 'text-red-600',    label: 'Queue Closed'      },
  queue_paused:      { icon: PauseCircle,  bg: 'bg-yellow-100', icon_color: 'text-yellow-600', label: 'Queue Paused'      },
  announcement:      { icon: Megaphone,    bg: 'bg-primary-100',icon_color: 'text-primary-600',label: 'Announcement'      },
  queue_progressing: { icon: CheckCircle2, bg: 'bg-purple-100', icon_color: 'text-purple-600', label: 'Queue Update'      },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function groupByDay(notifications) {
  const groups = []
  const map = {}
  const today    = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  notifications.forEach(n => {
    const d = new Date(n.created_at).toDateString()
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(n.created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!map[label]) { map[label] = []; groups.push({ label, items: map[label] }) }
    map[label].push(n)
  })
  return groups
}

export default function StudentAlerts() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/')
      .then(r => setNotifications(r.data))
      .catch(() => toast.error('Could not load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    try { await api.post('/notifications/mark_all_read/') } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('All marked as read.')
  }

  const markRead = async (id) => {
    try { await api.post(`/notifications/${id}/mark_read/`) } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const deleteNotification = async (id) => {
    try { await api.delete(`/notifications/${id}/`) } catch {}
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const groups = groupByDay(notifications)

  return (
    <AppLayout role="student">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : "You're all caught up"}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">We'll notify you about your queue status here.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Day label */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{label}</p>

              <div className="space-y-2">
                {items.map(n => {
                  const cfg = typeConfig[n.notification_type] || typeConfig.announcement
                  const Icon = cfg.icon
                  const isActionable = n.notification_type === 'your_turn'

                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={`relative flex items-start gap-4 rounded-2xl px-4 py-4 transition-all cursor-pointer
                        ${!n.is_read ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-50 border border-transparent'}
                        ${isActionable && !n.is_read ? 'border-l-4 border-l-green-500 bg-green-50' : ''}
                        hover:shadow-md`}
                    >
                      {/* Unread dot */}
                      {!n.is_read && (
                        <span className="absolute top-4 right-10 w-2 h-2 bg-primary-500 rounded-full" />
                      )}

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon size={18} className={cfg.icon_color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.icon_color}`}>
                              {cfg.label}
                            </span>
                            {n.sender_department && (
                              <span className="ml-2 text-xs text-primary-500 font-semibold">{n.sender_department}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className={`text-sm mt-1.5 leading-relaxed ${!n.is_read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                          {n.message}
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
