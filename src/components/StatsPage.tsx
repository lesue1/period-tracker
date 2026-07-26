import { useMemo } from 'react'
import { CalendarCheck, Timer, Activity } from 'lucide-react'
import type { CycleRecord, AppSettings } from '../types'
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

      <CycleLengthChart records={records} />
      <SymptomPieChart records={records} />
      <BBTChart records={records} settings={settings} />
    </div>
  )
}
