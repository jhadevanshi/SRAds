import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)

    // Global 401 interceptor — catches stale/invalid tokens from any API call
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          clearSession()
        }
        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password })
    const { token, user } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)

    return user
  }

  const logout = () => {
    clearSession()
  }

  const value = { user, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
