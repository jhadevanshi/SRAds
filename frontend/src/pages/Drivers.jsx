import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Plus, Edit, Trash2, Search, Settings, CarFront, CheckCircle, XCircle, X, ShieldAlert
} from 'lucide-react'

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {status === 'Active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
    {status}
  </span>
)

const emptyForm = {
  name: '', phone: '', password: '', vehicle_type: 'Auto', vehicle_number: '', device_id: '', status: 'Active'
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [devices, setDevices] = useState([])
  const [rates, setRates] = useState({ rate_per_km: 0, rate_per_hour: 0 })
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  
  const [formData, setFormData] = useState(emptyForm)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [drRes, devRes, ratesRes] = await Promise.all([
        axios.get('/api/admin/drivers'),
        axios.get('/api/devices'),
        axios.get('/api/admin/drivers/settings/rates')
      ])
      setDrivers(drRes.data.drivers)
      setDevices(devRes.data.devices)
      setRates(ratesRes.data.rates)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = { ...formData, device_id: formData.device_id ? parseInt(formData.device_id) : null }
      if (editingDriver) {
        await axios.put(`/api/admin/drivers/${editingDriver.id}`, payload)
      } else {
        if (!payload.password || payload.password.length < 6) {
          return alert('Password must be at least 6 characters')
        }
        await axios.post('/api/admin/drivers', payload)
      }
      fetchData()
      setShowModal(false)
      setEditingDriver(null)
      setFormData(emptyForm)
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error saving driver')
    }
  }

  const handleSettingsSubmit = async e => {
    e.preventDefault()
    try {
      await axios.put('/api/admin/drivers/settings/rates', rates)
      setShowSettings(false)
      fetchData()
    } catch (err) {
      alert('Error updating rates')
    }
  }

  const filtered = drivers.filter(d => 
    !searchTerm || 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm) ||
    d.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableDevices = devices.filter(d => 
    !d.driver_name || (editingDriver && editingDriver.device_id === d.id)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500">Manage drivers and their assigned vehicles</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(true)} className="btn btn-secondary flex items-center gap-2">
            <Settings size={18} /> Earning Rates
          </button>
          <button onClick={() => { setEditingDriver(null); setFormData(emptyForm); setShowModal(true) }} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Driver
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, phone, vehicle..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading drivers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400">
                  <CarFront size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No drivers found</p>
                </td></tr>
              ) : filtered.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{driver.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{driver.phone}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{driver.vehicle_number}</div>
                    <div className="text-xs text-gray-500">{driver.vehicle_type}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary-700 font-medium">
                    {driver.device_name ? `${driver.device_name} (${driver.adsd_id})` : <span className="text-gray-400 font-normal italic">None</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(driver.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditingDriver(driver); setFormData({ ...driver, password: '' }); setShowModal(true) }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input" required />
                </div>
              </div>
              
              {!editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input" required minLength={6} placeholder="For driver login app" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select value={formData.vehicle_type} onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })} className="input" required>
                    <option value="Auto">Auto</option>
                    <option value="BRTS">BRTS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                  <input type="text" value={formData.vehicle_number} onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })} className="input" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Device</label>
                <select value={formData.device_id || ''} onChange={e => setFormData({ ...formData, device_id: e.target.value })} className="input">
                  <option value="">-- No Device --</option>
                  {availableDevices.map(d => <option key={d.id} value={d.id}>{d.device_name} ({d.adsd_id})</option>)}
                </select>
              </div>

              {editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDriver ? 'Update' : 'Create'} Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings size={20} /> Earning Rates</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 flex gap-2">
              <ShieldAlert size={20} className="shrink-0 text-blue-600" />
              <p>These rates apply globally to all drivers instantly for future earnings.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Kilometre (₹)</label>
                <input type="number" step="0.01" min="0" value={rates.rate_per_km} onChange={e => setRates({ ...rates, rate_per_km: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Active Hour (₹)</label>
                <input type="number" step="0.01" min="0" value={rates.rate_per_hour} onChange={e => setRates({ ...rates, rate_per_hour: e.target.value })} className="input" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSettings(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Rates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
