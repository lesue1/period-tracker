import { useMemo } from 'react'
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

  return (
    <div className="p-4 space-y-4 pb-28">
      <h2 className="text-xl font-bold text-gray-900 px-1">统计</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.totalRecords}</p>
          <p className="text-xs text-gray-500 mt-1">总记录数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.avgCycle ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">平均周期(天)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.avgPeriod ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">平均经期(天)</p>
        </div>
      </div>

      <CycleLengthChart records={records} />
      <SymptomPieChart records={records} />
      <BBTChart records={records} settings={settings} />
    </div>
  )
}
