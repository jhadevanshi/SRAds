import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import Advertisers from './pages/Advertisers'
import Devices from './pages/Devices'
import Drivers from './pages/Drivers'
import Media from './pages/Media'
import Ads from './pages/Ads'
import Campaigns from './pages/Campaigns'

import Logs from './pages/Logs'
import LiveMap from './pages/LiveMap'
import PlaybackHistory from './pages/PlaybackHistory'

// Driver Portal
import DriverLayout from './pages/driver/DriverLayout'
import DriverLogin from './pages/driver/DriverLogin'
import DriverDashboard from './pages/driver/DriverDashboard'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="live-map"         element={<LiveMap />} />
            <Route path="advertisers"      element={<Advertisers />} />
            <Route path="devices"          element={<Devices />} />
            <Route path="drivers"          element={<Drivers />} />
            <Route path="media"            element={<Media />} />
            <Route path="ads"              element={<Ads />} />
            <Route path="playback-history" element={<PlaybackHistory />} />

            <Route path="logs"             element={<Logs />} />
          </Route>

          {/* Driver Portal Routes */}
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="login" element={<DriverLogin />} />
            <Route path="dashboard" element={<DriverDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
