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
    <nav className="fixed bottom-0 w-full max-w-lg glass z-40 pt-1" style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}>
      <div className="flex items-end">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-200
                ${isActive ? 'text-primary-500' : 'text-gray-350 text-gray-400'}`}
            >
              <div className={`relative p-0.5 rounded-xl transition-all duration-200
                ${isActive ? '' : ''}`}>
                <Icon className={`w-[22px] h-[22px] transition-all duration-200
                  ${isActive ? 'scale-110' : 'scale-100'}`}
                  strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200
                ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
              {/* Active indicator dot */}
              <span className={`w-1 h-1 rounded-full bg-primary-500 transition-all duration-200
                ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
            </button>
          )
        })}
      </div>
      <div className="safe-bottom h-4" />
    </nav>
  )
}
