import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Wallet, Navigation, Clock, PlaySquare, Car, ShieldAlert, Activity, MonitorSmartphone } from 'lucide-react'

export default function DriverDashboard() {
  const [profile, setProfile] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('driverToken')
      const headers = { Authorization: `Bearer ${token}` }
      
      const [profRes, dashRes, histRes] = await Promise.all([
        axios.get('/api/driver/profile', { headers }),
        axios.get('/api/driver/dashboard', { headers }),
        axios.get('/api/driver/history', { headers })
      ])
      
      setProfile(profRes.data.profile)
      setDashboard(dashRes.data.dashboard)
      setHistory(histRes.data.history)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) {
        localStorage.removeItem('driverToken')
        window.location.href = '/driver/login'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 15000) // refresh every 15s
    return () => clearInterval(t)
  }, [fetchData])

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const today = dashboard?.today || {}
  const device = dashboard?.device || {}

  const activeHrs = Math.floor((today.active_minutes || 0) / 60)
  const activeMins = Math.round((today.active_minutes || 0) % 60)

  // Determine max values for the simple charts
  const maxIncome = Math.max(...history.map(h => Number(h.income) || 0), 1)
  const maxDist = Math.max(...history.map(h => Number(h.distance_km) || 0), 1)
  const maxMins = Math.max(...history.map(h => Number(h.active_minutes) || 0), 1)

  const StatCard = ({ icon: Icon, title, value, subtitle, colorClass }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )

  const SimpleBarChart = ({ data, dataKey, maxValue, title, formatValue, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No data for last 7 days</p>
      ) : (
        <div className="flex items-end justify-between gap-2 h-32 pt-2">
          {data.map((d, i) => {
            const val = Number(d[dataKey]) || 0
            const heightPct = Math.max((val / maxValue) * 100, 2)
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="w-full flex justify-center relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded pointer-events-none">
                    {formatValue(val)}
                  </div>
                  <div 
                    className={`w-full max-w-[24px] rounded-t-sm transition-all ${color}`} 
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 uppercase">
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-4 pb-12">
      <div className="mb-6 mt-2">
        <h2 className="text-xl font-bold text-gray-900">Hello, {profile?.name}</h2>
        <p className="text-sm text-gray-500">Here's your performance for today</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <StatCard 
          icon={Wallet} 
          title="Today's Income" 
          value={`₹ ${parseFloat(today.income || 0).toFixed(2)}`}
          colorClass="bg-green-100 text-green-600"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={Navigation} 
            title="Distance" 
            value={`${parseFloat(today.distance_km || 0).toFixed(1)} km`}
            colorClass="bg-blue-100 text-blue-600"
          />
          <StatCard 
            icon={Clock} 
            title="Active Hours" 
            value={`${activeHrs}h ${activeMins}m`}
            colorClass="bg-purple-100 text-purple-600"
          />
        </div>

        <StatCard 
          icon={PlaySquare} 
          title="Ads Played Today" 
          value={today.ads_played || 0}
          subtitle="Total advertisements broadcasted"
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-4 px-1">Device & Vehicle</h3>
      <div className="bg-gray-900 rounded-2xl p-5 text-white mb-8 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Car size={120} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Vehicle</p>
              <p className="font-bold text-xl">{device.vehicle_number || profile?.vehicle_number}</p>
              <p className="text-sm text-primary-300">{device.vehicle_type || profile?.vehicle_type}</p>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${device.status === 'Online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {device.status === 'Online' ? <Activity size={12} /> : <ShieldAlert size={12} />}
              {device.status || 'Offline'}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorSmartphone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300 font-mono">{device.adsd_id || 'No Device Assigned'}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-4 px-1">Last 7 Days</h3>
      <SimpleBarChart 
        title="Income History"
        data={history}
        dataKey="income"
        maxValue={maxIncome}
        formatValue={v => `₹${v.toFixed(0)}`}
        color="bg-green-500"
      />
      <SimpleBarChart 
        title="Distance (km)"
        data={history}
        dataKey="distance_km"
        maxValue={maxDist}
        formatValue={v => `${v.toFixed(1)}`}
        color="bg-blue-500"
      />
      <SimpleBarChart 
        title="Active Hours"
        data={history}
        dataKey="active_minutes"
        maxValue={maxMins}
        formatValue={v => `${(v/60).toFixed(1)}h`}
        color="bg-purple-500"
      />
    </div>
  )
}
