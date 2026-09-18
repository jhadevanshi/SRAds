import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Monitor,
  Image,
  FileText,
  Calendar,
  Wrench,
  ClipboardList,
  Map,
  History,
  LogOut,
  CarFront
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const menuGroups = [
  {
    label: 'Live Operations',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/live-map',  icon: Map,             label: 'Live Map' },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/advertisers', icon: Users,        label: 'Advertisers' },
      { path: '/drivers',     icon: CarFront,     label: 'Drivers' },
      { path: '/devices',     icon: Monitor,      label: 'Devices' },
      { path: '/media',       icon: Image,        label: 'Media Library' },
      { path: '/ads',         icon: FileText,     label: 'Advertisements' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { path: '/playback-history', icon: History,        label: 'Playback History' },

      { path: '/logs',             icon: ClipboardList,  label: 'Activity Logs' },
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      {/* Brand */}
      <div className="p-5 border-b border-gray-700 shrink-0">
        <h1 className="text-xl font-bold text-primary-400 tracking-wide">SRAds</h1>
        <p className="text-xs text-gray-400 mt-0.5">Operations Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {menuGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.label}</p>
            <ul className="space-y-0.5 mt-1">
              {group.items.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-700 shrink-0">
        <div className="px-3 mb-2">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
