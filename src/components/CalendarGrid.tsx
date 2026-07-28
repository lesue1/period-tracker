import DayCell from './DayCell'
import type { DayMarker } from '../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  dayMarkers: DayMarker[]
  firstDayOfWeek: number
  onDayClick: (date: string) => void
}

export default function CalendarGrid({ dayMarkers, firstDayOfWeek, onDayClick }: Props) {
  // Always render 42 cells (6 rows × 7 columns) for consistent height
  const leadingEmpty = firstDayOfWeek
  const totalCells = leadingEmpty + dayMarkers.length
  const trailingEmpty = totalCells >= 42 ? 0 : 42 - totalCells

  return (
    <div className="px-3">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[11px] font-semibold text-gray-400 py-1.5 tracking-wide">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingEmpty }).map((_, i) => (
          <div key={`lead-${i}`} className="aspect-square" />
        ))}
        {dayMarkers.map(marker => (
          <DayCell key={marker.date} marker={marker} onClick={onDayClick} />
        ))}
        {Array.from({ length: trailingEmpty }).map((_, i) => (
          <div key={`trail-${i}`} className="aspect-square" />
        ))}
      </div>
    </div>
  )
}
