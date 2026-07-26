import { useMemo } from 'react'
import { CalendarDays, Activity } from 'lucide-react'
import type { CycleRecord, AppSettings, Prediction } from '../types'
import { todayStr, diffDays, addDays } from '../utils/dateUtils'
import { getAverageCycleLength, getAveragePeriodLength } from '../utils/cycleCalculator'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
  predictions: Prediction[]
}

interface Status {
  cycleDay: number
  daysUntilNext: number
  phase: { label: string; color: string; bg: string; emoji: string }
}

function getStatus(records: CycleRecord[], predictions: Prediction[], settings: AppSettings): Status | null {
  const today = todayStr()
  const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length === 0) return null

  const last = sorted[sorted.length - 1]
  const cycleDay = diffDays(last.startDate, today) + 1

  // Find next predicted period
  const nextPeriods = predictions
    .filter(p => p.type === 'period')
    .map(p => p.date)
    .sort()
  const nextPeriodDate = nextPeriods[0]
  const daysUntilNext = nextPeriodDate ? diffDays(today, nextPeriodDate) : null

  // Determine phase
  const avgPeriod = getAveragePeriodLength(records) ?? settings.periodLength
  const avgCycle = getAverageCycleLength(records) ?? settings.cycleLength

  // Check if today is a period day
  const isPeriodDay = records.some(r => {
    if (r.startDate === today) return true
    if (!r.endDate) return false
    return today >= r.startDate && today <= r.endDate
  })

  // Find ovulation and fertile predictions for this cycle
  const ovulationDates = predictions
    .filter(p => p.type === 'ovulation')
    .map(p => p.date)
    .sort()

  // The first ovulation after last period (and before next period)
  const thisOvulation = ovulationDates.find(d => {
    if (nextPeriodDate) return d >= last.startDate && d <= nextPeriodDate
    return d >= last.startDate
  })

  const fertileDays = predictions
    .filter(p => p.type === 'fertile')
    .map(p => p.date)

  const isFertileDay = fertileDays.includes(today)
  const isOvulationDay = predictions.some(p => p.type === 'ovulation' && p.date === today)

  let phase: Status['phase']
  if (isPeriodDay) {
    phase = { label: '经期', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴' }
  } else if (isOvulationDay) {
    phase = { label: '排卵日', color: 'text-blue-500', bg: 'bg-blue-50', emoji: '🔵' }
  } else if (isFertileDay) {
    phase = { label: '易孕期', color: 'text-green-500', bg: 'bg-green-50', emoji: '🟢' }
  } else if (thisOvulation && today > thisOvulation) {
    phase = { label: '黄体期', color: 'text-orange-500', bg: 'bg-orange-50', emoji: '🟠' }
  } else {
    phase = { label: '卵泡期', color: 'text-purple-500', bg: 'bg-purple-50', emoji: '🟣' }
  }

  return {
    cycleDay,
    daysUntilNext: daysUntilNext ?? avgCycle,
    phase,
  }
}

export default function StatusCard({ records, predictions, settings }: Props) {
  const status = useMemo(
    () => getStatus(records, predictions, settings),
    [records, predictions, settings]
  )

  if (!status) {
    return (
      <div className="mx-4 mb-3 card p-4 text-center text-sm text-gray-400">
        记录第一次经期开始日期，开始追踪你的周期
      </div>
    )
  }

  const { cycleDay, daysUntilNext, phase } = status
  const PhaseIcon = phase.emoji

  return (
    <div className="mx-4 mb-3">
      <div className={`${phase.bg} rounded-2xl p-4`}>
        {/* Phase badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-lg font-bold ${phase.color}`}>
            {phase.emoji} {phase.label}
          </span>
          {cycleDay > 0 && (
            <span className="text-xs text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded-full">
              周期第 {cycleDay} 天
            </span>
          )}
        </div>

        {/* Key info */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <CalendarDays className="w-3.5 h-3.5" />
              下次经期
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {daysUntilNext}
              <span className="text-sm font-normal text-gray-500 ml-0.5">天</span>
            </p>
          </div>
          <div className="flex-1 bg-white/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Activity className="w-3.5 h-3.5" />
              当前阶段
            </div>
            <p className={`text-base font-bold ${phase.color}`}>
              {phase.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
