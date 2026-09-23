import { useEffect, useState } from 'react'
import type { FoodItem } from '../data/mockData'
import { auth } from '../firebase/config'
import { subscribeFoodItems } from '../firebase/services/food.service'

export function useFoodItems() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    const stopAuthListener = auth.onAuthStateChanged((user) => {
      unsubscribe?.()
      setIsLoading(true)
      setError('')
      if (!user) {
        setItems([])
        setIsLoading(false)
        return
      }
      try {
        unsubscribe = subscribeFoodItems((nextItems) => {
          setItems(nextItems)
          setIsLoading(false)
        }, (snapshotError) => {
          setError(snapshotError.message)
          setIsLoading(false)
        })
      } catch (setupError) {
        setError(setupError instanceof Error ? setupError.message : 'Unable to load food.')
        setIsLoading(false)
      }
    })
    return () => {
      unsubscribe?.()
      stopAuthListener()
    }
  }, [])

  return { items, isLoading, error }
}
