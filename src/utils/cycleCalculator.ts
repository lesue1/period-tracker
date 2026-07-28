import type { CycleRecord, AppSettings, Prediction, DayMarker } from '../types'
import { todayStr, isoDate, diffDays, addDays, getDaysInMonth } from './dateUtils'

export function getAverageCycleLength(records: CycleRecord[]): number | null {
  const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length < 2) return null
  let total = 0, count = 0
  for (let i = 1; i < sorted.length; i++) {
    const d = diffDays(sorted[i - 1].startDate, sorted[i].startDate)
    if (d > 0 && d < 90) { total += d; count++ }
  }
  return count > 0 ? Math.round(total / count) : null
}

export function getAveragePeriodLength(records: CycleRecord[]): number | null {
  const completed = records.filter(r => r.endDate)
  if (completed.length === 0) return null
  let total = 0
  for (const r of completed) {
    total += diffDays(r.startDate, r.endDate!) + 1
  }
  return Math.round(total / completed.length)
}

export function calculatePredictions(
  records: CycleRecord[],
  settings: AppSettings
): Prediction[] {
  const predictions: Prediction[] = []
  const sorted = [...records].filter(r => r.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length === 0) return predictions

  const avgCycle = getAverageCycleLength(records) ?? settings.cycleLength
  const avgPeriod = getAveragePeriodLength(records) ?? settings.periodLength
  const luteal = settings.lutealPhase
  const today = todayStr()

  const lastStart = sorted[sorted.length - 1].startDate
  let nextStart = addDays(lastStart, avgCycle)

  for (let i = 0; i < 6; i++) {
    for (let d = 0; d < avgPeriod; d++) {
      const date = addDays(nextStart, d)
      if (date >= today) {
        predictions.push({ date, type: 'period', label: '经期' })
      }
    }
    const ovDay = addDays(nextStart, avgCycle - luteal)
    if (ovDay >= today) {
      predictions.push({ date: ovDay, type: 'ovulation', label: '排卵日' })
    }
    for (let d = -5; d <= 1; d++) {
      const fDay = addDays(ovDay, d)
      if (fDay >= today && fDay !== ovDay) {
        predictions.push({ date: fDay, type: 'fertile', label: '易孕期' })
      }
    }
    nextStart = addDays(nextStart, avgCycle)
  }
  return predictions
}

export function buildDayMarkers(
  year: number,
  month: number,
  records: CycleRecord[],
  predictions: Prediction[]
): DayMarker[] {
  const daysInMonth = getDaysInMonth(year, month)
  const today = todayStr()

  const periodDays = new Set<string>()
  for (const r of records) {
    periodDays.add(r.startDate)
    if (r.endDate && /^\d{4}-\d{2}-\d{2}$/.test(r.endDate)) {
      const start = new Date(r.startDate + 'T00:00:00')
      const end = new Date(r.endDate + 'T00:00:00')
      if (isNaN(end.getTime())) continue
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        periodDays.add(isoDate(d))
      }
    }
  }

  const predMap = new Map<string, Prediction[]>()
  for (const p of predictions) {
    const arr = predMap.get(p.date) || []
    arr.push(p)
    predMap.set(p.date, arr)
  }

  const markers: DayMarker[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = isoDate(new Date(year, month, day))
    const dayPreds = predMap.get(dateStr) || []
    markers.push({
      date: dateStr,
      isPeriod: periodDays.has(dateStr),
      isPredicted: dayPreds.some(p => p.type === 'period'),
      isOvulation: dayPreds.some(p => p.type === 'ovulation'),
      isFertile: dayPreds.some(p => p.type === 'fertile'),
      isToday: dateStr === today,
      record: records.find(r => r.startDate === dateStr) || null,
    })
  }
  return markers
}
