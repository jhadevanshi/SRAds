import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Bell, Search, X, Monitor, Users, Calendar, PlayCircle, Image } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ENTITY_ICONS = {
  devices:     { icon: Monitor,    color: 'text-blue-500',   label: 'Device',        path: '/devices' },
  advertisers: { icon: Users,      color: 'text-orange-500', label: 'Advertiser',    path: '/advertisers' },
  campaigns:   { icon: Calendar,   color: 'text-purple-500', label: 'Campaign',      path: '/campaigns' },
  ads:         { icon: PlayCircle, color: 'text-pink-500',   label: 'Advertisement', path: '/ads' },
  media:       { icon: Image,      color: 'text-indigo-500', label: 'Media',         path: '/media' },
}

export default function Header() {
  const { user }        = useAuth()
  const navigate        = useNavigate()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen]         = useState(false)
  const inputRef  = useRef(null)
  const wrapRef   = useRef(null)
  const debounce  = useRef(null)

  useEffect(() => {
    const handleClickOutside = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const runSearch = async q => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const [devRes, advRes, campRes, adsRes, mediaRes] = await Promise.all([
        axios.get('/api/devices',     { params: { search: q } }),
        axios.get('/api/advertisers', { params: { search: q } }),
        axios.get('/api/campaigns'),
        axios.get('/api/ads'),
        axios.get('/api/media'),
      ])

      const grouped = [
        ...devRes.data.devices.slice(0, 3).map(d => ({
          type: 'devices', id: d.id, label: d.device_name, sub: d.adsd_id
        })),
        ...advRes.data.advertisers.slice(0, 3).map(a => ({
          type: 'advertisers', id: a.id, label: a.company_name, sub: a.email
        })),
        ...campRes.data.campaigns.filter(c =>
          c.campaign_name.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3).map(c => ({
          type: 'campaigns', id: c.id, label: c.campaign_name, sub: c.advertiser_name
        })),
        ...adsRes.data.ads.filter(a =>
          a.title.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3).map(a => ({
          type: 'ads', id: a.id, label: a.title, sub: a.advertiser_name
        })),
        ...mediaRes.data.media.filter(m =>
          m.title.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3).map(m => ({
          type: 'media', id: m.id, label: m.title, sub: m.media_type
        })),
      ]
      setResults(grouped)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleChange = e => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => runSearch(q), 300)
  }

  const handleSelect = item => {
    navigate(ENTITY_ICONS[item.type].path)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Global Search */}
        <div className="flex-1 max-w-lg relative" ref={wrapRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => query.length >= 2 && setOpen(true)}
              placeholder="Search devices, advertisers, campaigns, ads..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {open && (query.length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {searching ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No results for "{query}"</div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {results.map((item, i) => {
                    const meta = ENTITY_ICONS[item.type]
                    const Icon = meta.icon
                    return (
                      <button key={`${item.type}-${item.id}-${i}`} onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                        <Icon size={16} className={meta.color} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                          <p className="text-xs text-gray-500 truncate">{meta.label} {item.sub ? `· ${item.sub}` : ''}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
