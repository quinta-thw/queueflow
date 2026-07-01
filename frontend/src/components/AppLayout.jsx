import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap, LayoutDashboard, List, Ticket, Bell, User, Users,
  ListChecks, BarChart2, Send, LogOut, ChevronRight, Menu, X,
  Home, Settings, BookOpen
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const studentNav = [
  {
    items: [
      { to: '/student', icon: Home, label: 'Dashboard', end: true },
    ]
  },
  {
    section: 'SERVICES',
    items: [
      { to: '/student/services', icon: List,   label: 'Browse Services' },
      { to: '/student/ticket',   icon: Ticket, label: 'My Ticket' },
    ]
  },
  {
    section: 'ACCOUNT',
    items: [
      { to: '/student/alerts',  icon: Bell, label: 'Alerts' },
      { to: '/student/profile', icon: User, label: 'Profile' },
    ]
  },
]

const staffNav = [
  {
    items: [
      { to: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    section: 'QUEUE MANAGEMENT',
    items: [
      { to: '/staff/queues',   icon: ListChecks, label: 'Queue Control' },
      { to: '/staff/reports',  icon: BarChart2,  label: 'Reports' },
    ]
  },
  {
    section: 'ACCOUNT',
    items: [
      { to: '/staff/profile', icon: User, label: 'Profile' },
    ]
  },
]

const adminNav = [
  {
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    section: 'MANAGEMENT',
    items: [
      { to: '/admin/staff', icon: ListChecks, label: 'Staff Verification' },
      { to: '/admin/users', icon: Users,      label: 'User Management'    },
    ]
  },
]

function Sidebar({ isOpen, onClose, role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = role === 'admin' ? adminNav : role === 'staff' ? staffNav : studentNav

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/signin')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-sm leading-none">QueueFlow</p>
              <p className="text-xs text-gray-400 mt-0.5">USIU-Africa</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {nav.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={isActive ? 'text-primary-500' : 'text-gray-400'} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User card + logout at bottom */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-primary-600 font-bold text-xs">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

function TopBar({ onMenuClick, role }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/signin')
  }

  useEffect(() => {
    api.get('/notifications/unread_count/')
      .then(r => setUnread(r.data.count))
      .catch(() => {})
  }, [location.pathname])

  // Derive page title from pathname
  const getTitle = () => {
    const p = location.pathname
    if (p === '/student' || p === '/staff' || p === '/admin') return 'Dashboard'
    if (p.includes('services')) return 'Service Directory'
    if (p.includes('ticket')) return 'My Ticket'
    if (p.includes('alerts')) return 'Alerts'
    if (p.includes('profile')) return 'Profile'
    if (p.includes('queues')) return 'Queue Control'
    if (p.includes('reports')) return 'Reports & Analytics'
    if (p.includes('users')) return 'User Management'
    if (p.includes('staff')) return 'Staff Verification'
    return 'QueueFlow'
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-gray-100 z-20 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => role !== 'admin' && navigate(role === 'staff' ? '/staff' : '/student/alerts')}
          className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User */}
        <button
          onClick={() => navigate(role === 'admin' ? '/admin' : role === 'staff' ? '/staff/profile' : '/student/profile')}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-xs">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </button>

        {/* Logout — always visible in top bar */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

export default function AppLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} role={role} />

      {/* Main content */}
      <main className="md:ml-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
