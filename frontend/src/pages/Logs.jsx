import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter } from 'lucide-react'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterModule, setFilterModule] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [filterModule, filterAction])

  const fetchLogs = async () => {
    try {
      const params = {}
      if (filterModule) params.module = filterModule
      if (filterAction) params.action = filterAction
      
      const response = await axios.get('/api/logs', { params })
      setLogs(response.data.logs)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.admin_name && log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const modules = [...new Set(logs.map(log => log.module))]
  const actions = [...new Set(logs.map(log => log.action))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="input w-48"
        >
          <option value="">All Modules</option>
          {modules.map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="input w-48"
        >
          <option value="">All Actions</option>
          {actions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.admin_name || 'System'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.module}</td>
                <td className="px-6 py-4 text-gray-900 max-w-md truncate">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Logs
