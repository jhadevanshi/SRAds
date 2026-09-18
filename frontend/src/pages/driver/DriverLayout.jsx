import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, CarFront } from 'lucide-react'

export default function DriverLayout() {
  const navigate = useNavigate()
  const token = localStorage.getItem('driverToken')

  if (!token && window.location.pathname !== '/driver/login') {
    return <Navigate to="/driver/login" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('driverToken')
    navigate('/driver/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary-200">
      {token && (
        <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CarFront className="text-primary-400" size={24} />
              <h1 className="text-lg font-bold tracking-wide">Driver Portal</h1>
            </div>
            <button onClick={handleLogout} className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>
      )}
      <main className="flex-1 w-full max-w-md mx-auto relative">
        <Outlet />
      </main>
    </div>
  )
}
