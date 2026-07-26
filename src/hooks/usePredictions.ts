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
