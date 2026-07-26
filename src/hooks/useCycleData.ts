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
