import { useEffect, useState } from 'react'
import { useFoodContext } from '../context/FoodContext'
import { fetchActivityEvents, type ImpactEvent } from '../firebase/services/food.service'

export function useImpactEvents(limitCount = 50) {
  const { uid } = useFoodContext()
  const [events, setEvents]     = useState<ImpactEvent[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    setError('')
    fetchActivityEvents(uid, limitCount)
      .then(setEvents)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
      .finally(() => setLoading(false))
  }, [uid, limitCount])

  return { events, isLoading, error }
}
