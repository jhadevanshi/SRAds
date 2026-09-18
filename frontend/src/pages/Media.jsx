import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Upload, Trash2, Image as ImageIcon, Video, Search,
  Filter, X, Film, FileImage, Eye
} from 'lucide-react'

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

const formatBytes = bytes => {
  if (!bytes) return '–'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

const PreviewModal = ({ item, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="max-w-3xl w-full max-h-[90vh] bg-black rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <p className="text-white text-sm font-medium">{item.title}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
      </div>
      {item.media_type === 'image'
        ? <img src={`http://localhost:5000${item.file_url}`} alt={item.title} className="w-full max-h-[75vh] object-contain" />
        : <video src={`http://localhost:5000${item.file_url}`} controls className="w-full max-h-[75vh]" autoPlay />
      }
    </div>
  </div>
)

export default function Media() {
  const [media, setMedia]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [previewItem, setPreviewItem]     = useState(null)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterType, setFilterType]   = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', media_type: 'image', duration: '' })

  const fetchMedia = async () => {
    try {
      const res = await axios.get('/api/media')
      setMedia(res.data.media)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMedia() }, [])

  const handleUpload = async e => {
    e.preventDefault()
    if (!selectedFile) { alert('Please select a file'); return }
    const data = new FormData()
    data.append('file', selectedFile)
    data.append('title', formData.title)
    data.append('media_type', formData.media_type)
    if (formData.duration) data.append('duration', formData.duration)
    setUploading(true)
    try {
      await axios.post('/api/media', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchMedia()
      setFormData({ title: '', media_type: 'image', duration: '' })
      setSelectedFile(null)
      setShowUploadForm(false)
    } catch { alert('Error uploading media') }
    finally { setUploading(false) }
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/media/${id}`)
      fetchMedia()
    } catch { alert('Error deleting media') }
    finally { setConfirmDelete(null) }
  }

  const filtered = media.filter(m => {
    if (filterType && m.media_type !== filterType) return false
    if (searchTerm && !m.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const imgCount   = media.filter(m => m.media_type === 'image').length
  const videoCount = media.filter(m => m.media_type === 'video').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {imgCount} images · {videoCount} videos · {media.length} total
          </p>
        </div>
        <button onClick={() => setShowUploadForm(v => !v)}
          className="btn btn-primary flex items-center gap-2">
          <Upload size={18} /> Upload Media
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card">
          <h3 className="text-base font-semibold mb-4">Upload New Media</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                <select value={formData.media_type}
                  onChange={e => setFormData({ ...formData, media_type: e.target.value })} className="input">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            {formData.media_type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                <input type="number" min="1" value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })} className="input" placeholder="e.g. 30" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
              <input type="file" onChange={e => setSelectedFile(e.target.files[0])}
                accept="image/*,video/*" className="input" required />
              {selectedFile && <p className="text-xs text-gray-500 mt-1">{selectedFile.name} ({formatBytes(selectedFile.size)})</p>}
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={uploading}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                <Upload size={16} />{uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search media..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          {[['', 'All'], ['image', 'Images'], ['video', 'Videos']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filterType === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {val === 'image' && <FileImage size={14} />}
              {val === 'video' && <Film size={14} />}
              {label}
            </button>
          ))}
        </div>
        {(filterType || searchTerm) && (
          <button onClick={() => { setFilterType(''); setSearchTerm('') }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {media.length}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-0 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{searchTerm || filterType ? 'No media matches your search' : 'No media uploaded yet'}</p>
          <p className="text-sm mt-1">Upload images or videos to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-video bg-gray-100 relative overflow-hidden cursor-pointer"
                onClick={() => setPreviewItem(item)}>
                {item.media_type === 'image' ? (
                  <img src={`http://localhost:5000${item.file_url}`} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-800">
                    <Video size={36} className="text-gray-300" />
                    <span className="text-xs mt-1 text-gray-400">Video</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                  <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className={`absolute top-2 left-2 px-1.5 py-0.5 text-xs rounded font-medium ${
                  item.media_type === 'image' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {item.media_type === 'image' ? 'IMG' : 'VID'}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={item.title}>{item.title}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1">
                      {item.duration && <span className="text-xs text-gray-500">{item.duration}s</span>}
                      {item.resolution && <span className="text-xs text-gray-500">{item.resolution}</span>}
                      <span className="text-xs text-gray-400">{formatBytes(item.size)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.uploaded_by_name || 'Admin'} · {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => setConfirmDelete(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.title}"? This will also remove it from any advertisements.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
