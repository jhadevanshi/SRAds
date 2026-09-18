import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Search, Filter, X, RefreshCw, PlayCircle, ChevronLeft, ChevronRight, Radio } from 'lucide-react'

const REFRESH_INTERVAL = 15000
const PAGE_SIZE = 50

export default function PlaybackHistory() {
  const [logs, setLogs]               = useState([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [page, setPage]               = useState(0)

  // Filter state
  const [devices, setDevices]         = useState([])
  const [campaigns, setCampaigns]     = useState([])
  const [ads, setAds]                 = useState([])
  const [filterDevice, setFilterDevice]     = useState('')
  const [filterCampaign, setFilterCampaign] = useState('')
  const [filterAd, setFilterAd]             = useState('')
  const [filterVehicle, setFilterVehicle]   = useState('')
  const [filterArea, setFilterArea]         = useState('')
  const [dateFrom, setDateFrom]             = useState('')
  const [dateTo, setDateTo]                 = useState('')

  const buildParams = useCallback((pg = page) => {
    const p = { limit: PAGE_SIZE, offset: pg * PAGE_SIZE }
    if (filterDevice)   p.device_id    = filterDevice
    if (filterCampaign) p.campaign_id  = filterCampaign
    if (filterAd)       p.ad_id        = filterAd
    if (filterVehicle)  p.vehicle_number = filterVehicle
    if (filterArea)     p.area         = filterArea
    if (dateFrom)       p.date_from    = dateFrom
    if (dateTo)         p.date_to      = dateTo
    return p
  }, [page, filterDevice, filterCampaign, filterAd, filterVehicle, filterArea, dateFrom, dateTo])

  const fetchLogs = useCallback(async (pg = page, showBusy = false) => {
    if (showBusy) setRefreshing(true)
    try {
      const res = await axios.get('/api/logs/playback', { params: buildParams(pg) })
      setLogs(res.data.playback_logs)
      setTotal(res.data.total)
      setLastRefresh(new Date())
    } catch (err) { console.error(err) }
    finally { setLoading(false); setRefreshing(false) }
  }, [buildParams, page])

  useEffect(() => {
    // Load filter options once
    Promise.all([
      axios.get('/api/devices'),
      axios.get('/api/campaigns'),
      axios.get('/api/ads')
    ]).then(([d, c, a]) => {
      setDevices(d.data.devices)
      setCampaigns(c.data.campaigns)
      setAds(a.data.ads)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    setPage(0)
    fetchLogs(0)
  }, [filterDevice, filterCampaign, filterAd, filterVehicle, filterArea, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  useEffect(() => {
    const t = setInterval(() => fetchLogs(page), REFRESH_INTERVAL)
    return () => clearInterval(t)
  }, [fetchLogs, page])

  const clearFilters = () => {
    setFilterDevice(''); setFilterCampaign(''); setFilterAd('')
    setFilterVehicle(''); setFilterArea(''); setDateFrom(''); setDateTo('')
  }

  const hasFilters = filterDevice || filterCampaign || filterAd || filterVehicle || filterArea || dateFrom || dateTo
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playback History</h1>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Radio size={11} className="text-green-500 animate-pulse" />
              Auto-refreshes every 15s · {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={() => fetchLogs(page, true)} disabled={refreshing}
          className="btn btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4 px-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-primary-600 hover:underline flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Device</label>
            <select value={filterDevice} onChange={e => setFilterDevice(e.target.value)} className="input text-sm py-1.5">
              <option value="">All Devices</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.device_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Campaign</label>
            <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className="input text-sm py-1.5">
              <option value="">All Campaigns</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Advertisement</label>
            <select value={filterAd} onChange={e => setFilterAd(e.target.value)} className="input text-sm py-1.5">
              <option value="">All Ads</option>
              {ads.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vehicle Number</label>
            <input type="text" value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}
              placeholder="e.g. KA01AB1234" className="input text-sm py-1.5" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Area</label>
            <input type="text" value={filterArea} onChange={e => setFilterArea(e.target.value)}
              placeholder="e.g. Koramangala" className="input text-sm py-1.5" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input text-sm py-1.5" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input text-sm py-1.5" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{total.toLocaleString()} total records {hasFilters ? '(filtered)' : ''}</span>
        {totalPages > 1 && (
          <span>Page {page + 1} of {totalPages}</span>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Time', 'Device', 'Vehicle Type', 'Vehicle No.', 'Advertisement', 'Campaign', 'Area', 'Duration'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                ))}</tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                  <PlayCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">{hasFilters ? 'No records match your filters' : 'No playback records yet'}</p>
                  <p className="text-xs mt-1">Records appear here as devices play advertisements</p>
                </td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.played_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{log.device_name || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.vehicle_type || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.vehicle_number || '–'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[180px] truncate">
                    {log.ad_title || '–'}
                    {log.ad_type && (
                      <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded ${log.ad_type === 'CAMPAIGN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.ad_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-700">{log.campaign_name || <span className="text-gray-400">General</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.area || '–'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn btn-secondary flex items-center gap-1 text-sm disabled:opacity-40">
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pageIdx = totalPages <= 7 ? i : (
                page < 4 ? i : (page > totalPages - 5 ? totalPages - 7 + i : page - 3 + i)
              )
              return (
                <button key={pageIdx} onClick={() => setPage(pageIdx)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === pageIdx ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {pageIdx + 1}
                </button>
              )
            })}
          </div>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="btn btn-secondary flex items-center gap-1 text-sm disabled:opacity-40">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
