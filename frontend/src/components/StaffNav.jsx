import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, BarChart2, User, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff/queues', icon: ListChecks, label: 'Queue Mgmt' },
  { to: '/staff/reports', icon: BarChart2, label: 'Reports' },
  { to: '/staff/profile', icon: User, label: 'Profile' },
]

export default function StaffNav() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/signin')
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-800">QueueFlow <span className="text-primary-500 text-sm font-medium">Staff</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/staff'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-500">Staff</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav for staff */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/staff'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
