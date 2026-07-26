import { useRef, useState } from 'react'
import { Download, Upload, Bell, BellOff, AlertCircle } from 'lucide-react'
import type { AppSettings } from '../types'
import { exportData, importData } from '../db/database'

interface Props {
  settings: AppSettings
  onUpdate: (partial: Partial<AppSettings>) => void
}

export default function SettingsPage({ settings, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await importData(file)
    setImportMsg({ ok: result.success, text: result.message })
    setTimeout(() => setImportMsg(null), 3000)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="p-4 space-y-5 pb-28">
      <h2 className="text-xl font-bold text-gray-900 px-1">设置</h2>

      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">周期默认值</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">周期天数</label>
            <input type="number" value={settings.cycleLength} onChange={e => onUpdate({ cycleLength: +e.target.value })}
              min={20} max={45} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">经期天数</label>
            <input type="number" value={settings.periodLength} onChange={e => onUpdate({ periodLength: +e.target.value })}
              min={2} max={10} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">黄体期</label>
            <input type="number" value={settings.lutealPhase} onChange={e => onUpdate({ lutealPhase: +e.target.value })}
              min={10} max={16} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.reminderEnabled ? <Bell className="w-5 h-5 text-primary-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
            <h3 className="text-sm font-semibold text-gray-700">经期提醒</h3>
          </div>
          <button
            onClick={() => onUpdate({ reminderEnabled: !settings.reminderEnabled })}
            className={`relative w-12 h-7 rounded-full transition-colors ${settings.reminderEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.reminderEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            iOS Safari 不支持浏览器推送通知，iPhone 上提醒功能暂不可用。Android 和电脑端可以正常使用。
          </p>
        </div>
        {settings.reminderEnabled && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">提醒时间</label>
            <input type="time" value={settings.reminderTime} onChange={e => onUpdate({ reminderTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">温度单位</h3>
        <div className="flex gap-2">
          {(['celsius', 'fahrenheit'] as const).map(unit => (
            <button key={unit} onClick={() => onUpdate({ tempUnit: unit })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${settings.tempUnit === unit ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {unit === 'celsius' ? '°C 摄氏度' : '°F 华氏度'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">数据管理</h3>
        <div className="flex gap-3">
          <button onClick={exportData}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" /> 导出备份
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4" /> 导入备份
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        {importMsg && (
          <p className={`text-xs ${importMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{importMsg.text}</p>
        )}
      </div>
    </div>
  )
}
