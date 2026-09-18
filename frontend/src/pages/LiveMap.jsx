import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Search,
  RefreshCw,
  Radio,
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  Activity,
  Clock,
  Filter
} from 'lucide-react'

// Fix leaflet default marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })

const icons = {
  Online:   makeIcon('#22c55e'),
  Offline:  makeIcon('#ef4444'),
  Disabled: makeIcon('#9ca3af'),
}

const REFRESH_INTERVAL = 5000

function MapBoundsUpdater({ devices }) {
  const map = useMap()
  const hasSet = useRef(false)
  useEffect(() => {
    const valid = devices.filter(d => d.latitude && d.longitude)
    if (!hasSet.current && valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(d => [parseFloat(d.latitude), parseFloat(d.longitude)]))
      map.fitBounds(bounds.pad(0.2))
      hasSet.current = true
    }
  }, [devices, map])
  return null
}

export default function LiveMap() {
  const [devices, setDevices]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [refreshing, setRefreshing]   = useState(false)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)

  const fetchDevices = useCallback(async (showBusy = false) => {
    if (showBusy) setRefreshing(true)
    try {
      const res = await axios.get('/api/dashboard/live-devices')
      setDevices(res.data.devices)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Live map fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDevices()
    const t = setInterval(() => fetchDevices(), REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [fetchDevices])

  const vehicleTypes = [...new Set(devices.map(d => d.vehicle_type).filter(Boolean))]

  const filtered = devices.filter(d => {
    if (filterStatus && d.status !== filterStatus) return false
    if (filterVehicle && d.vehicle_type !== filterVehicle) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        d.device_name?.toLowerCase().includes(q) ||
        d.adsd_id?.toLowerCase().includes(q) ||
        d.vehicle_number?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const onlineCount  = devices.filter(d => d.status === 'Online').length
  const offlineCount = devices.filter(d => d.status === 'Offline').length

  // Default center: India
  const defaultCenter = [20.5937, 78.9629]

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time device locations — auto-refreshes every 5 seconds</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Radio size={12} className="text-green-500 animate-pulse" />
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchDevices(true)}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Online: <strong>{onlineCount}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Offline: <strong>{offlineCount}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          Total: <strong>{devices.length}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="card py-3 px-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search device / vehicle..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-9 py-1.5 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input w-36 py-1.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Disabled">Disabled</option>
          </select>
          <select
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            className="input w-36 py-1.5 text-sm"
          >
            <option value="">All Vehicles</option>
            {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {(filterStatus || filterVehicle || searchTerm) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterVehicle(''); setSearchTerm('') }}
              className="text-xs text-primary-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4" style={{ height: '560px' }}>
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-md border border-gray-200">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={5}
              style={{ width: '100%', height: '100%' }}
              zoomControl
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBoundsUpdater devices={filtered} />
              {filtered.map(dev =>
                dev.latitude && dev.longitude ? (
                  <Marker
                    key={dev.id}
                    position={[parseFloat(dev.latitude), parseFloat(dev.longitude)]}
                    icon={icons[dev.status] ?? icons.Offline}
                    eventHandlers={{ click: () => setSelectedDevice(dev) }}
                  >
                    <Popup maxWidth={260}>
                      <div className="text-sm space-y-1.5 py-1">
                        <div className="font-semibold text-gray-900 text-base">{dev.device_name}</div>
                        <div className="text-gray-500 text-xs">{dev.adsd_id}</div>
                        <hr className="my-1" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-gray-500">Vehicle</span>
                          <span className="font-medium">{dev.vehicle_type} · {dev.vehicle_number || '–'}</span>
                          <span className="text-gray-500">Status</span>
                          <span className={`font-medium ${dev.status === 'Online' ? 'text-green-600' : 'text-red-500'}`}>{dev.status}</span>
                          <span className="text-gray-500">GPS</span>
                          <span>{dev.gps_status ?? '–'}</span>
                          <span className="text-gray-500">Internet</span>
                          <span>{dev.internet_status ?? '–'}</span>
                          <span className="text-gray-500">Battery</span>
                          <span>{dev.battery_level != null ? `${dev.battery_level}%` : '–'}</span>
                          <span className="text-gray-500">Lat / Lng</span>
                          <span className="font-mono">{parseFloat(dev.latitude).toFixed(5)}, {parseFloat(dev.longitude).toFixed(5)}</span>
                          {dev.current_ad && <>
                            <span className="text-gray-500">Current Ad</span>
                            <span className="font-medium text-primary-700 truncate">{dev.current_ad}</span>
                          </>}
                          {dev.current_campaign && <>
                            <span className="text-gray-500">Campaign</span>
                            <span className="text-purple-700 truncate">{dev.current_campaign}</span>
                          </>}
                          <span className="text-gray-500">Heartbeat</span>
                          <span>{dev.heartbeat_at ? new Date(dev.heartbeat_at).toLocaleTimeString() : '–'}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          )}
        </div>

        {/* Sidebar device list and Preview */}
        <div className="w-80 flex flex-col gap-4">
          <div className="card p-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Devices</span>
              <span className="text-xs text-gray-400">{filtered.length} shown</span>
            </div>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No devices match filters</div>
              ) : (
                filtered.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedDevice?.id === dev.id
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 truncate pr-2">{dev.device_name}</span>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dev.status === 'Online' ? 'bg-green-500' : dev.status === 'Disabled' ? 'bg-gray-400' : 'bg-red-500'}`} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{dev.vehicle_type} · {dev.vehicle_number || '–'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {dev.battery_level != null && (
                        <span className={`text-xs flex items-center gap-0.5 ${dev.battery_level > 60 ? 'text-green-600' : dev.battery_level > 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                          <Battery size={10} />{dev.battery_level}%
                        </span>
                      )}
                      {dev.internet_status === 'Connected'
                        ? <Wifi size={10} className="text-teal-500" />
                        : <WifiOff size={10} className="text-gray-300" />
                      }
                      {dev.latitude && dev.longitude && (
                        <MapPin size={10} className="text-blue-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Live Device Preview */}
          <div className="card p-3 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Live Device Preview</span>
            {selectedDevice ? (
              <div className="w-full aspect-video bg-gray-900 rounded overflow-hidden relative shadow-inner">
                {selectedDevice.status === 'Offline' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <WifiOff size={24} className="mb-2 opacity-50" />
                    <span className="text-xs">Device Offline</span>
                  </div>
                ) : selectedDevice.current_media_url ? (
                  selectedDevice.current_media_type === 'video' ? (
                    <video 
                      src={`http://localhost:5000${selectedDevice.current_media_url}`} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted 
                    />
                  ) : (
                    <img 
                      src={`http://localhost:5000${selectedDevice.current_media_url}`} 
                      className="w-full h-full object-cover" 
                      alt="Ad Preview" 
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <span className="text-xs">Idle / Waiting for Ad</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-200">
                <span className="text-xs text-gray-400">Select a device</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Online device</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Offline device</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />Disabled device</div>
        <div className="flex items-center gap-1.5 text-gray-400 italic">Devices without GPS coordinates are not shown on map</div>
      </div>
    </div>
  )
}
