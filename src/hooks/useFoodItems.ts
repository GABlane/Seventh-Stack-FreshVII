import { useFoodContext } from '../context/FoodContext'

export function useFoodItems() {
  const { items, loading: isLoading } = useFoodContext()
  return { items, isLoading, error: '' }
}
