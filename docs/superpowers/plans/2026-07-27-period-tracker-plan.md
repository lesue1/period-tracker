# Period Tracker App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA period tracker with calendar, symptom/BBT logging, cycle predictions, statistics charts, and push notifications — all local storage, Apple-style UI.

**Architecture:** Single-page React 19 app with Vite, Tailwind CSS, Dexie.js (IndexedDB), Recharts charts. Three tabs (Calendar, Stats, Settings) switched client-side. Service Worker for offline + notifications.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS 3, Dexie.js 4, Recharts 2, Lucide React, vite-plugin-pwa

## Global Constraints

- Zero server calls — all data in IndexedDB via Dexie.js
- iOS Safari 15+, Android Chrome 90+, desktop Chrome/Firefox
- Apple-native visual style: rounded cards, glass effects, pink-white palette
- JS bundle < 200KB gzipped
- Chinese UI text
- No auth, no cloud sync, no dark mode in V0

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Produces: Working dev server on `localhost:5173`, Tailwind CSS compiled, React 19 + TypeScript running

- [ ] **Step 1: Initialize Vite + React + TypeScript project**

```bash
cd c:\Users\陈洪新\OneDrive\桌面\period-tracker
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install dexie recharts lucide-react
npm install -D tailwindcss@3 postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind — write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fdf2f4', 100: '#fbe7eb', 200: '#f8d0d8', 300: '#f2a9b8', 400: '#e97893', 500: '#db4d70', 600: '#c73058', 700: '#a72249', 800: '#8c1f41', 900: '#751d3c', 950: '#410b1c' },
        surface: { 50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0', 400: '#bdbdbd', 500: '#9e9e9e', 600: '#757575' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Write `src/index.css` with Tailwind directives and base styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-gray-900 antialiased;
    -webkit-tap-highlight-color: transparent;
  }
}

@layer utilities {
  .glass {
    @apply bg-white/80 backdrop-blur-xl border border-white/20;
  }
  .card {
    @apply bg-white rounded-2xl shadow-sm border border-gray-100;
  }
}
```

- [ ] **Step 5: Write minimal `src/App.tsx` and `src/main.tsx`**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
// src/App.tsx
function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center py-8 text-primary-500">经期助手</h1>
    </div>
  )
}
export default App
```

- [ ] **Step 6: Update `index.html` — set title and add Inter font**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
    <meta name="theme-color" content="#fdf2f4" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <title>经期助手</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Verify dev server runs**

```bash
npm run dev
```
Open `http://localhost:5173` — should show "经期助手" heading in pink on gray background.

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `CycleRecord`, `AppSettings`, `SymptomOption`, `MoodOption`, `FlowLevel`, `Prediction`, `DayMarker`, `TabType` types

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
export interface BBTEntry {
  date: string // ISO date "2026-07-01"
  temp: number
}

export interface CycleRecord {
  id: string
  startDate: string // ISO date
  endDate: string | null // null = ongoing
  symptoms: string[]
  mood: string[]
  bbt: BBTEntry[]
  notes: string
  flow: number // 1-5
}

export interface AppSettings {
  cycleLength: number   // default 28
  periodLength: number   // default 5
  lutealPhase: number    // default 14
  reminderEnabled: boolean
  reminderTime: string   // "09:00"
  tempUnit: 'celsius' | 'fahrenheit'
}

export interface Prediction {
  date: string
  type: 'period' | 'ovulation' | 'fertile'
  label: string
}

export interface DayMarker {
  date: string
  isPeriod: boolean
  isPredicted: boolean
  isOvulation: boolean
  isFertile: boolean
  isToday: boolean
  record: CycleRecord | null
}

export type TabType = 'calendar' | 'stats' | 'settings'

