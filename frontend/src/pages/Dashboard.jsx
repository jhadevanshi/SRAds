import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Monitor,
  Users,
  Calendar,
  PlayCircle,
  TrendingUp,
  Activity,
  Clock,
  Eye,
  Image,
  Wifi,
  WifiOff,
  Battery,
  MapPin,
  RefreshCw,
  Radio
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const REFRESH_INTERVAL = 15000

const StatusBadge = ({ status }) => {
  const map = {
    Online:  'bg-green-100 text-green-800',
    Offline: 'bg-red-100 text-red-800',
    Disabled:'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status === 'Online' ? <Activity size={10} /> : <Clock size={10} />}
      {status}
    </span>
  )
}

const GpsIcon = ({ status }) => {
  const active = status === 'Active'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
      <MapPin size={10} />
      {status ?? 'Unknown'}
    </span>
  )
}

const NetIcon = ({ status }) => {
  const connected = status === 'Connected'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${connected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
      {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
      {connected ? 'On' : 'Off'}
    </span>
  )
}

const BatteryCell = ({ level }) => {
  if (level == null) return <span className="text-gray-400 text-xs">–</span>
  const color = level > 60 ? 'text-green-600' : level > 20 ? 'text-yellow-500' : 'text-red-500'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Battery size={12} />
      {level}%
    </span>
  )
}

const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 9 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </td>
    ))}
  </tr>
)

const StatCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats]             = useState(null)
  const [liveDevices, setLiveDevices] = useState([])
  const [adsByType, setAdsByType]     = useState([])
  const [todayPlayback, setTodayPlayback] = useState([])
  const [recentPlayback, setRecentPlayback] = useState([])
  const [loading, setLoading]         = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [refreshing, setRefreshing]   = useState(false)

  const fetchAll = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const [statsRes, devicesRes, typeRes, todayRes, recentRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/live-devices'),
        axios.get('/api/dashboard/ads-by-type'),
        axios.get('/api/dashboard/today-playback'),
        axios.get('/api/dashboard/recent-playback'),
      ])
      setStats(statsRes.data.stats)
      setLiveDevices(devicesRes.data.devices)
      setAdsByType(typeRes.data.data)
      setTodayPlayback(todayRes.data.data)
      setRecentPlayback(recentRes.data.playback_logs)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const timer = setInterval(() => fetchAll(), REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchAll])

  const statCards = [
    { title: 'Total Advertisers',  value: stats?.registered_advertisers ?? 0, icon: Users,       color: 'bg-orange-500' },
    { title: 'Total Devices',      value: stats?.total_devices ?? 0,          icon: Monitor,     color: 'bg-blue-500' },
    { title: 'Online Devices',     value: stats?.online_devices ?? 0,         icon: Activity,    color: 'bg-green-500' },
    { title: 'Offline Devices',    value: stats?.offline_devices ?? 0,        icon: Clock,       color: 'bg-red-500' },
    { title: 'Active Ads',         value: stats?.total_ads ?? 0,              icon: PlayCircle,  color: 'bg-pink-500' },
    { title: 'Active Campaigns',   value: stats?.active_campaigns ?? 0,       icon: Calendar,    color: 'bg-purple-500' },
    { title: 'Total Media',        value: stats?.total_media ?? 0,            icon: Image,       color: 'bg-indigo-500' },
    { title: 'Played Today',       value: stats?.today_impressions ?? 0,      icon: Eye,         color: 'bg-cyan-500' },
  ]

  // Format today playback for chart
  const playbackChartData = todayPlayback.map(r => ({
    hour: new Date(r.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    plays: parseInt(r.count)
  }))

  // Format device status for pie
  const devicePieData = [
    { name: 'Online',  value: stats?.online_devices ?? 0,  color: '#22c55e' },
    { name: 'Offline', value: stats?.offline_devices ?? 0, color: '#ef4444' },
  ]

  // Format ads by type for pie
  const adTypePie = adsByType.map(r => ({
    name: r.ad_type === 'CAMPAIGN' ? 'Campaign Ads' : 'General Ads',
    value: parseInt(r.count),
    color: r.ad_type === 'CAMPAIGN' ? '#8b5cf6' : '#0ea5e9'
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live advertisement platform overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Radio size={12} className="text-green-500 animate-pulse" />
              Auto-refresh every 15s · Last: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.title} className="card py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 leading-tight">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color} shrink-0`}>
                      <Icon className="text-white" size={22} />
                    </div>
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Playback */}
        <div className="card lg:col-span-1">
          <h3 className="text-base font-semibold mb-4 text-gray-800">Advertisements Played Today</h3>
          {playbackChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <PlayCircle size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No playbacks recorded today</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={playbackChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="plays" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Online vs Offline */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 text-gray-800">Online vs Offline Devices</h3>
          {(!stats || stats.total_devices === 0) ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Monitor size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No devices registered</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {devicePieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Campaign vs General Ads */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 text-gray-800">Campaign Ads vs General Ads</h3>
          {adTypePie.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <TrendingUp size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No active advertisements</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={adTypePie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {adTypePie.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Live Devices Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Radio size={16} className="text-green-500 animate-pulse" />
            Live Devices
          </h3>
          <span className="text-xs text-gray-400">{liveDevices.length} devices</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Device', 'Vehicle', 'Area', 'GPS', 'Internet', 'Battery', 'Current Ad', 'Heartbeat', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : liveDevices.length === 0
                  ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                        <Monitor size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No devices registered yet</p>
                      </td>
                    </tr>
                  )
                  : liveDevices.map(dev => (
                    <tr key={dev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">{dev.device_name}</div>
                        <div className="text-xs text-gray-400">{dev.adsd_id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{dev.vehicle_type}</div>
                        <div className="text-xs text-gray-400">{dev.vehicle_number || '–'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {dev.latitude && dev.longitude
                          ? <span className="text-xs font-mono">{parseFloat(dev.latitude).toFixed(4)}, {parseFloat(dev.longitude).toFixed(4)}</span>
                          : <span className="text-gray-400 text-xs">No GPS</span>
                        }
                      </td>
                      <td className="px-4 py-3"><GpsIcon status={dev.gps_status} /></td>
                      <td className="px-4 py-3"><NetIcon status={dev.internet_status} /></td>
                      <td className="px-4 py-3"><BatteryCell level={dev.battery_level} /></td>
                      <td className="px-4 py-3 max-w-[150px]">
                        <span className="text-xs text-gray-700 truncate block">{dev.current_ad || <span className="text-gray-400">–</span>}</span>
                        {dev.current_campaign && <span className="text-xs text-purple-600 truncate block">{dev.current_campaign}</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {dev.heartbeat_at ? new Date(dev.heartbeat_at).toLocaleTimeString() : '–'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={dev.status} /></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Playback */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Recent Advertisements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Time', 'Device', 'Vehicle', 'Advertisement', 'Campaign', 'Duration'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : recentPlayback.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <PlayCircle size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No playback records yet</p>
                      </td>
                    </tr>
                  )
                  : recentPlayback.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {new Date(log.played_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{log.device_name || '–'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.vehicle_number || '–'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">{log.ad_title || '–'}</td>
                      <td className="px-4 py-3 text-sm text-purple-700">{log.campaign_name || <span className="text-gray-400 text-xs">General</span>}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{log.duration}s</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
