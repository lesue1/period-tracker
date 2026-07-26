export default function LegendRow() {
  return (
    <div className="flex justify-center gap-4 px-4 py-2 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> 经期
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border-2 border-pink-400 bg-pink-50" /> 预测经期
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 排卵日
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-green-200" /> 易孕期
      </span>
    </div>
  )
}
