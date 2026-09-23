import { useEffect, useState } from 'react'
import { auth } from '../firebase/config'
import { subscribeImpactEvents, type ImpactEvent } from '../firebase/services/food.service'

export function useImpactEvents() {
  const [events, setEvents] = useState<ImpactEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    const stopAuthListener = auth.onAuthStateChanged((user) => {
      unsubscribe?.()
      setIsLoading(true)
      setError('')
      if (!user) {
        setEvents([])
        setIsLoading(false)
        return
      }
      try {
        unsubscribe = subscribeImpactEvents((nextEvents) => {
          setEvents(nextEvents)
          setIsLoading(false)
        }, (snapshotError) => {
          setError(snapshotError.message)
          setIsLoading(false)
        })
      } catch (setupError) {
        setError(setupError instanceof Error ? setupError.message : 'Unable to load impact metrics.')
        setIsLoading(false)
      }
    })
    return () => {
      unsubscribe?.()
      stopAuthListener()
    }
  }, [])

  return { events, isLoading, error }
}
