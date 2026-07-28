// Shared tooltip for all charts — compact, rounded, flat
export default function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-150 rounded-xl px-3 py-1.5 shadow-lg">
      {label && <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>}
      <div className="flex items-center gap-3">
        {payload.map((entry) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-400">{entry.name}</span>
            <span className="font-semibold">{entry.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
