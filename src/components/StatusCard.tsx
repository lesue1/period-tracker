import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import type { CycleRecord, AppSettings, Prediction } from '../types'
import { todayStr, diffDays } from '../utils/dateUtils'
import { getAverageCycleLength, getAveragePeriodLength } from '../utils/cycleCalculator'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
  predictions: Prediction[]
}

interface Status {
  cycleDay: number
  daysUntilNext: number
  phase: { label: string; color: string; bg: string; dot: string; desc: string }
}

function getStatus(records: CycleRecord[], predictions: Prediction[], settings: AppSettings): Status | null {
  const today = todayStr()
  const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length === 0) return null

  const last = sorted[sorted.length - 1]
  const cycleDay = diffDays(last.startDate, today) + 1

  const nextPeriods = predictions.filter(p => p.type === 'period').map(p => p.date).sort()
  const nextPeriodDate = nextPeriods[0]
  const daysUntilNext = nextPeriodDate ? diffDays(today, nextPeriodDate) : null

  const avgCycle = getAverageCycleLength(records) ?? settings.cycleLength

  const avgPeriodLen = getAveragePeriodLength(records) ?? settings.periodLength
  const isPeriodDay = records.some(r => {
    if (r.startDate === today) return true
    if (!r.endDate) {
      // No end date set — treat as ongoing for up to avg period length
      return today > r.startDate && diffDays(r.startDate, today) < avgPeriodLen
    }
    return today >= r.startDate && today <= r.endDate
  })

  const ovulationDates = predictions.filter(p => p.type === 'ovulation').map(p => p.date).sort()
  const thisOvulation = ovulationDates.find(d => {
    if (nextPeriodDate) return d >= last.startDate && d <= nextPeriodDate
    return d >= last.startDate
  })

  const fertileDays = predictions.filter(p => p.type === 'fertile').map(p => p.date)
  const isFertileDay = fertileDays.includes(today)
  const isOvulationDay = predictions.some(p => p.type === 'ovulation' && p.date === today)

  let phase: Status['phase']
  if (isPeriodDay) {
    phase = { label: '经期', color: '#dc2626', bg: 'from-red-50 to-rose-50', dot: 'bg-red-400', desc: '注意保暖，多休息' }
  } else if (isOvulationDay) {
    phase = { label: '排卵日', color: '#2563eb', bg: 'from-blue-50 to-indigo-50', dot: 'bg-blue-400', desc: '受孕概率最高' }
  } else if (isFertileDay) {
    phase = { label: '易孕期', color: '#16a34a', bg: 'from-emerald-50 to-green-50', dot: 'bg-emerald-400', desc: '处于受孕窗口期' }
  } else if (thisOvulation && today > thisOvulation) {
    phase = { label: '黄体期', color: '#ea580c', bg: 'from-orange-50 to-amber-50', dot: 'bg-orange-400', desc: '可能有些情绪波动' }
  } else {
    phase = { label: '卵泡期', color: '#7c3aed', bg: 'from-purple-50 to-violet-50', dot: 'bg-purple-400', desc: '精力充沛的好时期' }
  }

  return { cycleDay, daysUntilNext: daysUntilNext ?? avgCycle, phase }
}

export default function StatusCard({ records, predictions, settings }: Props) {
  const status = useMemo(
    () => getStatus(records, predictions, settings),
    [records, predictions, settings]
  )

  if (!status) {
    return (
      <div className="mx-4 mb-4 card animate-fade-in">
        <div className="p-5 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-50 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 text-primary-300" />
          </div>
          <p className="text-sm text-gray-500">记录第一次经期开始日期</p>
          <p className="text-xs text-gray-400 mt-1">开始追踪你的周期变化</p>
        </div>
      </div>
    )
  }

  const { cycleDay, daysUntilNext, phase } = status
  const cycleLength = getAverageCycleLength(records) ?? settings.cycleLength
  const progress = Math.min(cycleDay / cycleLength, 1)
  const circumference = 2 * Math.PI * 22

  return (
    <div className="mx-4 mb-4 animate-droplet">
      <div className={`bg-gradient-to-br ${phase.bg} rounded-[22px] p-5 card-elevated `}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-2.5 h-2.5 rounded-full ${phase.dot} ring-4 ring-white/60`} />
          <span className="text-lg font-bold tracking-tight" style={{ color: phase.color }}>
            {phase.label}
          </span>
          <span className="text-xs text-gray-400 ml-auto bg-white/70 px-2.5 py-1 rounded-full font-medium">
            第 {cycleDay} 天
          </span>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white/70 rounded-2xl p-4 backdrop-blur-sm relative">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">下次经期</p>
            <div className="flex items-center gap-2">
              {/* Progress ring */}
              <svg width="52" height="52" className="shrink-0 -rotate-90">
                <circle cx="26" cy="26" r="22" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle cx="26" cy="26" r="22" fill="none" stroke={phase.color} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.8s var(--spring-soft)' }}
                />
                <text x="26" y="26" textAnchor="middle" dy="0.35em" fontSize="11" fontWeight="700"
                  fill={phase.color} transform="rotate(90, 26, 26)">
                  {Math.round(progress * 100)}%
                </text>
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-[34px] font-bold text-gray-900 leading-none tracking-tight">
                  {daysUntilNext}
                </span>
                <span className="text-sm text-gray-400 font-medium">天后</span>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white/70 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">今日状态</p>
            <p className="text-sm font-semibold leading-tight mt-2" style={{ color: phase.color }}>
              {phase.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
