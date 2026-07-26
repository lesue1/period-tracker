import { useRef, useState } from 'react'
import { Download, Upload, Bell, BellOff, AlertCircle, Thermometer, Database } from 'lucide-react'
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
    <div className="p-4 space-y-4 pb-28">
      <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight px-1">设置</h2>

      {/* Cycle defaults */}
      <div className="card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">周期参数</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5">周期天数</label>
            <input type="number" value={settings.cycleLength} onChange={e => onUpdate({ cycleLength: +e.target.value })}
              min={20} max={45}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-center
                focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5">经期天数</label>
            <input type="number" value={settings.periodLength} onChange={e => onUpdate({ periodLength: +e.target.value })}
              min={2} max={10}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-center
                focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5">黄体期</label>
            <input type="number" value={settings.lutealPhase} onChange={e => onUpdate({ lutealPhase: +e.target.value })}
              min={10} max={16}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-center
                focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${settings.reminderEnabled ? 'bg-primary-50' : 'bg-gray-100'}`}>
              {settings.reminderEnabled
                ? <Bell className="w-4 h-4 text-primary-500" strokeWidth={2} />
                : <BellOff className="w-4 h-4 text-gray-400" strokeWidth={2} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">经期提醒</h3>
              <p className="text-[11px] text-gray-400">{settings.reminderEnabled ? '已开启' : '已关闭'}</p>
            </div>
          </div>
          <button
            onClick={() => onUpdate({ reminderEnabled: !settings.reminderEnabled })}
            className={`relative w-[50px] h-[30px] rounded-full transition-all duration-300
              ${settings.reminderEnabled ? 'bg-primary-500' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-[2px] w-[26px] h-[26px] bg-white rounded-full shadow-md
              transition-all duration-300 ease-out
              ${settings.reminderEnabled ? 'left-[22px]' : 'left-[2px]'}`}
            />
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 bg-amber-50/70 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-[11px] text-amber-600/80 leading-relaxed">
            iOS Safari 不支持浏览器推送通知，iPhone 上提醒暂不可用
          </p>
        </div>
        {settings.reminderEnabled && (
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5">提醒时间</label>
            <input type="time" value={settings.reminderTime} onChange={e => onUpdate({ reminderTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                focus:outline-none focus:ring-0 focus:border-primary-300 bg-gray-50/50 transition-colors" />
          </div>
        )}
      </div>

      {/* Temp unit */}
      <div className="card p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <Thermometer className="w-4 h-4 text-orange-500" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">温度单位</h3>
          </div>
        </div>
        <div className="flex gap-2">
          {(['celsius', 'fahrenheit'] as const).map(unit => (
            <button key={unit} onClick={() => onUpdate({ tempUnit: unit })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${settings.tempUnit === unit
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200/80'}`}>
              {unit === 'celsius' ? '°C 摄氏度' : '°F 华氏度'}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Database className="w-4 h-4 text-gray-500" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">数据管理</h3>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={exportData}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl
              text-sm font-semibold hover:bg-gray-200/80 active:scale-[0.98] transition-all duration-200">
            <Download className="w-4 h-4" strokeWidth={2} /> 导出
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl
              text-sm font-semibold hover:bg-gray-200/80 active:scale-[0.98] transition-all duration-200">
            <Upload className="w-4 h-4" strokeWidth={2} /> 导入
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        {importMsg && (
          <p className={`text-xs font-medium ${importMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
            {importMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}
