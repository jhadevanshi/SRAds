import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CarFront, Phone, Lock, ArrowRight } from 'lucide-react'

export default function DriverLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/driver/login', { phone, password })
      if (res.data.success) {
        localStorage.setItem('driverToken', res.data.token)
        navigate('/driver/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CarFront size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Login</h1>
          <p className="text-gray-500 mt-2 text-sm">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base outline-none text-gray-900"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base outline-none text-gray-900"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:shadow-none flex justify-center items-center gap-2 mt-4"
          >
            {loading ? 'Logging in...' : 'Login securely'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
