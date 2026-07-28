import Dexie, { type Table } from 'dexie'
import type { CycleRecord, AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

class PeriodTrackerDB extends Dexie {
  cycleRecords!: Table<CycleRecord, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('PeriodTrackerDB')
    this.version(1).stores({
      cycleRecords: 'id, startDate',
      settings: 'key',
    })
  }
}

export const db = new PeriodTrackerDB()

// --- Record CRUD ---

export async function saveRecord(record: CycleRecord): Promise<void> {
  await db.cycleRecords.put(record)
}

export async function getRecords(): Promise<CycleRecord[]> {
  return db.cycleRecords.orderBy('startDate').reverse().toArray()
}

export async function getRecordByDate(date: string): Promise<CycleRecord | undefined> {
  return db.cycleRecords.where('startDate').equals(date).first()
}

export async function deleteRecord(id: string): Promise<void> {
  await db.cycleRecords.delete(id)
}

// --- Settings ---

const SETTINGS_KEY = 'app_settings'

export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.get(SETTINGS_KEY)
  return s ? { ...DEFAULT_SETTINGS, ...s } : DEFAULT_SETTINGS
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...partial, key: SETTINGS_KEY })
}

// --- Data Export/Import ---

export async function exportData(): Promise<void> {
  const records = await getRecords()
  const settings = await getSettings()
  const blob = new Blob([JSON.stringify({ records, settings }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `period-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isValidRecord(r: unknown): r is CycleRecord {
  if (!r || typeof r !== 'object') return false
  const rec = r as Record<string, unknown>
  return typeof rec.id === 'string'
    && typeof rec.startDate === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(rec.startDate)
}

function sanitizeSettings(s: Record<string, unknown>): AppSettings {
  return {
    key: SETTINGS_KEY,
    cycleLength: clamp(Number(s.cycleLength) || 28, 20, 45),
    periodLength: clamp(Number(s.periodLength) || 5, 2, 10),
    lutealPhase: clamp(Number(s.lutealPhase) || 14, 10, 16),
    reminderEnabled: Boolean(s.reminderEnabled),
    reminderTime: String(s.reminderTime || '09:00'),
    tempUnit: s.tempUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data.records || !Array.isArray(data.records)) {
      return { success: false, message: '文件格式不正确，缺少记录数据' }
    }
    if (data.records.length > 5000) {
      return { success: false, message: '记录数量超过上限（5000条）' }
    }
    const validRecords = data.records.filter(isValidRecord)
    const skipped = data.records.length - validRecords.length
    if (validRecords.length === 0) {
      return { success: false, message: '文件中没有有效记录' }
    }
    const settings = data.settings && typeof data.settings === 'object'
      ? sanitizeSettings(data.settings as Record<string, unknown>)
      : undefined

    await db.transaction('rw', db.cycleRecords, db.settings, async () => {
      await db.cycleRecords.clear()
      await db.cycleRecords.bulkPut(validRecords)
      if (settings) {
        await db.settings.put(settings)
      }
    })
    const msg = skipped > 0
      ? `成功导入 ${validRecords.length} 条，跳过 ${skipped} 条无效记录`
      : `成功导入 ${validRecords.length} 条记录`
    return { success: true, message: msg }
  } catch (err) {
    console.error('Import failed:', err)
    return { success: false, message: '文件解析失败，请检查文件格式' }
  }
}
