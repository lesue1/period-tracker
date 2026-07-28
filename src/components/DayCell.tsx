import type { DayMarker } from '../types'
import { FLOW_LEVELS } from '../types'

interface Props {
  marker: DayMarker
  onClick: (date: string) => void
}

export default function DayCell({ marker, onClick }: Props) {
  const { date, isPeriod, isPredicted, isOvulation, isFertile, isToday, record } = marker
  const day = parseInt(date.slice(8), 10)
  const flowColor = record?.flow ? FLOW_LEVELS[record.flow - 1]?.bg : undefined

  let bg = ''
  let textStyle = 'text-gray-600'

  if (isPeriod && !isPredicted) {
    bg = 'bg-red-50'
    textStyle = 'text-red-600 font-semibold'
  } else if (isPredicted && !isPeriod) {
    bg = 'bg-pink-50/60'
    textStyle = 'text-pink-500 font-medium'
  } else if (isPeriod && isPredicted) {
    bg = 'bg-red-50'
    textStyle = 'text-red-600 font-semibold'
  } else if (isOvulation) {
    bg = 'bg-blue-50'
    textStyle = 'text-blue-600 font-semibold'
  } else if (isFertile && !isOvulation) {
    bg = 'bg-emerald-50/50'
    textStyle = 'text-emerald-600 font-medium'
  }

  // Flow intensity dots
  const flowDots = isPeriod && record?.flow
    ? Array.from({ length: record.flow }).map((_, i) => (
        <span key={i} className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
      ))
    : null

  return (
    <button
      onClick={() => onClick(date)}
      className="aspect-square flex items-center justify-center select-none active:opacity-70 transition-opacity duration-150"
    >
      <span className={`
        w-[88%] h-[60%] rounded-xl flex items-center justify-center gap-1 px-1
        transition-all duration-200 ease-out
        ${bg}
        ${isToday ? 'ring-[2.5px] ring-primary-400 ring-offset-2 shadow-sm' : ''}
      `}
        style={isPeriod && flowColor ? {
          backgroundColor: flowColor + '22',
        } : undefined}
      >
        <span className={`text-[13px] leading-none ${textStyle}`}
          style={isPeriod && flowColor ? { color: flowColor, fontWeight: 700 } : undefined}>
          {day}
        </span>

        {/* Indicators on the same row as number */}
        <span className="flex items-center gap-[2px]">
          {isOvulation && !isPeriod && (
            <span className="w-[4px] h-[4px] rounded-full bg-blue-400" />
          )}
          {record?.notes && record.notes.length > 0 && (
            <span className="w-[3px] h-[3px] rounded-full bg-primary-400/60" />
          )}
          {flowDots}
        </span>
      </span>
    </button>
  )
}
