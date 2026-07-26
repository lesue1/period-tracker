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

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data.records || !Array.isArray(data.records)) {
      return { success: false, message: '文件格式不正确，缺少记录数据' }
    }
    await db.transaction('rw', db.cycleRecords, db.settings, async () => {
      await db.cycleRecords.clear()
      await db.cycleRecords.bulkPut(data.records)
      if (data.settings) {
        await db.settings.put({ ...data.settings, key: SETTINGS_KEY })
      }
    })
    return { success: true, message: `成功导入 ${data.records.length} 条记录` }
  } catch {
    return { success: false, message: '文件解析失败，请检查文件格式' }
  }
}
