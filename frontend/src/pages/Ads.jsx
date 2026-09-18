import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search, X, Eye, Image, Video, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react'

const StatusBadge = ({ status, approval }) => {
  if (approval === 'Pending') return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  if (approval === 'Rejected') return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800">Rejected</span>;
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
      status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
    }`}>{status}</span>
  );
}

const TypeBadge = ({ type }) => (
  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
    type === 'CAMPAIGN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
  }`}>{type}</span>
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

const PreviewModal = ({ ad, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-lg">{ad.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
      </div>
      <div className="p-6">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          {ad.media_type === 'image'
            ? <img src={`http://localhost:5000${ad.file_url}`} alt={ad.title} className="w-full h-full object-cover" />
            : <video src={`http://localhost:5000${ad.file_url}`} controls className="w-full h-full" />
          }
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Advertiser', ad.advertiser_name || '–'],
            ['Category', ad.category || '–'],
            ['Type', ad.ad_type],
            ['Duration', `${ad.play_duration || 15}s`],
            ['Media Type', ad.media_type],
            ['Status', ad.status],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-xs text-gray-500 uppercase">{label}</span>
              <p className="font-medium text-gray-900 mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const emptyForm = {
  title: '', advertiser_id: '', media_id: '', category: '', ad_type: 'GENERAL', play_duration: 15
}

export default function Ads() {
  const [ads, setAds]                 = useState([])
  const [media, setMedia]             = useState([])
  const [advertisers, setAdvertisers] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editingAd, setEditingAd]     = useState(null)
  const [previewAd, setPreviewAd]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData, setFormData]       = useState(emptyForm)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterType, setFilterType]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField]     = useState('created_at')
  const [sortDir, setSortDir]         = useState('desc')

  const fetchData = async () => {
    try {
      const [adsRes, mediaRes, advertisersRes] = await Promise.all([
        axios.get('/api/ads'),
        axios.get('/api/media'),
        axios.get('/api/advertisers')
      ])
      setAds(adsRes.data.ads)
      setMedia(mediaRes.data.media)
      setAdvertisers(advertisersRes.data.advertisers)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = { ...formData, play_duration: parseInt(formData.play_duration) || 15 }
      if (editingAd) await axios.put(`/api/ads/${editingAd.id}`, payload)
      else await axios.post('/api/ads', payload)
      fetchData()
      setShowModal(false)
      setEditingAd(null)
      setFormData(emptyForm)
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving advertisement')
    }
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/ads/${id}`)
      fetchData()
    } catch { alert('Error deleting advertisement') }
    finally { setConfirmDelete(null) }
  }

  const handleApprove = async id => {
    try {
      await axios.put(`/api/ads/${id}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving ad');
    }
  }

  const handleReject = async id => {
    const reason = window.prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await axios.put(`/api/ads/${id}/reject`, { reason });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting ad');
    }
  }

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => sortField !== field ? null :
    sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />

  const filtered = ads
    .filter(a => {
      if (filterType && a.ad_type !== filterType) return false
      if (filterStatus && a.status !== filterStatus) return false
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        return a.title?.toLowerCase().includes(q) || a.advertiser_name?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      let av = a[sortField] || ''
      let bv = b[sortField] || ''
      if (sortField === 'created_at') {
        av = new Date(av).getTime()
        bv = new Date(bv).getTime()
        return sortDir === 'asc' ? av - bv : bv - av
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
        <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
        <button onClick={() => { setEditingAd(null); setFormData(emptyForm); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Advertisement
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by title, advertiser..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-36 text-sm">
          <option value="">All Types</option>
          <option value="GENERAL">General</option>
          <option value="CAMPAIGN">Campaign</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-36 text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {(filterType || filterStatus || searchTerm) && (
          <button onClick={() => { setFilterType(''); setFilterStatus(''); setSearchTerm('') }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {ads.length}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                <th {...thC('title')}><span className="flex items-center gap-1">Title <SortIcon field="title" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advertiser</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th {...thC('ad_type')}><span className="flex items-center gap-1">Type <SortIcon field="ad_type" /></span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th {...thC('status')}><span className="flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th {...thC('created_at')}><span className="flex items-center gap-1">Created <SortIcon field="created_at" /></span></th>
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
                  <Image size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{searchTerm || filterType || filterStatus ? 'No ads match your filters' : 'No advertisements yet'}</p>
                </td></tr>
              ) : filtered.map(ad => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {ad.file_url
                        ? ad.media_type === 'image'
                          ? <img src={`http://localhost:5000${ad.file_url}`} alt="" className="w-full h-full object-cover" />
                          : <Video size={16} className="text-gray-400" />
                        : <Image size={16} className="text-gray-300" />
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{ad.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ad.advertiser_name || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ad.category || '–'}</td>
                  <td className="px-4 py-3"><TypeBadge type={ad.ad_type} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ad.play_duration || ad.duration || 15}s</td>
                  <td className="px-4 py-3"><StatusBadge status={ad.status} approval={ad.approval_status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(ad.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {ad.approval_status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(ad.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-bold" title="Approve">
                            Approve
                          </button>
                          <button onClick={() => handleReject(ad.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold" title="Reject">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setPreviewAd(ad)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => { setEditingAd(ad); setFormData({ ...ad, play_duration: ad.play_duration || ad.duration || 15 }); setShowModal(true) }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete(ad)}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Media *</label>
                <select value={formData.media_id}
                  onChange={e => setFormData({ ...formData, media_id: e.target.value })} className="input" required>
                  <option value="">Select Media</option>
                  {media.map(m => <option key={m.id} value={m.id}>{m.title} ({m.media_type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advertisement Type *</label>
                  <select value={formData.ad_type}
                    onChange={e => setFormData({ ...formData, ad_type: e.target.value })} className="input">
                    <option value="GENERAL">General</option>
                    <option value="CAMPAIGN">Campaign</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">GENERAL: plays everywhere. CAMPAIGN: assigned to specific campaigns.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Play Duration (seconds) *</label>
                  <input type="number" min="1" value={formData.play_duration}
                    onChange={e => setFormData({ ...formData, play_duration: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={formData.category || ''}
                  onChange={e => setFormData({ ...formData, category: e.target.value })} className="input"
                  placeholder="e.g. Retail, Food, Services" />
              </div>
              {editingAd && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status || 'Active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })} className="input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAd ? 'Update' : 'Create'} Advertisement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewAd && <PreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} />}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.title}"? This will remove it from all campaigns.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
