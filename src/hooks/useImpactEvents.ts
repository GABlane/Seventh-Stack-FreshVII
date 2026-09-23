// Impact events are not yet implemented in the Firestore service.
// Returns an empty list so pages using this hook render without errors.
import type { ImpactEvent } from '../firebase/services/food.service'

export function useImpactEvents() {
  const events: ImpactEvent[] = []
  return { events, isLoading: false, error: '' }
}
