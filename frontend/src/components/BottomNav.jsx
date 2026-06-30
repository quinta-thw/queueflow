import { NavLink } from 'react-router-dom'
import { Home, List, Ticket, Bell, User } from 'lucide-react'

const navItems = [
  { to: '/student', icon: Home, label: 'Home' },
  { to: '/student/services', icon: List, label: 'Queues' },
  { to: '/student/ticket', icon: Ticket, label: 'My Ticket' },
  { to: '/student/alerts', icon: Bell, label: 'Alerts' },
  { to: '/student/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/student'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
