import { useState, useEffect } from 'react'
import { X, Trash2, Droplets, Thermometer } from 'lucide-react'
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

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
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
  const [visible, setVisible] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const addBBT = () => {
    const temp = parseFloat(bbtInput)
    if (isNaN(temp) || temp < 35 || temp > 42) return
    setBbt([...bbt, { date: todayStr(), temp }])
    setBbtInput('')
  }

  const removeBBT = (idx: number) => setBbt(bbt.filter((_, i) => i !== idx))

  const handleSave = () => {
    onSave({
      id: record?.id || uuidv4(),
      startDate,
      endDate: endDate || null,
      symptoms, mood, bbt, notes, flow,
    })
    onClose()
  }

  const handleBackdrop = () => onClose()

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300
        ${visible ? 'bg-black/25 backdrop-blur-[2px]' : 'bg-transparent'}`}
      onClick={handleBackdrop}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-t-[28px] max-h-[88vh] overflow-y-auto no-scrollbar
          transition-transform duration-350 ${visible ? 'animate-slide-up' : 'translate-y-full'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-[28px] z-10 pt-4 pb-2 px-5">
          <div className="w-9 h-1 bg-gray-250 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {record ? '编辑记录' : '添加记录'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateLabel(date)}</p>
            </div>
            <div className="flex gap-1">
              {record && (
                <button
                  onClick={() => { onDelete(record.id); onClose() }}
                  className="p-2.5 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-[18px] h-[18px]" />
                </button>
              )}
              <button onClick={handleBackdrop} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 space-y-6">
          {/* Dates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">日期</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5">开始</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-150 border-gray-200 text-sm font-medium
                    focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5">结束 <span className="text-gray-300">可选</span></label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-150 border-gray-200 text-sm font-medium
                    focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
              </div>
            </div>
          </div>

          {/* Flow */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <Droplets className="w-3 h-3 inline mr-1" /> 流量
            </h4>
            <div className="flex gap-1.5">
              {FLOW_LEVELS.map(f => (
                <button
                  key={f.level}
                  type="button"
                  onClick={() => setFlow(f.level)}
                  className="flex-1 py-3 rounded-2xl text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: flow === f.level ? f.color : '#f5f5f4',
                    color: flow === f.level ? (f.level >= 4 ? '#fff' : f.color) : '#a8a29e',
                    transform: flow === f.level ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Symptoms */}
          <SymptomTags options={SYMPTOM_OPTIONS} selected={symptoms} onChange={setSymptoms} title="症状" />

          {/* Mood */}
          <SymptomTags options={MOOD_OPTIONS} selected={mood} onChange={setMood} title="情绪" />

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* BBT */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <Thermometer className="w-3 h-3 inline mr-1" /> 基础体温
            </h4>
            <div className="flex gap-2 mb-3">
              <input type="number" value={bbtInput} onChange={e => setBbtInput(e.target.value)}
                placeholder="36.50" step="0.01" min="35" max="42"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-mono
                  focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
              <button type="button" onClick={addBBT}
                className="px-5 py-2.5 bg-primary-500 text-white rounded-2xl text-sm font-semibold
                  hover:bg-primary-600 active:scale-95 transition-all duration-200">
                添加
              </button>
            </div>
            {bbt.length > 0 && (
              <div className="space-y-1">
                {bbt.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium text-xs">{entry.date}</span>
                    <span className="font-mono font-semibold text-gray-800">{entry.temp}°</span>
                    <button onClick={() => removeBBT(i)}
                      className="text-[11px] text-gray-400 hover:text-red-400 font-medium transition-colors">删除</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">备注</h4>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="记录一下今天的感受…"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm leading-relaxed
                focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 resize-none transition-colors" />
          </div>
        </div>

        {/* Save */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm px-5 py-4 border-t border-gray-50 safe-bottom">
          <button onClick={handleSave}
            className="w-full py-3.5 bg-primary-500 text-white rounded-2xl font-bold text-[15px]
              hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary-500/20">
            保存记录
          </button>
        </div>
      </div>
    </div>
  )
}
