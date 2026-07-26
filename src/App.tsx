import { useState, useEffect } from 'react'
import TabBar from './components/TabBar'
import CalendarPage from './components/CalendarPage'
import StatsPage from './components/StatsPage'
import SettingsPage from './components/SettingsPage'
import { useCycleData } from './hooks/useCycleData'
import { useSettings } from './hooks/useSettings'
import { requestNotificationPermission, checkAndNotify } from './utils/notifications'
import type { TabType } from './types'

export default function App() {
  const [tab, setTab] = useState<TabType>('calendar')
  const { records, save, remove, loading: dataLoading } = useCycleData()
  const { settings, update, loading: settingsLoading } = useSettings()

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
