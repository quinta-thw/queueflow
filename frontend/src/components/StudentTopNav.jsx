import { NavLink, useNavigate } from 'react-router-dom'
import { Home, List, Ticket, Bell, User, GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/student', icon: Home, label: 'Home' },
  { to: '/student/services', icon: List, label: 'Queues' },
  { to: '/student/ticket', icon: Ticket, label: 'My Ticket' },
  { to: '/student/alerts', icon: Bell, label: 'Alerts' },
  { to: '/student/profile', icon: User, label: 'Profile' },
]

export default function StudentTopNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/signin')
  }

  return (
    <header className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-800">USIU <span className="text-primary-500">Queue</span></span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400">{user?.student_id}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-sm">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
