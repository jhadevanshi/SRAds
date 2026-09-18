import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Plus, Edit, Trash2, Search, X, Play, Pause,
  GripVertical, ChevronUp, ChevronDown, ListMusic,
  PlayCircle, Video, Image, CheckSquare, Square
} from 'lucide-react'

const StatusBadge = ({ status, approval }) => {
  if (approval === 'Pending') return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">Pending Approval</span>;
  if (approval === 'Rejected') return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800">Rejected</span>;
  const map = {
    Active: 'bg-green-100 text-green-800',
    Paused: 'bg-yellow-100 text-yellow-800',
    Stopped: 'bg-red-100 text-red-700',
    Completed: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
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

// Drag-and-drop playlist item
function PlaylistItem({ item, index, total, onMove, onRemove, onDurationChange }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group">
      <span className="text-gray-400 shrink-0 cursor-grab"
        draggable
        onDragStart={e => e.dataTransfer.setData('text/plain', index)}
      >
        <GripVertical size={16} />
      </span>
      <span className="w-5 text-xs text-gray-400 text-center">{index + 1}</span>
      <div className="w-10 h-7 bg-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
        {item.file_url
          ? item.media_type === 'image'
            ? <img src={`http://localhost:5000${item.file_url}`} alt="" className="w-full h-full object-cover" />
            : <Video size={14} className="text-gray-400" />
          : <Image size={14} className="text-gray-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${item.ad_type === 'CAMPAIGN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {item.ad_type}
        </span>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        <input
          type="number"
          min="1"
          value={item.duration}
          onChange={e => onDurationChange(index, parseInt(e.target.value) || 15)}
          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-primary-500 outline-none"
          title="Duration (s)"
        />
        <span className="text-xs text-gray-400">s</span>
      </div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(index, index - 1)} disabled={index === 0}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">
          <ChevronUp size={14} />
        </button>
        <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">
          <ChevronDown size={14} />
        </button>
      </div>
      <button onClick={() => onRemove(index)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
        <X size={15} />
      </button>
    </div>
  )
}

// Playlist editor modal
function PlaylistModal({ campaign, allAds, onSave, onClose }) {
  const [playlist, setPlaylist]       = useState([])
  const [adSearch, setAdSearch]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [dropTarget, setDropTarget]   = useState(null)

  useEffect(() => {
    // Load existing playlist
    axios.get(`/api/campaigns/${campaign.id}`)
      .then(r => {
        const ads = r.data.campaign?.ads || []
        setPlaylist(ads.map(a => ({
          ca_id: a.id,
          ad_id: a.ad_id,
          title: a.title,
          ad_type: a.ad_type || 'GENERAL',
          file_url: a.file_url,
          media_type: a.media_type,
          duration: a.duration || 15,
          play_order: a.play_order,
        })))
      })
      .catch(console.error)
  }, [campaign.id])

  const addAd = ad => {
    if (playlist.some(p => p.ad_id === ad.id)) return // already in playlist
    setPlaylist(prev => [...prev, {
      ad_id: ad.id,
      title: ad.title,
      ad_type: ad.ad_type || 'GENERAL',
      file_url: ad.file_url,
      media_type: ad.media_type,
      duration: ad.play_duration || ad.duration || 15,
    }])
  }

  const removeAd = idx => setPlaylist(prev => prev.filter((_, i) => i !== idx))

  const moveAd = (from, to) => {
    if (to < 0 || to >= playlist.length) return
    setPlaylist(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const changeDuration = (idx, val) => {
    setPlaylist(prev => prev.map((item, i) => i === idx ? { ...item, duration: val } : item))
  }

  // Drag-and-drop between playlist items
  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (!isNaN(fromIndex) && fromIndex !== toIndex) moveAd(fromIndex, toIndex)
    setDropTarget(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`/api/campaigns/${campaign.id}/playlist`, {
        ads: playlist.map((item, idx) => ({
          ad_id: item.ad_id,
          play_order: idx,
          duration: item.duration,
        }))
      })
      onSave()
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving playlist')
    } finally {
      setSaving(false)
    }
  }

  const totalDuration = playlist.reduce((sum, i) => sum + (i.duration || 0), 0)
  const inPlaylistIds = new Set(playlist.map(p => p.ad_id))

  const filteredAds = allAds.filter(a => {
    if (inPlaylistIds.has(a.id)) return false
    if (!adSearch) return true
    const q = adSearch.toLowerCase()
    return a.title?.toLowerCase().includes(q) || a.advertiser_name?.toLowerCase().includes(q)
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ListMusic size={20} className="text-primary-600" />
              Playlist Builder — {campaign.campaign_name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{playlist.length} ads · {totalDuration}s total</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden divide-x divide-gray-100">
          {/* Left: Ad library to pick from */}
          <div className="w-80 flex flex-col p-4 overflow-hidden">
            <p className="text-sm font-semibold text-gray-700 mb-2">Available Advertisements</p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search ads..." value={adSearch}
                onChange={e => setAdSearch(e.target.value)} className="input pl-8 py-1.5 text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filteredAds.length === 0
                ? <p className="text-xs text-gray-400 text-center py-6">
                    {adSearch ? 'No ads match search' : 'All ads are in the playlist'}
                  </p>
                : filteredAds.map(ad => (
                  <button key={ad.id} onClick={() => addAd(ad)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-primary-400 hover:bg-primary-50 text-left transition-colors group">
                    <div className="w-8 h-6 bg-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
                      {ad.file_url
                        ? ad.media_type === 'image'
                          ? <img src={`http://localhost:5000${ad.file_url}`} alt="" className="w-full h-full object-cover" />
                          : <Video size={12} className="text-gray-400" />
                        : <Image size={12} className="text-gray-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{ad.title}</p>
                      <span className={`text-xs px-1 py-0.5 rounded ${ad.ad_type === 'CAMPAIGN' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {ad.ad_type}
                      </span>
                    </div>
                    <Plus size={14} className="text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </button>
                ))
              }
            </div>
          </div>

          {/* Right: Current playlist */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Playlist Order</p>
              {playlist.length > 0 && (
                <span className="text-xs text-gray-500">Drag to reorder · Edit seconds per ad</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                  <ListMusic size={36} className="mb-2 opacity-30" />
                  <p className="text-sm">No ads in playlist yet</p>
                  <p className="text-xs mt-1">Click ads on the left to add them</p>
                </div>
              ) : playlist.map((item, idx) => (
                <div key={`${item.ad_id}-${idx}`}
                  onDragOver={e => { e.preventDefault(); setDropTarget(idx) }}
                  onDrop={e => handleDrop(e, idx)}
                  className={`transition-all ${dropTarget === idx ? 'ring-2 ring-primary-400 rounded-lg' : ''}`}
                >
                  <PlaylistItem
                    item={item}
                    index={idx}
                    total={playlist.length}
                    onMove={moveAd}
                    onRemove={removeAd}
                    onDurationChange={changeDuration}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {playlist.length} advertisement{playlist.length !== 1 ? 's' : ''} · Total: {totalDuration}s ({Math.round(totalDuration / 60)}m)
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  campaign_name: '', advertiser_id: '', start_date: '', end_date: '',
  priority: 1, budget: '', area: '', status: 'Active'
}

export default function Campaigns() {
  const [campaigns, setCampaigns]     = useState([])
  const [advertisers, setAdvertisers] = useState([])
  const [allAds, setAllAds]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editingCampaign, setEditing] = useState(null)
  const [playlistCampaign, setPlaylistCampaign] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData, setFormData]       = useState(emptyForm)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField]     = useState('created_at')
  const [sortDir, setSortDir]         = useState('desc')

  const fetchAll = async () => {
    try {
      const [campRes, advRes, adsRes] = await Promise.all([
        axios.get('/api/campaigns'),
        axios.get('/api/advertisers'),
        axios.get('/api/ads')
      ])
      setCampaigns(campRes.data.campaigns)
      setAdvertisers(advRes.data.advertisers)
      setAllAds(adsRes.data.ads)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = { ...formData, priority: parseInt(formData.priority) || 1 }
      if (editingCampaign) await axios.put(`/api/campaigns/${editingCampaign.id}`, payload)
      else await axios.post('/api/campaigns', payload)
      fetchAll()
      setShowModal(false)
      setEditing(null)
      setFormData(emptyForm)
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving campaign')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/campaigns/${id}`, { status: newStatus })
      fetchAll()
    } catch { alert('Error updating campaign status') }
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/campaigns/${id}`)
      fetchAll()
    } catch { alert('Error deleting campaign') }
    finally { setConfirmDelete(null) }
  }

  const handleApprove = async id => {
    try {
      await axios.put(`/api/campaigns/${id}/approve`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving campaign')
    }
  }

  const handleReject = async id => {
    const reason = window.prompt("Enter reason for rejection:")
    if (!reason) return
    try {
      await axios.put(`/api/campaigns/${id}/reject`, { reason })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting campaign')
    }
  }

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => sortField !== field ? null :
    sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />

  const filtered = campaigns
    .filter(c => {
      if (filterStatus && c.status !== filterStatus) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        return c.campaign_name?.toLowerCase().includes(q) || c.advertiser_name?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      let av = a[sortField] || ''
      let bv = b[sortField] || ''
      if (sortField === 'created_at') {
        return sortDir === 'asc' ? new Date(av) - new Date(bv) : new Date(bv) - new Date(av)
      }
      return sortDir === 'asc' ? av.toString().localeCompare(bv.toString()) : bv.toString().localeCompare(av.toString())
    })

  const thC = field => ({
    onClick: () => handleSort(field),
    className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap'
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">GPS-triggered campaigns · Click "Playlist" to manage ad order</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData(emptyForm); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search campaigns, advertisers..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-36 text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Stopped">Stopped</option>
          <option value="Completed">Completed</option>
        </select>
        {(filterStatus || searchTerm) && (
          <button onClick={() => { setFilterStatus(''); setSearchTerm('') }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {campaigns.length}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th {...thC('campaign_name')}><span className="flex items-center gap-1">Campaign <SortIcon field="campaign_name" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advertiser</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">End Date</th>
                <th {...thC('priority')}><span className="flex items-center gap-1">Priority <SortIcon field="priority" /></span></th>
                <th {...thC('status')}><span className="flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                ))}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-14 text-center text-gray-400">
                  <ListMusic size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{searchTerm || filterStatus ? 'No campaigns match your filters' : 'No campaigns created yet'}</p>
                </td></tr>
              ) : filtered.map(camp => (
                <tr key={camp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{camp.campaign_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{camp.advertiser_name || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{camp.area || <span className="text-gray-400">–</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(camp.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(camp.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                      {camp.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={camp.status} approval={camp.approval_status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{camp.ad_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {camp.approval_status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(camp.id)}
                            className="px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-bold transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleReject(camp.id)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setPlaylistCampaign(camp)}
                        className="px-2 py-1 text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium flex items-center gap-1 transition-colors">
                        <ListMusic size={12} /> Playlist
                      </button>
                      {camp.status === 'Active' && (
                        <button onClick={() => handleStatusChange(camp.id, 'Paused')}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Pause">
                          <Pause size={14} />
                        </button>
                      )}
                      {camp.status === 'Paused' && (
                        <button onClick={() => handleStatusChange(camp.id, 'Active')}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Resume">
                          <Play size={14} />
                        </button>
                      )}
                      <button onClick={() => { setEditing(camp); setFormData({ ...camp, start_date: camp.start_date?.split('T')[0] || '', end_date: camp.end_date?.split('T')[0] || '' }); setShowModal(true) }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(camp)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input type="text" value={formData.campaign_name}
                  onChange={e => setFormData({ ...formData, campaign_name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser *</label>
                <select value={formData.advertiser_id}
                  onChange={e => setFormData({ ...formData, advertiser_id: e.target.value })} className="input" required>
                  <option value="">Select Advertiser</option>
                  {advertisers.map(a => <option key={a.id} value={a.id}>{a.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (for GPS matching)</label>
                <input type="text" value={formData.area || ''}
                  onChange={e => setFormData({ ...formData, area: e.target.value })} className="input"
                  placeholder="e.g. Koramangala, MG Road" />
                <p className="text-xs text-gray-500 mt-1">Devices will serve this campaign when their GPS matches this area.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1–10)</label>
                <input type="number" min="1" max="10" value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })} className="input" />
                <p className="text-xs text-gray-500 mt-1">Higher priority campaigns take precedence when multiple match.</p>
              </div>
              {editingCampaign && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })} className="input">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Stopped">Stopped</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCampaign ? 'Update' : 'Create'} Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {playlistCampaign && (
        <PlaylistModal
          campaign={playlistCampaign}
          allAds={allAds}
          onSave={fetchAll}
          onClose={() => setPlaylistCampaign(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.campaign_name}"? All playlist data will be removed.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
