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
  let textColor = 'text-gray-800'
  let ring = ''

  if (isPeriod && !isPredicted) {
    bg = 'bg-red-50'
    textColor = 'text-red-600 font-semibold'
    ring = 'ring-red-200'
  } else if (isPeriod && isPredicted) {
    bg = 'bg-red-50'
    textColor = 'text-red-600 font-semibold'
    ring = 'ring-red-200'
  } else if (isPredicted && !isPeriod) {
    bg = 'bg-pink-50/70'
    textColor = 'text-pink-500'
    ring = 'ring-pink-200'
  } else if (isOvulation) {
    bg = 'bg-blue-50'
    textColor = 'text-blue-600 font-semibold'
    ring = 'ring-blue-200'
  } else if (isFertile && !isOvulation) {
    bg = 'bg-emerald-50/60'
    textColor = 'text-emerald-600'
    ring = 'ring-emerald-200'
  } else {
    bg = 'hover:bg-gray-100/80'
    ring = ''
  }

  return (
    <button
      onClick={() => onClick(date)}
      className={`aspect-square flex flex-col items-center justify-center rounded-full relative
        transition-all duration-150 active:scale-[0.92] ${bg}
        ${isToday ? `ring-[2.5px] ring-primary-400 ring-offset-[3px] font-bold ${ring || ''}` : ''}`}
      style={isPeriod && flowColor ? { backgroundColor: flowColor + '20', color: flowColor } : undefined}
    >
      {/* Subtle dot underlay for marked days */}
      {(isPeriod || isOvulation || isFertile) && !record?.flow && (
        <span className={`absolute inset-1 rounded-full ${isPeriod ? 'bg-current opacity-[0.06]' : isOvulation ? 'bg-current opacity-[0.05]' : 'bg-current opacity-[0.04]'}`} />
      )}

      <span className={`text-sm ${isToday && !flowColor ? 'text-primary-600' : ''} ${textColor}`}
        style={isPeriod && flowColor ? { fontWeight: 600 } : undefined}>
        {day}
      </span>

      {/* Indicators */}
      <div className="flex items-center justify-center gap-[2px] mt-0.5 h-1">
        {isOvulation && !isPeriod && (
          <span className="w-[5px] h-[5px] rounded-full bg-blue-400 ring-1 ring-blue-200" />
        )}
        {record?.notes && record.notes.length > 0 && (
          <span className="w-[3px] h-[3px] rounded-full bg-primary-400/70" />
        )}
      </div>

      {/* Flow intensity bar for period days */}
      {isPeriod && record?.flow && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-[1px]">
          {Array.from({ length: record.flow }).map((_, i) => (
            <span key={i} className="w-[3px] h-[2px] rounded-full bg-current opacity-60" />
          ))}
        </div>
      )}
    </button>
  )
}
