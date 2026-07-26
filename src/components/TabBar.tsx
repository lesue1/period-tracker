import { Calendar, BarChart3, Settings } from 'lucide-react'
import type { TabType } from '../types'

interface Props {
  active: TabType
  onChange: (tab: TabType) => void
}

const tabs: { key: TabType; label: string; Icon: typeof Calendar }[] = [
  { key: 'calendar', label: '日历', Icon: Calendar },
  { key: 'stats', label: '统计', Icon: BarChart3 },
  { key: 'settings', label: '设置', Icon: Settings },
]

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 w-full max-w-lg glass rounded-t-3xl border-t border-gray-100 z-40">
      <div className="flex">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center py-2 pt-3 transition-colors ${active === key ? 'text-primary-500' : 'text-gray-400'}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div className="safe-bottom h-5" />
    </nav>
  )
}
