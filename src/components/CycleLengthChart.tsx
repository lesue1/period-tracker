import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { CycleRecord } from '../types'
import { diffDays } from '../utils/dateUtils'

interface Props {
  records: CycleRecord[]
}

export default function CycleLengthChart({ records }: Props) {
  const data = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate))
    return sorted.slice(1).map((r, i) => ({
      name: r.startDate.slice(5),
      days: diffDays(sorted[i].startDate, r.startDate),
    }))
  }, [records])

  if (data.length < 2) {
    return (
      <div className="card p-6 text-center text-gray-400">
        <p className="text-sm">至少需要 2 个周期才能生成图表</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">周期长度趋势</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip />
          <Line type="monotone" dataKey="days" stroke="#db4d70" strokeWidth={2} dot={{ fill: '#db4d70', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
