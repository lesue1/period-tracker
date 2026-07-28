import { useState, useEffect, useCallback } from 'react'
import { X, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { CycleRecord, BBTEntry } from '../types'
import { SYMPTOM_OPTIONS, MOOD_OPTIONS, FLOW_LEVELS, CYCLE_TAG_OPTIONS } from '../types'
import SymptomTags from './SymptomTags'
import { todayStr, addDays } from '../utils/dateUtils'

interface Props {
  date: string
  record: CycleRecord | null
  defaultPeriodLength: number
  onSave: (record: CycleRecord) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function PeriodEditSheet({ date, record, defaultPeriodLength, onSave, onDelete, onClose }: Props) {
  const [startDate, setStartDate] = useState(record?.startDate || date)
  const [endDate, setEndDate] = useState(record?.endDate || '')
  const [flow, setFlow] = useState(record?.flow || 3)
  const [symptoms, setSymptoms] = useState<string[]>(record?.symptoms || [])
  const [mood, setMood] = useState<string[]>(record?.mood || [])
  const [cycleTags, setCycleTags] = useState<string[]>(record?.cycleTags || [])
  const [bbt, setBbt] = useState<BBTEntry[]>(record?.bbt || [])
  const [bbtInput, setBbtInput] = useState('')
  const [notes, setNotes] = useState(record?.notes || '')
  const [visible, setVisible] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const handleStartChange = useCallback((val: string) => {
    const oldStart = startDate
    setStartDate(val)
    if (!endDate || oldStart === endDate) {
      setEndDate(addDays(val, defaultPeriodLength - 1))
    } else if (oldStart) {
      const delta = Math.round((new Date(val + 'T00:00:00').getTime() - new Date(oldStart + 'T00:00:00').getTime()) / 86400000)
      setEndDate(addDays(endDate, delta))
    }
  }, [startDate, endDate, defaultPeriodLength])

  const handleSave = () => {
    onSave({
      id: record?.id || uuidv4(),
      startDate,
      endDate: endDate || null,
      symptoms, mood, cycleTags, bbt, notes, flow,
    })
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300
        ${visible ? 'bg-black/25 backdrop-blur-[2px]' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-t-[24px] max-h-[80vh] overflow-y-auto no-scrollbar
          transition-transform duration-350 ${visible ? 'animate-slide-up' : 'translate-y-full'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.08)', WebkitTransform: 'translateZ(0)', willChange: 'transform' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Compact header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-[24px] z-10 pt-3 pb-1.5 px-4 border-b border-gray-50">
          <div className="w-8 h-1 bg-gray-250 bg-gray-200 rounded-full mx-auto mb-2.5" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-900">
              {fmtDate(date)} · {record ? '编辑' : '新记录'}
            </span>
            <div className="flex gap-0.5">
              {record && (
                <button onClick={() => { onDelete(record.id); onClose() }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Dates + Flow in one compact row */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-0.5">开始</label>
                <input type="date" value={startDate} onChange={e => handleStartChange(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium
                    focus:outline-none focus:border-primary-300 bg-gray-50/50" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-0.5">结束</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium
                    focus:outline-none focus:border-primary-300 bg-gray-50/50" />
              </div>
            </div>
          </div>

          {/* Flow — compact row */}
          <div className="flex gap-1">
            {FLOW_LEVELS.map(f => (
              <button
                key={f.level}
                type="button"
                onClick={() => setFlow(f.level)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors duration-200"
                style={{
                  backgroundColor: flow === f.level ? f.bg : '#f5f5f4',
                  color: flow === f.level ? f.text : '#a8a29e',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Symptoms */}
          <SymptomTags options={SYMPTOM_OPTIONS} selected={symptoms} onChange={setSymptoms} title="症状" />

          {/* Mood */}
          <SymptomTags options={MOOD_OPTIONS} selected={mood} onChange={setMood} title="情绪" />

          {/* Cycle Tags */}
          <SymptomTags options={CYCLE_TAG_OPTIONS} selected={cycleTags} onChange={setCycleTags} title="周期因素" />

          {/* BBT + Notes in one row */}
          <div className="flex gap-2">
            <div className="w-[140px] shrink-0">
              <div className="flex gap-1 mb-1">
                <input type="number" value={bbtInput} onChange={e => setBbtInput(e.target.value)}
                  placeholder="36.5" step="0.01" min="35" max="42"
                  className="flex-1 w-0 px-2 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono
                    focus:outline-none focus:border-primary-300 bg-gray-50/50" />
                <button type="button" onClick={() => {
                  const temp = parseFloat(bbtInput)
                  if (!isNaN(temp) && temp >= 35 && temp <= 42) {
                    setBbt([...bbt, { date: todayStr(), temp }])
                    setBbtInput('')
                  }
                }}
                  className="px-2 py-1.5 bg-primary-500 text-white rounded-lg text-[10px] font-semibold
                    hover:bg-primary-600 active:scale-95 transition-all">
                  +
                </button>
              </div>
              {bbt.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] py-0.5 px-1.5 bg-gray-50 rounded-md mb-0.5">
                  <span className="text-gray-500">{entry.date.slice(5)}</span>
                  <span className="font-mono font-semibold">{entry.temp}°</span>
                  <button onClick={() => setBbt(bbt.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="备注…"
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] leading-relaxed
                focus:outline-none focus:border-primary-300 bg-gray-50/50 resize-none" />
          </div>
        </div>

        {/* Save */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-gray-50 safe-bottom">
          <button onClick={handleSave}
            className="w-full py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-[13px]
              hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
