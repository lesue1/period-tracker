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

  let bg = ''
  let textColor = 'text-gray-700'
  let dot = ''

  if (isPeriod && !isPredicted) {
    bg = 'bg-red-50'
    textColor = 'text-red-600 font-semibold'
    dot = 'bg-red-400'
  } else if (isPredicted && !isPeriod) {
    bg = 'bg-pink-50/60'
    textColor = 'text-pink-500'
    dot = 'border-2 border-pink-300'
  } else if (isPeriod && isPredicted) {
    bg = 'bg-red-50'
    textColor = 'text-red-600 font-semibold'
  } else if (isOvulation) {
    bg = 'bg-blue-50'
    textColor = 'text-blue-600 font-semibold'
    dot = 'bg-blue-400'
  } else if (isFertile && !isOvulation) {
    bg = 'bg-emerald-50/50'
    textColor = 'text-emerald-600'
  } else {
    bg = ''
    textColor = 'text-gray-700'
  }

  return (
    <button
      onClick={() => onClick(date)}
      className={`aspect-square flex items-center justify-center relative jelly select-none
        ${isToday ? 'font-extrabold' : ''}`}
    >
      {/* Inner circle — never touches neighbors */}
      <span className={`
        w-[82%] h-[82%] rounded-full flex flex-col items-center justify-center
        transition-all duration-300 ease-out
        ${bg}
        ${isToday
          ? 'ring-[2.5px] ring-primary-400 ring-offset-2 shadow-md shadow-primary-200/50'
          : ''}
      `}
        style={isPeriod && flowColor ? {
          backgroundColor: flowColor + '28',
          color: flowColor,
        } : undefined}
      >
        <span className={`text-[13px] leading-none ${textColor}`}
          style={isPeriod && flowColor ? { fontWeight: 700 } : undefined}>
          {day}
        </span>

        {/* Dot indicators below number */}
        <span className="flex items-center justify-center gap-[2px] mt-[2px] h-[3px]">
          {isOvulation && !isPeriod && (
            <span className="w-[4px] h-[4px] rounded-full bg-blue-400" />
          )}
          {record?.notes && record.notes.length > 0 && (
            <span className="w-[3px] h-[3px] rounded-full bg-primary-400/50" />
          )}
        </span>
      </span>
    </button>
  )
}
