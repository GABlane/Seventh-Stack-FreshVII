import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../firebase/config'

export type ImpactEvent = {
  id: string
  type: 'ingredient-rescued' | 'leftover-created' | 'meal-prepared' | 'product-added' | 'food-consumed' | 'moved-to-freezer' | 'food-opened'
  quantity: number
  label?: string
  createdAt: string
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return new Date().toISOString()
}

function mapEventType(type: string): ImpactEvent['type'] {
  if (type === 'added') return 'product-added'
  if (type === 'opened') return 'food-opened'
  if (type === 'frozen') return 'moved-to-freezer'
  if (type === 'consumed') return 'food-consumed'
  return 'product-added'
}

export function useImpactEvents() {
  const [events, setEvents] = useState<ImpactEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribeActivity: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeActivity?.()

      if (!user) {
        setEvents([])
        setIsLoading(false)
        setError('')
        return
      }

      const activityQuery = query(collection(db, `profiles/${user.uid}/activity`))
      unsubscribeActivity = onSnapshot(
        activityQuery,
        (snapshot) => {
          const nextEvents = snapshot.docs
            .map((doc) => {
              const data = doc.data()
              const mappedType = mapEventType(String(data.type ?? ''))
              return {
                id: String(data.id ?? doc.id),
                type: mappedType,
                quantity: Number(data.quantityAfter ?? data.quantityChange ?? 0),
                label: data.metadata && typeof data.metadata === 'object' && 'previousLocation' in data.metadata
                  ? `Moved from ${String((data.metadata as Record<string, unknown>).previousLocation ?? 'fridge')} to freezer`
                  : undefined,
                createdAt: toIso(data.createdAt),
              }
            })
            .filter((event) => event.createdAt)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

          setEvents(nextEvents)
          setIsLoading(false)
          setError('')
        },
        (snapshotError) => {
          setEvents([])
          setIsLoading(false)
          setError(snapshotError.message)
        },
      )
    })

    return () => {
      unsubscribeActivity?.()
      unsubscribeAuth()
    }
  }, [])

  return { events, isLoading, error }
}
