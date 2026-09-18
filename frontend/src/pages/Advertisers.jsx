import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Plus, Edit, Trash2, Search, X, Eye, Building2, Wallet,
  ChevronUp, ChevronDown, PlayCircle, Calendar, Image as ImageIcon
} from 'lucide-react'

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
    status === 'Active' ? 'bg-green-100 text-green-800' :
    status === 'Inactive' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  }`}>{status}</span>
)

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

const AdvertiserDetailsModal = ({ advertiserId, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    axios.get(`/api/advertisers/${advertiserId}/details`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [advertiserId])

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
      </div>
    </div>
  )

  const { advertiser, ads = [], campaigns = [], media = [] } = data || {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{advertiser?.company_name}</h2>
            <p className="text-xs text-gray-500">{advertiser?.business_type} · {advertiser?.city || '–'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="flex border-b border-gray-100 px-6">
          {[
            ['info', 'Details'],
            ['ads', `Advertisements (${ads.length})`],
            ['campaigns', `Campaigns (${campaigns.length})`],
            ['media', `Media (${media.length})`],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'info' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                ['Company Name', advertiser?.company_name],
                ['Owner Name', advertiser?.owner_name],
                ['Email', advertiser?.email],
                ['Phone', advertiser?.phone || '–'],
                ['GST', advertiser?.gst || '–'],
                ['Business Type', advertiser?.business_type || '–'],
                ['City', advertiser?.city || '–'],
                ['State', advertiser?.state || '–'],
                ['Address', advertiser?.address || '–'],
                ['Latitude', advertiser?.latitude != null ? parseFloat(advertiser.latitude).toFixed(6) : '–'],
                ['Longitude', advertiser?.longitude != null ? parseFloat(advertiser.longitude).toFixed(6) : '–'],
                ['Wallet Balance', advertiser?.wallet_balance != null ? `₹${parseFloat(advertiser.wallet_balance).toFixed(2)}` : '–'],
                ['Status', advertiser?.status],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
                  <span className="font-medium text-gray-900 mt-0.5">{val}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'ads' && (
            ads.length === 0
              ? <div className="text-center py-12 text-gray-400 text-sm">No advertisements yet</div>
              : <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Title', 'Type', 'Category', 'Duration', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ads.map(ad => (
                      <tr key={ad.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{ad.title}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${ad.ad_type === 'CAMPAIGN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {ad.ad_type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{ad.category || '–'}</td>
                        <td className="px-3 py-2 text-gray-600">{ad.play_duration}s</td>
                        <td className="px-3 py-2"><StatusBadge status={ad.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {tab === 'campaigns' && (
            campaigns.length === 0
              ? <div className="text-center py-12 text-gray-400 text-sm">No campaigns yet</div>
              : <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Campaign', 'Area', 'Dates', 'Ads', 'Priority', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{c.campaign_name}</td>
                        <td className="px-3 py-2 text-gray-600">{c.area || '–'}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {new Date(c.start_date).toLocaleDateString()} – {new Date(c.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{c.ad_count}</td>
                        <td className="px-3 py-2 text-gray-600">{c.priority}</td>
                        <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {tab === 'media' && (
            media.length === 0
              ? <div className="text-center py-12 text-gray-400 text-sm">No media uploaded</div>
              : <div className="grid grid-cols-3 gap-4">
                  {media.map(m => (
                    <div key={m.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        {m.media_type === 'image'
                          ? <img src={`http://localhost:5000${m.file_url}`} alt={m.title} className="w-full h-full object-cover" />
                          : <div className="flex flex-col items-center text-gray-400"><PlayCircle size={32} /><span className="text-xs mt-1">Video</span></div>
                        }
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 truncate">{m.title}</p>
                        <p className="text-xs text-gray-500">{m.media_type} · {m.duration ? `${m.duration}s` : '–'}</p>
                      </div>
                    </div>
                  ))}
                </div>
          )}
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  company_name: '', owner_name: '', email: '', phone: '', gst: '',
  address: '', area: '', city: '', state: '', business_type: 'General'
}

