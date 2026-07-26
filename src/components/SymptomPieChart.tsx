import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CycleRecord } from '../types'
import { SYMPTOM_OPTIONS } from '../types'

interface Props {
  records: CycleRecord[]
}

const COLORS = ['#db4d70', '#f2a9b8', '#f8d0d8', '#e97893', '#c73058', '#a72249', '#8c1f41', '#fbe7eb']

export default function SymptomPieChart({ records }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of records) {
      for (const s of r.symptoms) {
        counts[s] = (counts[s] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: SYMPTOM_OPTIONS.find(o => o.key === key)?.label || key,
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [records])

  if (data.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-400">
        <p className="text-sm">还没有症状记录</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">症状频率</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={70} innerRadius={30} dataKey="value"
            label={({ name, value }) => `${name}(${value})`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
