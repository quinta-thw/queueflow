import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    const { data } = await api.post('/auth/login/', { email, password, role })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register/student/', formData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // Staff registration no longer auto-logs in — account needs admin verification first.
  // Returns the user object but does NOT set auth state.
  const registerStaff = async (formData) => {
    const { data } = await api.post('/auth/register/staff/', formData)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') })
    } catch {}
    localStorage.clear()
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser }
    localStorage.setItem('user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerStaff, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