export default function Advertisers() {
  const [advertisers, setAdvertisers]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [showModal, setShowModal]         = useState(false)
  const [editingAdvertiser, setEditing]   = useState(null)
  const [viewId, setViewId]               = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData, setFormData]           = useState(emptyForm)
  const [searchTerm, setSearchTerm]       = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [sortField, setSortField]         = useState('company_name')
  const [sortDir, setSortDir]             = useState('asc')
  const [geoError, setGeoError]           = useState('')
  const [geoConfirmPending, setGeoPending] = useState(null)
  const [fundsModal, setFundsModal]   = useState({ open: false, advertiser: null, amount: '' })

  const fetchAdvertisers = useCallback(async () => {
    try {
      const res = await axios.get('/api/advertisers')
      setAdvertisers(res.data.advertisers)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAdvertisers() }, [fetchAdvertisers])

  // Core save — called with the payload; skip_geocoding=true bypasses geocoding
  const saveAdvertiser = async (payload) => {
    setGeoError('')
    try {
      if (editingAdvertiser) await axios.put(`/api/advertisers/${editingAdvertiser.id}`, payload)
      else await axios.post('/api/advertisers', payload)
      fetchAdvertisers()
      setShowModal(false)
      setEditing(null)
      setFormData(emptyForm)
      setGeoPending(null)
    } catch (err) {
      const data = err.response?.data
      if (data?.geocoding_failed) {
        // Surface the specific geocoding error and keep the modal open
        setGeoError(data.message)
        // Stash the payload so the admin can re-submit with skip_geocoding
        setGeoPending(payload)
      } else {
        alert(data?.message || 'Error saving advertiser')
      }
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setGeoError('')
    setGeoPending(null)
    const payload = { ...formData }
    await saveAdvertiser(payload)
  }

  const handleSaveWithoutCoords = async () => {
    if (!geoConfirmPending) return
    await saveAdvertiser({ ...geoConfirmPending, skip_geocoding: true })
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/advertisers/${id}`)
      fetchAdvertisers()
    } catch { alert('Error deleting advertiser') }
    finally { setConfirmDelete(null) }
  }

  const handleAddFunds = async e => {
    e.preventDefault()
    try {
      await axios.post(`/api/advertisers/${fundsModal.advertiser.id}/add-funds`, {
        amount: parseFloat(fundsModal.amount)
      })
      fetchAdvertisers()
      setFundsModal({ open: false, advertiser: null, amount: '' })
      alert('Funds added successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding funds')
    }
  }

  const handleApprove = async id => {
    try {
      await axios.put(`/api/advertisers/${id}/approve`)
      fetchAdvertisers()
    } catch { alert('Error approving advertiser') }
  }

  const handleReject = async id => {
    try {
      await axios.put(`/api/advertisers/${id}/reject`)
      fetchAdvertisers()
    } catch { alert('Error rejecting advertiser') }
  }

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => sortField !== field ? null :
    sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />

  const filtered = advertisers
    .filter(a => {
      if (filterStatus && a.status !== filterStatus) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        return a.company_name?.toLowerCase().includes(q) ||
               a.owner_name?.toLowerCase().includes(q) ||
               a.email?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      const av = (a[sortField] || '').toString().toLowerCase()
      const bv = (b[sortField] || '').toString().toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const thC = field => ({
    onClick: () => handleSort(field),
    className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap'
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Advertisers</h1>
        <button onClick={() => { setEditing(null); setFormData(emptyForm); setGeoError(''); setGeoPending(null); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Advertiser
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search company, owner, email..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-36 text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
        {(filterStatus || searchTerm) && (
          <button onClick={() => { setFilterStatus(''); setSearchTerm('') }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {advertisers.length}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th {...thC('company_name')}><span className="flex items-center gap-1">Company <SortIcon field="company_name" /></span></th>
                <th {...thC('owner_name')}><span className="flex items-center gap-1">Owner <SortIcon field="owner_name" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Business Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Coordinates</th>
                <th {...thC('wallet_balance')}><span className="flex items-center gap-1">Wallet <SortIcon field="wallet_balance" /></span></th>
                <th {...thC('status')}><span className="flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                ))}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-14 text-center text-gray-400">
                  <Building2 size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{searchTerm || filterStatus ? 'No advertisers match your filters' : 'No advertisers yet'}</p>
                </td></tr>
              ) : filtered.map(adv => (
                <tr key={adv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-sm">{adv.company_name}</div>
                    <div className="text-xs text-gray-500">{adv.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{adv.owner_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{adv.business_type || '–'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {[adv.city, adv.state].filter(Boolean).join(', ') || '–'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500">
                    {adv.latitude != null && adv.longitude != null
                      ? `${parseFloat(adv.latitude).toFixed(4)}, ${parseFloat(adv.longitude).toFixed(4)}`
                      : '–'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-700">
                    ₹{parseFloat(adv.wallet_balance || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={adv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {adv.status === 'Inactive' && (
                        <>
                          <button onClick={() => handleApprove(adv.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-bold" title="Approve">
                            Approve
                          </button>
                          <button onClick={() => handleReject(adv.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold" title="Reject">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setViewId(adv.id)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setFundsModal({ open: true, advertiser: adv, amount: '' })}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Add Funds">
                        <Wallet size={16} />
                      </button>
                      <button onClick={() => { setEditing(adv); setFormData({ ...adv, area: adv.area || '' }); setGeoError(''); setGeoPending(null); setShowModal(true) }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete(adv)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingAdvertiser ? 'Edit Advertiser' : 'Add New Advertiser'}</h2>
              <button onClick={() => { setShowModal(false); setGeoError(''); setGeoPending(null) }}
                className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            {/* Geocoding failure banner */}
            {geoError && (
              <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800 mb-1">Location not found</p>
                <p className="text-sm text-yellow-700 mb-3">{geoError}</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleSaveWithoutCoords}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Save without coordinates
                  </button>
                  <button type="button" onClick={() => { setGeoError(''); setGeoPending(null) }}
                    className="px-3 py-1.5 bg-white border border-yellow-300 text-yellow-800 text-xs font-medium rounded-lg hover:bg-yellow-50 transition-colors">
                    Fix the area and retry
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input type="text" value={formData.owner_name}
                    onChange={e => setFormData({ ...formData, owner_name: e.target.value })} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                  <input type="text" value={formData.gst || ''}
                    onChange={e => setFormData({ ...formData, gst: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <select value={formData.business_type || 'General'}
                    onChange={e => setFormData({ ...formData, business_type: e.target.value })} className="input">
                    {['General','Cafe','Restaurant','Retail','Gym','Hospital','Real Estate','Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })} className="input" rows={2} />
              </div>
              {/* Location section — area drives geocoding */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area / Locality
                    <span className="ml-2 text-xs font-normal text-gray-400">e.g. Bapunagar, Nikol, Satellite</span>
                  </label>
                  <input
                    type="text"
                    value={formData.area || ''}
                    onChange={e => { setFormData({ ...formData, area: e.target.value }); setGeoError(''); setGeoPending(null) }}
                    className="input bg-white"
                    placeholder="Enter locality or neighbourhood"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={formData.city || ''}
                      onChange={e => { setFormData({ ...formData, city: e.target.value }); setGeoError(''); setGeoPending(null) }}
                      className="input bg-white" placeholder="e.g. Ahmedabad" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={formData.state || ''}
                      onChange={e => { setFormData({ ...formData, state: e.target.value }); setGeoError(''); setGeoPending(null) }}
                      className="input bg-white" placeholder="e.g. Gujarat" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  Coordinates are resolved automatically from Area + City + State using OpenStreetMap.
                </p>
              </div>
              {editingAdvertiser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status || 'Active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })} className="input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAdvertiser ? 'Update' : 'Add'} Advertiser</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Funds</h2>
              <button onClick={() => setFundsModal({ open: false, advertiser: null, amount: '' })} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Adding funds to <strong>{fundsModal.advertiser?.company_name}</strong>. Current Balance: ₹{parseFloat(fundsModal.advertiser?.wallet_balance || 0).toFixed(2)}
            </p>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input type="number" min="1" step="0.01" value={fundsModal.amount}
                  onChange={e => setFundsModal({ ...fundsModal, amount: e.target.value })}
                  className="input" required placeholder="Enter amount to add" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFundsModal({ open: false, advertiser: null, amount: '' })} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary bg-green-600 hover:bg-green-700">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewId && <AdvertiserDetailsModal advertiserId={viewId} onClose={() => setViewId(null)} />}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.company_name}"? All associated data may be affected.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
