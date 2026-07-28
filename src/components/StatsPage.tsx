import { useMemo } from 'react'
import { CalendarCheck, Timer, Activity, Tag } from 'lucide-react'
import type { CycleRecord, AppSettings } from '../types'
import { CYCLE_TAG_OPTIONS } from '../types'
import { getAverageCycleLength, getAveragePeriodLength } from '../utils/cycleCalculator'
import CycleLengthChart from './CycleLengthChart'
import SymptomPieChart from './SymptomPieChart'
import BBTChart from './BBTChart'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
}

export default function StatsPage({ records, settings }: Props) {
  const stats = useMemo(() => ({
    totalRecords: records.length,
    avgCycle: getAverageCycleLength(records),
    avgPeriod: getAveragePeriodLength(records),
  }), [records])

  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of records) {
      for (const t of r.cycleTags || []) {
        counts[t] = (counts[t] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([key, value]) => ({
        ...CYCLE_TAG_OPTIONS.find(o => o.key === key),
        key,
        count: value,
      }))
      .filter(t => t.label)
      .sort((a, b) => b.count - a.count)
  }, [records])

  const cards = [
    { label: '记录次数', value: stats.totalRecords, icon: CalendarCheck, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: '平均周期', value: stats.avgCycle ?? '—', unit: '天', icon: Timer, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '平均经期', value: stats.avgPeriod ?? '—', unit: '天', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-4 space-y-4 pb-28">
      <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight px-1">统计</h2>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.label} className="card p-3.5 text-center">
            <div className={`w-9 h-9 mx-auto mb-2 rounded-xl ${c.bg} flex items-center justify-center`}>
              <c.icon className={`w-4 h-4 ${c.color}`} strokeWidth={2} />
            </div>
            <p className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-none">
              {c.value}
            </p>
            {c.unit && <span className="text-[11px] text-gray-400">{c.unit}</span>}
            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {tagStats.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-gray-400" /> 周期因素
          </h3>
          <div className="flex flex-wrap gap-2">
            {tagStats.map(t => (
              <span key={t.key} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                {t.icon} {t.label}
                <span className="text-gray-400 ml-0.5">{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <CycleLengthChart records={records} />
      <SymptomPieChart records={records} />
      <BBTChart records={records} settings={settings} />
    </div>
  )
}
