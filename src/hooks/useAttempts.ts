import { useSyncExternalStore } from 'react'
import { getAttempts, isStorageAvailable, subscribe } from '../storage/attempts'

export const useAttempts = () => useSyncExternalStore(subscribe, getAttempts, getAttempts)

export const useStorageAvailable = () =>
  useSyncExternalStore(subscribe, isStorageAvailable, () => true)