export const SYMPTOM_OPTIONS = [
  { key: 'cramps', label: '痛经', icon: '🔴' },
  { key: 'headache', label: '头痛', icon: '💢' },
  { key: 'backache', label: '腰酸', icon: '🦴' },
  { key: 'fatigue', label: '疲劳', icon: '😴' },
  { key: 'bloating', label: '腹胀', icon: '🫄' },
  { key: 'acne', label: '长痘', icon: '🔵' },
  { key: 'breastTenderness', label: '胸胀', icon: '💗' },
  { key: 'nausea', label: '恶心', icon: '🤢' },
] as const

export const MOOD_OPTIONS = [
  { key: 'happy', label: '开心', icon: '😊' },
  { key: 'irritable', label: '烦躁', icon: '😤' },
  { key: 'sad', label: '难过', icon: '😢' },
  { key: 'anxious', label: '焦虑', icon: '😰' },
  { key: 'calm', label: '平静', icon: '😌' },
  { key: 'energetic', label: '精力充沛', icon: '⚡' },
] as const

export const FLOW_LEVELS = [
  { level: 1, label: '极少', color: '#fce7f3' },
  { level: 2, label: '较少', color: '#f9a8d4' },
  { level: 3, label: '正常', color: '#ec4899' },
  { level: 4, label: '较多', color: '#db2777' },
  { level: 5, label: '极多', color: '#9d174d' },
] as const

