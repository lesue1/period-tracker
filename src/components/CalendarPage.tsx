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
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  const { predictions, dayMarkers } = usePredictions(records, settings, year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const defaultPeriodLength = getAveragePeriodLength(records) ?? settings.periodLength

  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const doSlide = useCallback((dir: 'left' | 'right', targetMonth: { year: number; month: number }) => {
    setSlideDir(dir)
    setTimeout(() => {
      setYear(targetMonth.year)
      setMonth(targetMonth.month)
      // Small delay to let React render new month, then slide in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideDir(null)
        })
      })
    }, 180)
  }, [])

  const goPrev = useCallback(() => {
    const prev = addMonths(year, month, -1)
    doSlide('right', prev)
  }, [year, month, doSlide])

  const goNext = useCallback(() => {
    const next = addMonths(year, month, 1)
    doSlide('left', next)
  }, [year, month, doSlide])

  const goToday = useCallback(() => {
    const t = new Date()
    const target = { year: t.getFullYear(), month: t.getMonth() }
    if (target.year === year && target.month === month) return
    doSlide(target.month > month ? 'left' : 'right', target)
  }, [year, month, doSlide])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }, [goPrev, goNext])

  const selectedRecord = selectedDate
    ? records.find(r => r.startDate === selectedDate) || null
    : null

  // Slide animation: slide out → snap back from opposite side
  const slideTransform = slideDir === 'left' ? 'translateX(-40px)' : slideDir === 'right' ? 'translateX(40px)' : 'translateX(0)'
  const slideStyle: React.CSSProperties = {
    transform: slideTransform,
    opacity: slideDir ? 0.3 : 1,
    transition: slideDir
      ? 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease-out'
      : 'transform 0.35s cubic-bezier(0.22, 1.2, 0.48, 1), opacity 0.35s ease-out',
  }

  return (
    <div
      className="flex flex-col h-full pt-2 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <StatusCard records={records} settings={settings} predictions={predictions} />
      <div style={slideStyle}>
        <MonthHeader year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
        <CalendarGrid dayMarkers={dayMarkers} firstDayOfWeek={firstDay} onDayClick={setSelectedDate} />
        <LegendRow />
      </div>

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
