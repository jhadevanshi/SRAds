import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Plus, Edit, Trash2, Search, Activity, Clock, Eye, RefreshCw,
  MapPin, Wifi, WifiOff, Battery, ChevronUp, ChevronDown, X,
  Filter, Radio
} from 'lucide-react'

const REFRESH_INTERVAL = 5000

const StatusBadge = ({ status }) => {
  const map = {
    Online: 'bg-green-100 text-green-800',
    Offline: 'bg-red-100 text-red-800',
    Disabled: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status === 'Online' ? <Activity size={10} /> : <Clock size={10} />}
      {status}
    </span>
  )
}

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm Delete</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn btn-secondary text-sm">Cancel</button>
        <button onClick={onConfirm} className="btn btn-danger text-sm">Delete</button>
      </div>
    </div>
  </div>
)

const SkeletonRow = () => (
  <tr>{Array.from({ length: 9 }).map((_, i) => (
    <td key={i} className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    </td>
  ))}</tr>
)

const DeviceDetailsModal = ({ deviceId, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    axios.get(`/api/devices/${deviceId}/details`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [deviceId])

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
      </div>
    </div>
  )

  const { device, playback_history = [], location_history = [] } = data || {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{device?.device_name}</h2>
            <p className="text-xs text-gray-500">{device?.adsd_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="flex border-b border-gray-100 px-6">
          {[['info', 'Registration'], ['playback', 'Playback History'], ['location', 'Location History']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'info' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ['ADSD ID', device?.adsd_id],
                ['Serial Number', device?.serial_number || '–'],
                ['Device Name', device?.device_name],
                ['Vehicle Type', device?.vehicle_type],
                ['Vehicle Number', device?.vehicle_number || '–'],
                ['Installation Date', device?.installation_date ? new Date(device.installation_date).toLocaleDateString() : '–'],
                ['Status', device?.status],
                ['GPS Status', device?.gps_status || '–'],
                ['Internet Status', device?.internet_status || '–'],
                ['Battery Level', device?.battery_level != null ? `${device.battery_level}%` : '–'],
                ['Latitude', device?.latitude != null ? parseFloat(device.latitude).toFixed(6) : '–'],
                ['Longitude', device?.longitude != null ? parseFloat(device.longitude).toFixed(6) : '–'],
                ['Last Seen', device?.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'],
                ['Heartbeat', device?.heartbeat_at ? new Date(device.heartbeat_at).toLocaleString() : '–'],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
                  <span className="font-medium text-gray-900 mt-0.5">{val}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'playback' && (
            playback_history.length === 0
              ? <div className="text-center py-12 text-gray-400 text-sm">No playback history</div>
              : <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Time', 'Advertisement', 'Campaign', 'Area', 'Duration'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {playback_history.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{new Date(r.played_at).toLocaleString()}</td>
                        <td className="px-3 py-2 font-medium text-gray-900 truncate max-w-[150px]">{r.ad_title || '–'}</td>
                        <td className="px-3 py-2 text-purple-700 text-xs">{r.campaign_name || '–'}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{r.area || '–'}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{r.duration}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {tab === 'location' && (
            location_history.length === 0
              ? <div className="text-center py-12 text-gray-400 text-sm">No location history</div>
              : <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Time', 'Latitude', 'Longitude', 'Speed'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {location_history.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{new Date(r.recorded_at).toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-xs">{parseFloat(r.latitude).toFixed(6)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{parseFloat(r.longitude).toFixed(6)}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{r.speed != null ? `${r.speed} km/h` : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  adsd_id: '', serial_number: '', device_name: '', vehicle_type: 'Auto',
  vehicle_number: '', installation_date: ''
}

export default function Devices() {
  const [devices, setDevices]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [viewDeviceId, setViewDeviceId]   = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData, setFormData]       = useState(emptyForm)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [sortField, setSortField]     = useState('device_name')
  const [sortDir, setSortDir]         = useState('asc')
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchDevices = useCallback(async () => {
    try {
      const res = await axios.get('/api/devices')
      setDevices(res.data.devices)
      setLastRefresh(new Date())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchDevices()
    const t = setInterval(fetchDevices, REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [fetchDevices])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      if (editingDevice) await axios.put(`/api/devices/${editingDevice.id}`, payload)
      else await axios.post('/api/devices', payload)
      fetchDevices()
      setShowModal(false)
      setEditingDevice(null)
      setFormData(emptyForm)
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error saving device')
    }
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/devices/${id}`)
      fetchDevices()
    } catch { alert('Error deleting device') }
    finally { setConfirmDelete(null) }
  }

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => sortField !== field ? null :
    sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />

  const filtered = devices
    .filter(d => {
      if (filterStatus && d.status !== filterStatus) return false
      if (filterVehicle && d.vehicle_type !== filterVehicle) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        return d.adsd_id?.toLowerCase().includes(q) ||
               d.device_name?.toLowerCase().includes(q) ||
               d.vehicle_number?.toLowerCase().includes(q) ||
               d.driver_name?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      const av = (a[sortField] || '').toString().toLowerCase()
      const bv = (b[sortField] || '').toString().toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const thProps = field => ({
    onClick: () => handleSort(field),
    className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap'
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Radio size={11} className="text-green-500 animate-pulse" />
              Live · Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={() => { setEditingDevice(null); setFormData(emptyForm); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Device
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by ID, name, driver..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-36 text-sm">
          <option value="">All Status</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Disabled">Disabled</option>
        </select>
        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} className="input w-36 text-sm">
          <option value="">All Vehicles</option>
          <option value="Auto">Auto</option>
          <option value="BRTS">BRTS</option>
        </select>
        {(filterStatus || filterVehicle || searchTerm) && (
          <button onClick={() => { setFilterStatus(''); setFilterVehicle(''); setSearchTerm('') }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {devices.length}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th {...thProps('device_name')}><span className="flex items-center gap-1">Device / ID <SortIcon field="device_name" /></span></th>
                <th {...thProps('driver_name')}><span className="flex items-center gap-1">Driver <SortIcon field="driver_name" /></span></th>
                <th {...thProps('vehicle_number')}><span className="flex items-center gap-1">Vehicle <SortIcon field="vehicle_number" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Today's Distance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Today's Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Today's Income</th>
                <th {...thProps('status')}><span className="flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Last Seen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
               filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-14 text-center text-gray-400">
                  <Filter size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{searchTerm || filterStatus || filterVehicle ? 'No devices match your filters' : 'No devices registered yet'}</p>
                </td></tr>
               ) : filtered.map(dev => (
                <tr key={dev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-sm">{dev.device_name}</div>
                    <div className="text-xs font-mono text-gray-500">{dev.adsd_id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{dev.driver_name || <span className="text-gray-400 italic font-normal">Unassigned</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <span className="font-medium">{dev.vehicle_number || '–'}</span>
                    <div className="text-xs text-gray-500">{dev.vehicle_type}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{parseFloat(dev.today_distance || 0).toFixed(2)} km</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{parseFloat((dev.today_active_minutes || 0) / 60).toFixed(1)} hr</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-700">₹{parseFloat(dev.today_income || 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={dev.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {dev.last_seen ? new Date(dev.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewDeviceId(dev.id)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => { setEditingDevice(dev); setFormData(dev); setShowModal(true) }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete(dev)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingDevice ? 'Edit Device' : 'Add New Device'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AdsD ID *</label>
                  <input type="text" value={formData.adsd_id}
                    onChange={e => setFormData({ ...formData, adsd_id: e.target.value })}
                    className="input" required disabled={!!editingDevice} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input type="text" value={formData.serial_number || ''}
                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
                <input type="text" value={formData.device_name}
                  onChange={e => setFormData({ ...formData, device_name: e.target.value })} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select value={formData.vehicle_type}
                    onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })} className="input" required>
                    {['Auto', 'BRTS'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input type="text" value={formData.vehicle_number || ''}
                    onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
                  <input type="date" value={formData.installation_date ? formData.installation_date.split('T')[0] : ''}
                    onChange={e => setFormData({ ...formData, installation_date: e.target.value })} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDevice ? 'Update' : 'Add'} Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewDeviceId && <DeviceDetailsModal deviceId={viewDeviceId} onClose={() => setViewDeviceId(null)} />}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.device_name}" (${confirmDelete.adsd_id})? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
