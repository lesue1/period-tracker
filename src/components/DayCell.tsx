import type { DayMarker } from '../types'
import { FLOW_LEVELS } from '../types'

interface Props {
  marker: DayMarker
  onClick: (date: string) => void
}

export default function DayCell({ marker, onClick }: Props) {
  const { date, isPeriod, isPredicted, isOvulation, isFertile, isToday, record } = marker
  const day = parseInt(date.slice(8), 10)
  const flowColor = record?.flow ? FLOW_LEVELS[record.flow - 1]?.color : undefined

  let bgClass = 'hover:bg-gray-100'
  if (isPeriod && !isPredicted) bgClass = 'bg-red-100 hover:bg-red-200'
  else if (isPeriod && isPredicted) bgClass = 'bg-red-100 hover:bg-red-200'
  else if (isPredicted && !isPeriod) bgClass = 'bg-pink-50 hover:bg-pink-100'
  else if (isOvulation) bgClass = 'bg-blue-50 hover:bg-blue-100'
  else if (isFertile && !isOvulation) bgClass = 'bg-green-50 hover:bg-green-100'

  return (
    <button
      onClick={() => onClick(date)}
      className={`aspect-square flex flex-col items-center justify-center rounded-full relative
        transition-all active:scale-95 ${bgClass}
        ${isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
      style={isPeriod && flowColor ? { backgroundColor: flowColor } : undefined}
    >
      <span className={`text-sm font-medium
        ${isToday ? 'text-primary-600 font-bold' : isPeriod && flowColor ? 'text-white' : 'text-gray-800'}`}>
        {day}
      </span>
      <div className="flex gap-0.5 mt-0.5">
        {isOvulation && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        {record?.notes && <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
      </div>
    </button>
  )
}