export const DEFAULT_SETTINGS: AppSettings = {
  cycleLength: 28,
  periodLength: 5,
  lutealPhase: 14,
  reminderEnabled: false,
  reminderTime: '09:00',
  tempUnit: 'celsius',
}
```

---

### Task 3: Database Layer (Dexie.js)

**Files:**
- Create: `src/db/database.ts`

**Interfaces:**
- Consumes: `CycleRecord`, `AppSettings`, `DEFAULT_SETTINGS` from `src/types/index.ts`
- Produces: `db` instance, `cycleRecords` table, `settings` table, helper functions `saveRecord()`, `getRecords()`, `deleteRecord()`, `getSettings()`, `saveSettings()`, `exportData()`, `importData()`

- [ ] **Step 1: Write `src/db/database.ts`**

```ts
import Dexie, { type Table } from 'dexie'
import type { CycleRecord, AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

class PeriodTrackerDB extends Dexie {
  cycleRecords!: Table<CycleRecord, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('PeriodTrackerDB')
    this.version(1).stores({
      cycleRecords: 'id, startDate, endDate',
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

export async function getRecordsInRange(from: string, to: string): Promise<CycleRecord[]> {
  return db.cycleRecords
    .where('startDate')
    .between(from, to, true, true)
    .toArray()
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

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...settings, key: SETTINGS_KEY })
}

// --- Data Export/Import ---

export async function exportData(): Promise<string> {
  const records = await getRecords()
  const settings = await getSettings()
  const blob = new Blob([JSON.stringify({ records, settings }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `period-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  return 'ok'
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
```

---

### Task 4: Date Utilities & Cycle Calculator

**Files:**
- Create: `src/utils/dateUtils.ts`, `src/utils/cycleCalculator.ts`

**Interfaces:**
- Consumes: `CycleRecord`, `AppSettings` types
- Produces:
  - `dateUtils.ts`: `todayStr()`, `getDaysInMonth(year, month)`, `getFirstDayOfMonth(year, month)`, `formatMonth(year, month)`, `addMonths(year, month, delta)`, `isoDate(date)`, `diffDays(a, b)`
  - `cycleCalculator.ts`: `calculatePredictions(records, settings)`, `buildDayMarkers(year, month, records, predictions)`, `getAverageCycleLength(records)`, `getAveragePeriodLength(records)`

- [ ] **Step 1: Write `src/utils/dateUtils.ts`**

```ts
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

export function formatMonth(year: number, month: number): string {
  return `${year}年${month + 1}月`
}

export function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export function diffDays(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}
```

- [ ] **Step 2: Write `src/utils/cycleCalculator.ts`**

```ts
import type { CycleRecord, AppSettings, Prediction, DayMarker } from '../types'
import { todayStr, isoDate, diffDays, addDays, getDaysInMonth } from './dateUtils'

/** Average cycle length from past records (sorted by startDate asc). Returns null if < 2 periods. */
export function getAverageCycleLength(records: CycleRecord[]): number | null {
  const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length < 2) return null
  let total = 0, count = 0
  for (let i = 1; i < sorted.length; i++) {
    const d = diffDays(sorted[i - 1].startDate, sorted[i].startDate)
    if (d > 0) { total += d; count++ }
  }
  return count > 0 ? Math.round(total / count) : null
}

export function getAveragePeriodLength(records: CycleRecord[]): number | null {
  const completed = records.filter(r => r.endDate)
  if (completed.length === 0) return null
  let total = 0
  for (const r of completed) {
    total += diffDays(r.startDate, r.endDate!) + 1
  }
  return Math.round(total / completed.length)
}

/** Generate predictions for upcoming cycles (next 3 months) */
export function calculatePredictions(
  records: CycleRecord[],
  settings: AppSettings
): Prediction[] {
  const predictions: Prediction[] = []
  const sorted = [...records].filter(r => r.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length === 0) return predictions

  const avgCycle = getAverageCycleLength(records) ?? settings.cycleLength
  const avgPeriod = getAveragePeriodLength(records) ?? settings.periodLength
  const luteal = settings.lutealPhase

  const lastStart = sorted[sorted.length - 1].startDate
  const today = todayStr()

  // Predict next 6 cycles
  let nextStart = addDays(lastStart, avgCycle)
  for (let i = 0; i < 6; i++) {
    // Period days
    for (let d = 0; d < avgPeriod; d++) {
      const date = addDays(nextStart, d)
      if (date >= today) {
        predictions.push({ date, type: 'period', label: '经期' })
      }
    }
    // Ovulation day
    const ovDay = addDays(nextStart, avgCycle - luteal)
    if (ovDay >= today) {
      predictions.push({ date: ovDay, type: 'ovulation', label: '排卵日' })
    }
    // Fertile window (5 days before ovulation + ovulation day + 1 day after)
    for (let d = -5; d <= 1; d++) {
      const fDay = addDays(ovDay, d)
      if (fDay >= today && fDay !== ovDay) {
        predictions.push({ date: fDay, type: 'fertile', label: '易孕期' })
      }
    }
    nextStart = addDays(nextStart, avgCycle)
  }
  return predictions
}

/** Build the full day-marker map for a calendar month */
export function buildDayMarkers(
  year: number,
  month: number,
  records: CycleRecord[],
  predictions: Prediction[]
): DayMarker[] {
  const daysInMonth = getDaysInMonth(year, month)
  const today = todayStr()
  const markers: DayMarker[] = []

  // Build a set of all period days (recorded + inferred end dates)
  const periodDays = new Set<string>()
  for (const r of records) {
    periodDays.add(r.startDate)
    if (r.endDate) {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        periodDays.add(isoDate(d))
      }
    }
  }

  const predMap = new Map<string, Prediction[]>()
  for (const p of predictions) {
    const arr = predMap.get(p.date) || []
    arr.push(p)
    predMap.set(p.date, arr)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = isoDate(new Date(year, month, day))
    const dayPreds = predMap.get(dateStr) || []
    markers.push({
      date: dateStr,
      isPeriod: periodDays.has(dateStr),
      isPredicted: dayPreds.some(p => p.type === 'period'),
      isOvulation: dayPreds.some(p => p.type === 'ovulation'),
      isFertile: dayPreds.some(p => p.type === 'fertile'),
      isToday: dateStr === today,
      record: records.find(r => r.startDate === dateStr) || null,
    })
  }
  return markers
}
```

---

### Task 5: Data Hooks

**Files:**
- Create: `src/hooks/useCycleData.ts`, `src/hooks/usePredictions.ts`, `src/hooks/useSettings.ts`

**Interfaces:**
- Consumes: Database functions from `src/db/database.ts`, calculator from `src/utils/cycleCalculator.ts`
- Produces: React hooks with live state — `useCycleData()`, `usePredictions(records, settings)`, `useSettings()`

- [ ] **Step 1: Write `src/hooks/useCycleData.ts`**

```ts
import { useState, useEffect, useCallback } from 'react'
import type { CycleRecord } from '../types'
import { getRecords, saveRecord, deleteRecord } from '../db/database'

export function useCycleData() {
  const [records, setRecords] = useState<CycleRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await getRecords()
    setRecords(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const save = useCallback(async (record: CycleRecord) => {
    await saveRecord(record)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await deleteRecord(id)
    await refresh()
  }, [refresh])

  return { records, loading, save, remove, refresh }
}
```

- [ ] **Step 2: Write `src/hooks/usePredictions.ts`**

```ts
import { useMemo } from 'react'
import type { CycleRecord, AppSettings, Prediction, DayMarker } from '../types'
import { calculatePredictions, buildDayMarkers } from '../utils/cycleCalculator'

export function usePredictions(
  records: CycleRecord[],
  settings: AppSettings,
  year: number,
  month: number
) {
  const predictions: Prediction[] = useMemo(
    () => calculatePredictions(records, settings),
    [records, settings]
  )

  const dayMarkers: DayMarker[] = useMemo(
    () => buildDayMarkers(year, month, records, predictions),
    [year, month, records, predictions]
  )

  return { predictions, dayMarkers }
}
```

- [ ] **Step 3: Write `src/hooks/useSettings.ts`**

```ts
import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { getSettings, saveSettings } from '../db/database'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    await saveSettings(partial)
    setSettings(prev => ({ ...prev, ...partial }))
  }, [])

  const reset = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return { settings, loading, update, reset }
}
```

---

### Task 6: Calendar Components — MonthHeader, LegendRow, DayCell

**Files:**
- Create: `src/components/MonthHeader.tsx`, `src/components/LegendRow.tsx`, `src/components/DayCell.tsx`

**Interfaces:**
- Consumes: `DayMarker` type
- MonthHeader produces: `<MonthHeader year={n} month={n} onPrev={()=>{}} onNext={()=>{}} onToday={()=>{}} />`
- DayCell produces: `<DayCell marker={DayMarker} onClick={(date)=>void} />`
- LegendRow produces: `<LegendRow />` (static display)

- [ ] **Step 1: Write `src/components/MonthHeader.tsx`**

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '../utils/dateUtils'

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function MonthHeader({ year, month, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button onClick={onToday} className="text-lg font-semibold text-gray-900 hover:text-primary-500 transition-colors">
        {formatMonth(year, month)}
      </button>
      <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/LegendRow.tsx`**

```tsx
export default function LegendRow() {
  return (
    <div className="flex justify-center gap-6 px-4 py-2 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> 经期
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border border-pink-400 bg-pink-50" /> 预测经期
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 排卵日
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-green-200" /> 易孕期
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/DayCell.tsx`**

```tsx
import { Droplet } from 'lucide-react'
import type { DayMarker } from '../types'
import { FLOW_LEVELS } from '../types'

interface Props {
  marker: DayMarker
  onClick: (date: string) => void
}

export default function DayCell({ marker, onClick }: Props) {
  const { date, isPeriod, isPredicted, isOvulation, isFertile, isToday, record } = marker
  const day = parseInt(date.slice(8), 10)

  if (day <= 0) {
    // Empty cell for padding at start of month
    return <div className="aspect-square" />
  }

  const flowColor = record?.flow ? FLOW_LEVELS[record.flow - 1]?.color : undefined

  return (
    <button
      onClick={() => onClick(date)}
      className={`
        aspect-square flex flex-col items-center justify-center rounded-full relative
        transition-all active:scale-95
        ${isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}
        ${isPeriod && !isPredicted ? 'bg-red-100' : ''}
        ${isPredicted && !isPeriod ? 'bg-pink-50' : ''}
        ${isOvulation ? 'bg-blue-50' : ''}
        ${isFertile && !isOvulation ? 'bg-green-50' : ''}
      `}
      style={isPeriod && flowColor ? { backgroundColor: flowColor } : undefined}
    >
      <span className={`
        text-sm font-medium
        ${isToday ? 'text-primary-600 font-bold' : 'text-gray-800'}
        ${isPeriod && flowColor ? 'text-white text-xs' : ''}
      `}>
        {day}
      </span>
      {/* Indicator dots */}
      <div className="flex gap-0.5 mt-0.5">
        {isOvulation && <span className="w-1 h-1 rounded-full bg-blue-400" />}
        {record?.notes && <Droplet className="w-2.5 h-2.5 text-primary-400" />}
      </div>
    </button>
  )
}
```

---

### Task 7: Calendar Grid

**Files:**
- Create: `src/components/CalendarGrid.tsx`

**Interfaces:**
- Consumes: `DayMarker` type, `DayCell`, `getDaysInMonth`, `getFirstDayOfMonth`
- Produces: `<CalendarGrid dayMarkers={DayMarker[]} onDayClick={(date)=>void} />`

- [ ] **Step 1: Write `src/components/CalendarGrid.tsx`**

```tsx
import DayCell from './DayCell'
import type { DayMarker } from '../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface Props {
  dayMarkers: DayMarker[]
  firstDayOfWeek: number // 0=Sun
  onDayClick: (date: string) => void
}

export default function CalendarGrid({ dayMarkers, firstDayOfWeek, onDayClick }: Props) {
  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-xs font-medium text-gray-400 py-1">
            {w}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Padding cells for first day offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {dayMarkers.map(marker => (
          <DayCell key={marker.date} marker={marker} onClick={onDayClick} />
        ))}
      </div>
    </div>
  )
}
```

---

### Task 8: Symptom Tags Component

**Files:**
- Create: `src/components/SymptomTags.tsx`

**Interfaces:**
- Produces: `<SymptomTags options={[{key,label,icon}]} selected={string[]} onChange={(keys)=>void} />`

- [ ] **Step 1: Write `src/components/SymptomTags.tsx`**

```tsx
interface Option {
  key: string
  label: string
  icon?: string
}

interface Props {
  options: readonly Option[]
  selected: string[]
  onChange: (keys: string[]) => void
  title: string
}

export default function SymptomTags({ options, selected, onChange, title }: Props) {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${selected.includes(opt.key)
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### Task 9: Period Edit Sheet (Bottom Sheet)

**Files:**
- Create: `src/components/PeriodEditSheet.tsx`

**Interfaces:**
- Consumes: `CycleRecord`, `SYMPTOM_OPTIONS`, `MOOD_OPTIONS`, `FLOW_LEVELS` types; `SymptomTags`; `v4 as uuidv4` from uuid
- Produces: `<PeriodEditSheet date={string} record={CycleRecord|null} onSave={fn} onDelete={fn} onClose={fn} />`

- [ ] **Step 1: Install uuid**

```bash
npm install uuid && npm install -D @types/uuid
```

- [ ] **Step 2: Write `src/components/PeriodEditSheet.tsx`**

```tsx
import { useState, useEffect } from 'react'
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
    if (isNaN(temp)) return
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

  const handleDelete = () => {
    if (record?.id) {
      onDelete(record.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl pt-3 pb-2 px-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {record ? '编辑记录' : '添加记录'}
            </h3>
            <div className="flex gap-2">
              {record && (
                <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
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
          {/* Date */}
          <p className="text-sm text-gray-500">日期: {date}</p>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经期开始</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经期结束（可选）</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>

          {/* Flow */}
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

          {/* Symptoms */}
          <SymptomTags options={SYMPTOM_OPTIONS} selected={symptoms} onChange={setSymptoms} title="症状" />

          {/* Mood */}
          <SymptomTags options={MOOD_OPTIONS} selected={mood} onChange={setMood} title="情绪" />

          {/* BBT */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="记录一下今天的感受..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
          </div>
        </div>

        {/* Save button */}
        <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 rounded-b-3xl">
          <button onClick={handleSave}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold text-base hover:bg-primary-600 active:scale-[0.98] transition-all">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 10: Calendar Page (Assembly)

**Files:**
- Create: `src/components/CalendarPage.tsx`

**Interfaces:**
- Consumes: All calendar sub-components, hooks, types
- Produces: `<CalendarPage records={CycleRecord[]} settings={AppSettings} onSave={fn} onDelete={fn} />`

- [ ] **Step 1: Write `src/components/CalendarPage.tsx`**

```tsx
import { useState, useCallback } from 'react'
import MonthHeader from './MonthHeader'
import CalendarGrid from './CalendarGrid'
import LegendRow from './LegendRow'
import PeriodEditSheet from './PeriodEditSheet'
import { usePredictions } from '../hooks/usePredictions'
import { getFirstDayOfMonth, addMonths, todayStr } from '../utils/dateUtils'
import type { CycleRecord, AppSettings } from '../types'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
  onSave: (record: CycleRecord) => void
  onDelete: (id: string) => void
}

export default function CalendarPage({ records, settings, onSave, onDelete }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { dayMarkers } = usePredictions(records, settings, year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const goPrev = useCallback(() => {
    const prev = addMonths(year, month, -1)
    setYear(prev.year); setMonth(prev.month)
  }, [year, month])

  const goNext = useCallback(() => {
    const next = addMonths(year, month, 1)
    setYear(next.year); setMonth(next.month)
  }, [year, month])

  const goToday = useCallback(() => {
    const t = new Date()
    setYear(t.getFullYear()); setMonth(t.getMonth())
  }, [])

  const selectedRecord = selectedDate
    ? records.find(r => r.startDate === selectedDate) || null
    : null

  return (
    <div className="flex flex-col h-full">
      <MonthHeader year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      <CalendarGrid dayMarkers={dayMarkers} firstDayOfWeek={firstDay} onDayClick={setSelectedDate} />
      <LegendRow />

      {selectedDate && (
        <PeriodEditSheet
          date={selectedDate}
          record={selectedRecord}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
```

---

### Task 11: Charts — Cycle Length, Symptom Pie, BBT

**Files:**
- Create: `src/components/CycleLengthChart.tsx`, `src/components/SymptomPieChart.tsx`, `src/components/BBTChart.tsx`

**Interfaces:**
- Consumes: `CycleRecord` type, Recharts
- Each produces a standalone chart component

- [ ] **Step 1: Write `src/components/CycleLengthChart.tsx`**

```tsx
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
      name: r.startDate.slice(5), // MM-DD
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
```

- [ ] **Step 2: Write `src/components/SymptomPieChart.tsx`**

```tsx
import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
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
          <Pie data={data} cx="50%" cy="50%" outerRadius={70} innerRadius={30} dataKey="value" label={({ name, value }) => `${name}(${value})`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/BBTChart.tsx`**

```tsx
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { CycleRecord, AppSettings } from '../types'

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
          <Tooltip />
          <ReferenceLine y={37} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '37°C', position: 'right', fontSize: 10 }} />
          <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

### Task 12: Stats Page

**Files:**
- Create: `src/components/StatsPage.tsx`

**Interfaces:**
- Consumes: Chart components, `CycleRecord`, `AppSettings` types
- Produces: `<StatsPage records={CycleRecord[]} settings={AppSettings} />`

- [ ] **Step 1: Write `src/components/StatsPage.tsx`**

```tsx
import { useMemo } from 'react'
import type { CycleRecord, AppSettings } from '../types'
import { getAverageCycleLength, getAveragePeriodLength } from '../utils/cycleCalculator'
import CycleLengthChart from './CycleLengthChart'
import SymptomPieChart from './SymptomPieChart'
import BBTChart from './BBTChart'

interface Props {
  records: CycleRecord[]
  settings: AppSettings
}

export default function StatsPage({ records, settings }: Props) {
  const stats = useMemo(() => {
    const avgCycle = getAverageCycleLength(records)
    const avgPeriod = getAveragePeriodLength(records)
    return {
      totalRecords: records.length,
      avgCycle: avgCycle,
      avgPeriod: avgPeriod,
    }
  }, [records])

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900 px-1">统计</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.totalRecords}</p>
          <p className="text-xs text-gray-500 mt-1">总记录数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.avgCycle ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">平均周期(天)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats.avgPeriod ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">平均经期(天)</p>
        </div>
      </div>

      <CycleLengthChart records={records} />
      <SymptomPieChart records={records} />
      <BBTChart records={records} settings={settings} />
    </div>
  )
}
```

---

### Task 13: Settings Page

**Files:**
- Create: `src/components/SettingsPage.tsx`

**Interfaces:**
- Consumes: `AppSettings` type, `exportData`, `importData` from db
- Produces: `<SettingsPage settings={AppSettings} onUpdate={fn} />`

- [ ] **Step 1: Write `src/components/SettingsPage.tsx`**

```tsx
import { useRef, useState } from 'react'
import { Download, Upload, Bell, BellOff } from 'lucide-react'
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
    <div className="p-4 space-y-5 pb-24">
      <h2 className="text-xl font-bold text-gray-900 px-1">设置</h2>

      {/* Cycle defaults */}
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

      {/* Reminder */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.reminderEnabled ? <Bell className="w-5 h-5 text-primary-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
            <h3 className="text-sm font-semibold text-gray-700">经期提醒</h3>
          </div>
          <button
            onClick={() => onUpdate({ reminderEnabled: !settings.reminderEnabled })}
            className={`w-12 h-7 rounded-full transition-colors relative ${settings.reminderEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.reminderEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ left: 0 }} />
          </button>
        </div>
        {settings.reminderEnabled && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">提醒时间</label>
            <input type="time" value={settings.reminderTime} onChange={e => onUpdate({ reminderTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        )}
      </div>

      {/* Temperature unit */}
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

      {/* Data management */}
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
```

---

### Task 14: Tab Bar & App Shell

**Files:**
- Create: `src/components/TabBar.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: All page components, hooks from db, `TabType`
- Produces: Complete working app shell with tab navigation

- [ ] **Step 1: Write `src/components/TabBar.tsx`**

```tsx
import { Calendar, BarChart3, Settings } from 'lucide-react'
import type { TabType } from '../types'

interface Props {
  active: TabType
  onChange: (tab: TabType) => void
}

const tabs: { key: TabType; label: string; Icon: typeof Calendar }[] = [
  { key: 'calendar', label: '日历', Icon: Calendar },
  { key: 'stats', label: '统计', Icon: BarChart3 },
  { key: 'settings', label: '设置', Icon: Settings },
]

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 w-full max-w-lg glass rounded-t-3xl border-t border-gray-100">
      <div className="flex">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center py-2 pt-3 transition-colors ${active === key ? 'text-primary-500' : 'text-gray-400'}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </button>
        ))}
      </div>
      {/* Safe area padding for iPhones */}
      <div className="h-5" />
    </nav>
  )
}
```

- [ ] **Step 2: Rewrite `src/App.tsx` — full app shell**

```tsx
import { useState } from 'react'
import TabBar from './components/TabBar'
import CalendarPage from './components/CalendarPage'
import StatsPage from './components/StatsPage'
import SettingsPage from './components/SettingsPage'
import { useCycleData } from './hooks/useCycleData'
import { useSettings } from './hooks/useSettings'
import type { TabType } from './types'

export default function App() {
  const [tab, setTab] = useState<TabType>('calendar')
  const { records, save, remove, loading: dataLoading } = useCycleData()
  const { settings, update, loading: settingsLoading } = useSettings()

  if (dataLoading || settingsLoading) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {tab === 'calendar' && (
        <CalendarPage records={records} settings={settings} onSave={save} onDelete={remove} />
      )}
      {tab === 'stats' && (
        <StatsPage records={records} settings={settings} />
      )}
      {tab === 'settings' && (
        <SettingsPage settings={settings} onUpdate={update} />
      )}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
```

---

### Task 15: PWA Configuration & Notifications

**Files:**
- Modify: `vite.config.ts`
- Create: `public/manifest.json`

**Interfaces:**
- Consumes: Vite PWA plugin
- Produces: Installable PWA with offline support and notification Service Worker

- [ ] **Step 1: Write `public/manifest.json`**

```json
{
  "name": "经期助手",
  "short_name": "经期助手",
  "description": "私密的经期记录与预测工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fdf2f4",
  "theme_color": "#fdf2f4",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Generate placeholder icons via Node script**

Create directories and generate a simple SVG-based icon. For now, use a solid pink circle as placeholder:

```bash
mkdir public\icons
```

Since we can't easily generate PNGs in the task, we'll note: create a 192×192 and 512×512 pink rounded-square icon. For the plan, we can generate a simple SVG-based icon with a script. But this is fine to handle at build time.

- [ ] **Step 3: Configure Vite PWA — update `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '经期助手',
        short_name: '经期助手',
        description: '私密的经期记录与预测工具',
        theme_color: '#fdf2f4',
        background_color: '#fdf2f4',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Create notification utility — `src/utils/notifications.ts`**

```ts
import type { AppSettings, CycleRecord } from '../types'
import { calculatePredictions } from './cycleCalculator'
import { todayStr, addDays } from './dateUtils'

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false)
  if (Notification.permission === 'granted') return Promise.resolve(true)
  if (Notification.permission === 'denied') return Promise.resolve(false)
  return Notification.requestPermission().then(p => p === 'granted')
}

export function checkAndNotify(
  records: CycleRecord[],
  settings: AppSettings
): void {
  if (!settings.reminderEnabled) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const predictions = calculatePredictions(records, settings)
  const tomorrow = addDays(todayStr(), 1)
  const tomorrowPeriod = predictions.find(p => p.date === tomorrow && p.type === 'period')

  if (tomorrowPeriod) {
    // Check if we already notified today (simple localStorage flag)
    const lastNotified = localStorage.getItem('period_tracker_last_notified')
    if (lastNotified === tomorrow) return // already notified for tomorrow

    new Notification('经期助手', {
      body: '预计明天是经期第一天，提前做好准备哦 🌸',
      icon: '/icons/icon-192.png',
      tag: 'period-reminder',
    })
    localStorage.setItem('period_tracker_last_notified', tomorrow)
  }
}
```

---

### Task 16: Final Integration & Polish

**Files:**
- Modify: `src/main.tsx` (add notification init)
- Modify: `src/App.tsx` (add notification check on mount)

- [ ] **Step 1: Update `src/App.tsx` — add notification init**

Add this import and useEffect to App.tsx:

```tsx
import { useEffect } from 'react'
import { requestNotificationPermission, checkAndNotify } from './utils/notifications'

// Inside App component, add:
useEffect(() => {
  requestNotificationPermission()
}, [])

useEffect(() => {
  if (settings.reminderEnabled) {
    checkAndNotify(records, settings)
    const interval = setInterval(() => checkAndNotify(records, settings), 60 * 60 * 1000)
    return () => clearInterval(interval)
  }
}, [records, settings])
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Check output:
- `dist/` should contain `index.html`, JS/CSS bundles, `manifest.json`, service worker
- JS bundle should be < 200KB gzipped

- [ ] **Step 3: Manual test checklist**

- [ ] Calendar displays current month with today highlighted
- [ ] Navigate months with ← → arrows
- [ ] Click "2026年7月" jumps to today
- [ ] Click a date → edit sheet slides up
- [ ] Mark period start/end, symptoms, mood, flow, BBT, notes
- [ ] Save → calendar shows colored indicators
- [ ] Period days show red, predictions show pink ring, ovulation shows blue dot
- [ ] Stats tab shows summary cards + 3 charts
- [ ] Settings: change cycle length, toggle reminder, change temp unit
- [ ] Export → downloads JSON file
- [ ] Import → loads JSON file successfully
- [ ] PWA: can be installed to home screen
- [ ] Offline: app still loads and works
- [ ] Notification permission prompt on first visit
