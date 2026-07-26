import { useState, useCallback, useRef } from 'react'
import MonthHeader from './MonthHeader'
import CalendarGrid from './CalendarGrid'
import LegendRow from './LegendRow'
import PeriodEditSheet from './PeriodEditSheet'
import StatusCard from './StatusCard'
import { usePredictions } from '../hooks/usePredictions'
import { getFirstDayOfMonth, addMonths } from '../utils/dateUtils'
import { getAveragePeriodLength } from '../utils/cycleCalculator'
import type { CycleRecord, AppSettings } from '../types'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
  onSave: (record: CycleRecord) => void
  onDelete: (id: string) => void
}

export default function CalendarPage({ records, settings, onSave, onDelete }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { predictions, dayMarkers } = usePredictions(records, settings, year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const defaultPeriodLength = getAveragePeriodLength(records) ?? settings.periodLength

  // Swipe gesture
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const goPrev = useCallback(() => {
    const prev = addMonths(year, month, -1)
    setYear(prev.year); setMonth(prev.month)
  }, [year, month])

  const goNext = useCallback(() => {
    const next = addMonths(year, month, 1)
    setYear(next.year); setMonth(next.month)
  }, [year, month])

  const goToday = useCallback(() => {
    const t = new Date()
    setYear(t.getFullYear()); setMonth(t.getMonth())
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null

    // Only swipe if horizontal movement > vertical and > 50px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }, [goPrev, goNext])

  const selectedRecord = selectedDate
    ? records.find(r => r.startDate === selectedDate) || null
    : null

  return (
    <div
      className="flex flex-col h-full pt-2 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <StatusCard records={records} settings={settings} predictions={predictions} />
      <MonthHeader year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      <CalendarGrid dayMarkers={dayMarkers} firstDayOfWeek={firstDay} onDayClick={setSelectedDate} />
      <LegendRow />

      {selectedDate && (
        <PeriodEditSheet
          date={selectedDate}
          record={selectedRecord}
          defaultPeriodLength={defaultPeriodLength}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
