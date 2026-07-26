import { useState, useCallback } from 'react'
import MonthHeader from './MonthHeader'
import CalendarGrid from './CalendarGrid'
import LegendRow from './LegendRow'
import PeriodEditSheet from './PeriodEditSheet'
import { usePredictions } from '../hooks/usePredictions'
import { getFirstDayOfMonth, addMonths } from '../utils/dateUtils'
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

  const { dayMarkers } = usePredictions(records, settings, year, month)
  const firstDay = getFirstDayOfMonth(year, month)

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

  const selectedRecord = selectedDate
    ? records.find(r => r.startDate === selectedDate) || null
    : null

  return (
    <div className="flex flex-col h-full pt-2">
      <MonthHeader year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      <CalendarGrid dayMarkers={dayMarkers} firstDayOfWeek={firstDay} onDayClick={setSelectedDate} />
      <LegendRow />

      {selectedDate && (
        <PeriodEditSheet
          date={selectedDate}
          record={selectedRecord}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
