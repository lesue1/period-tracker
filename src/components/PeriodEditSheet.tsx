import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { CycleRecord, BBTEntry } from '../types'
import { SYMPTOM_OPTIONS, MOOD_OPTIONS, FLOW_LEVELS } from '../types'
import SymptomTags from './SymptomTags'
import { todayStr } from '../utils/dateUtils'

interface Props {
  date: string
  record: CycleRecord | null
  onSave: (record: CycleRecord) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function PeriodEditSheet({ date, record, onSave, onDelete, onClose }: Props) {
  const [startDate, setStartDate] = useState(record?.startDate || date)
  const [endDate, setEndDate] = useState(record?.endDate || '')
  const [flow, setFlow] = useState(record?.flow || 3)
  const [symptoms, setSymptoms] = useState<string[]>(record?.symptoms || [])
  const [mood, setMood] = useState<string[]>(record?.mood || [])
  const [bbt, setBbt] = useState<BBTEntry[]>(record?.bbt || [])
  const [bbtInput, setBbtInput] = useState('')
  const [notes, setNotes] = useState(record?.notes || '')

  const addBBT = () => {
    const temp = parseFloat(bbtInput)
    if (isNaN(temp) || temp < 35 || temp > 42) return
    setBbt([...bbt, { date: todayStr(), temp }])
    setBbtInput('')
  }

  const removeBBT = (idx: number) => {
    setBbt(bbt.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    const newRecord: CycleRecord = {
      id: record?.id || uuidv4(),
      startDate,
      endDate: endDate || null,
      symptoms,
      mood,
      bbt,
      notes,
      flow,
    }
    onSave(newRecord)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl pt-3 pb-2 px-5 border-b border-gray-100 z-10">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{date} {record ? '编辑' : '添加记录'}</h3>
            <div className="flex gap-2">
              {record && (
                <button onClick={() => { onDelete(record.id); onClose() }} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经期开始</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经期结束（可选）</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">流量强度</label>
            <div className="flex gap-2">
              {FLOW_LEVELS.map(f => (
                <button
                  key={f.level}
                  type="button"
                  onClick={() => setFlow(f.level)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: flow === f.level ? f.color : '#f3f4f6',
                    color: flow === f.level ? (f.level >= 4 ? '#fff' : '#374151') : '#9ca3af',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <SymptomTags options={SYMPTOM_OPTIONS} selected={symptoms} onChange={setSymptoms} title="症状" />
          <SymptomTags options={MOOD_OPTIONS} selected={mood} onChange={setMood} title="情绪" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">基础体温</label>
            <div className="flex gap-2 mb-2">
              <input type="number" value={bbtInput} onChange={e => setBbtInput(e.target.value)}
                placeholder="36.5" step="0.01" min="35" max="42"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              <button type="button" onClick={addBBT}
                className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                添加
              </button>
            </div>
            {bbt.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm text-gray-600 py-1 px-2">
                <span>{entry.date} — {entry.temp}°</span>
                <button onClick={() => removeBBT(i)} className="text-red-400 text-xs">删除</button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="记录一下今天的感受..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 rounded-b-3xl safe-bottom">
          <button onClick={handleSave}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold text-base hover:bg-primary-600 active:scale-[0.98] transition-all">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
