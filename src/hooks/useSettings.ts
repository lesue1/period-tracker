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
    }).catch(err => {
      console.error('Failed to load settings:', err)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    await saveSettings(partial)
    setSettings(prev => ({ ...prev, ...partial }))
  }, [])

  return { settings, loading, update }
}
