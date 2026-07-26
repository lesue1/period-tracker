export interface BBTEntry {
  date: string
  temp: number
}

export interface CycleRecord {
  id: string
  startDate: string
  endDate: string | null
  symptoms: string[]
  mood: string[]
  bbt: BBTEntry[]
  notes: string
  flow: number
  cycleTags: string[]
}

export interface AppSettings {
  key?: string
  cycleLength: number
  periodLength: number
  lutealPhase: number
  reminderEnabled: boolean
  reminderTime: string
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
  { level: 1, label: '极少', bg: '#fce7f3', text: '#be123c' },
  { level: 2, label: '较少', bg: '#f9a8d4', text: '#9d174d' },
  { level: 3, label: '正常', bg: '#ec4899', text: '#fff' },
  { level: 4, label: '较多', bg: '#db2777', text: '#fff' },
  { level: 5, label: '极多', bg: '#9d174d', text: '#fff' },
] as const

export const CYCLE_TAG_OPTIONS = [
  { key: 'late_night', label: '熬夜', icon: '🌙' },
  { key: 'travel', label: '出差', icon: '✈️' },
  { key: 'medicine', label: '吃药', icon: '💊' },
  { key: 'stress', label: '压力大', icon: '😫' },
  { key: 'exercise', label: '运动', icon: '🏃' },
  { key: 'diet', label: '饮食变化', icon: '🍜' },
  { key: 'alcohol', label: '饮酒', icon: '🍺' },
  { key: 'illness', label: '生病', icon: '🤒' },
] as const

export const DEFAULT_SETTINGS: AppSettings = {
  cycleLength: 28,
  periodLength: 5,
  lutealPhase: 14,
  reminderEnabled: false,
  reminderTime: '09:00',
  tempUnit: 'celsius',
}
