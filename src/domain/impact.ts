import type { FoodEvent } from './food'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImpactMetrics = {
  ingredientsRescued: number  // count of 'consumed' events
  mealsCooked: number         // count of 'leftover-created' events
  estimatedFoodSaved: number  // sum of |quantityChange| from consumed events
}

// ---------------------------------------------------------------------------
// computeImpactMetrics
// ---------------------------------------------------------------------------

export function computeImpactMetrics(events: FoodEvent[]): ImpactMetrics {
  let ingredientsRescued = 0
  let mealsCooked = 0
  let estimatedFoodSaved = 0

  for (const event of events) {
    if (event.type === 'consumed') {
      ingredientsRescued += 1
      estimatedFoodSaved += Math.abs(event.quantityChange ?? 0)
    }
    if (event.type === 'leftover-created') {
      mealsCooked += 1
    }
  }

  return { ingredientsRescued, mealsCooked, estimatedFoodSaved }
}
