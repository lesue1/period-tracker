import DayCell from './DayCell'
import type { DayMarker } from '../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  dayMarkers: DayMarker[]
  firstDayOfWeek: number
  onDayClick: (date: string) => void
}

export default function CalendarGrid({ dayMarkers, firstDayOfWeek, onDayClick }: Props) {
  return (
    <div className="px-2">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-xs font-medium text-gray-400 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {dayMarkers.map(marker => (
          <DayCell key={marker.date} marker={marker} onClick={onDayClick} />
        ))}
      </div>
    </div>
  )
}
