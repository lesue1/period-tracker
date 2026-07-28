import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { CycleRecord, AppSettings } from '../types'
import ChartTooltip from './ChartTooltip'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
}

function toCelsius(f: number): number {
  return Math.round(((f - 32) * 5 / 9) * 100) / 100
}

export default function BBTChart({ records, settings }: Props) {
  const data = useMemo(() => {
    const entries: { date: string; temp: number }[] = []
    for (const r of records) {
      for (const b of r.bbt) {
        const temp = settings.tempUnit === 'fahrenheit' ? toCelsius(b.temp) : b.temp
        entries.push({ date: b.date.slice(5), temp })
      }
    }
    return entries.sort((a, b) => a.date.localeCompare(b.date))
  }, [records, settings.tempUnit])

  if (data.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-400">
        <p className="text-sm">还没有基础体温记录</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">基础体温 (°C)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
          <YAxis domain={[35.5, 38]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={37} stroke="#f59e0b" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
