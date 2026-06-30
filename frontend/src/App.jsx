import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import SignIn from './pages/SignIn'
import StudentSignUp from './pages/StudentSignUp'
import StaffSignUp from './pages/StaffSignUp'
import StudentDashboard from './pages/student/Dashboard'
import StudentServices from './pages/student/Services'
import MyTicket from './pages/student/MyTicket'
import StudentAlerts from './pages/student/Alerts'
import StudentProfile from './pages/student/Profile'
import StaffDashboard from './pages/staff/Dashboard'
import StaffQueueManagement from './pages/staff/QueueManagement'
import StaffReports from './pages/staff/Reports'
import StaffProfile from './pages/staff/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import StaffVerification from './pages/admin/StaffVerification'

function homeFor(user) {
  if (!user) return '/signin'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'staff') return '/staff'
  return '/student'
}

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/signin" replace />
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={user ? <Navigate to="/student" replace /> : <StudentSignUp />} />
        <Route path="/signup/staff" element={user ? <Navigate to={homeFor(user)} replace /> : <StaffSignUp />} />

        {/* Student routes */}
        <Route path="/student"          element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/services" element={<PrivateRoute role="student"><StudentServices /></PrivateRoute>} />
        <Route path="/student/ticket"   element={<PrivateRoute role="student"><MyTicket /></PrivateRoute>} />
        <Route path="/student/alerts"   element={<PrivateRoute role="student"><StudentAlerts /></PrivateRoute>} />
        <Route path="/student/profile"  element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />

        {/* Staff routes */}
        <Route path="/staff"        element={<PrivateRoute role="staff"><StaffDashboard /></PrivateRoute>} />
        <Route path="/staff/queues" element={<PrivateRoute role="staff"><StaffQueueManagement /></PrivateRoute>} />
        <Route path="/staff/reports"element={<PrivateRoute role="staff"><StaffReports /></PrivateRoute>} />
        <Route path="/staff/profile"element={<PrivateRoute role="staff"><StaffProfile /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin"        element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/staff"  element={<PrivateRoute role="admin"><StaffVerification /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
