import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '../utils/dateUtils'

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function MonthHeader({ year, month, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button onClick={onToday} className="text-lg font-semibold text-gray-900 hover:text-primary-500 transition-colors">
        {formatMonth(year, month)}
      </button>
      <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  )
}
