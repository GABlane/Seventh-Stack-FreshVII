// Impact events are not yet implemented in the Firestore service.
// Returns an empty list so pages using this hook render without errors.
export type ImpactEvent = {
  id: string
  type: 'ingredient-rescued' | 'leftover-created' | 'meal-prepared' | 'product-added' | 'food-consumed' | 'moved-to-freezer' | 'food-opened'
  quantity: number
  label?: string
  createdAt: string
}

export function useImpactEvents() {
  const events: ImpactEvent[] = []
  return { events, isLoading: false, error: '' }
}
