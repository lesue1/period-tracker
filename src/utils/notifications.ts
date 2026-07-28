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
    const lastNotified = localStorage.getItem('pt_last_notified')
    if (lastNotified === tomorrow) return

    try {
      new Notification('经期助手', {
        body: '预计明天是经期第一天，提前做好准备哦 🌸',
        icon: '/icons/icon-192.png',
        tag: 'period-reminder',
      })
      localStorage.setItem('pt_last_notified', tomorrow)
    } catch {
      // Browser blocked notification or not supported
    }
  }
}
