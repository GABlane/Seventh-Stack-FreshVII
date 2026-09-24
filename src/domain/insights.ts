import { calculateFreshness } from './freshness'
import type { FoodEvent, FoodItemRecord } from './food'

// ---------------------------------------------------------------------------
// Weight estimation
// ---------------------------------------------------------------------------

// Items are logged in mixed units, so weights are estimates: g/kg/ml/l convert directly
// (1 ml is treated as 1 g) and counted units use a typical weight.
const PIECE_GRAMS: Record<string, number> = {
  produce: 150,
  'dairy & eggs': 100,
  meat: 250,
  grains: 100,
  pantry: 150,
}

const UNIT_GRAMS: Record<string, number> = {
  bag: 500,
  pack: 400,
  serving: 250,
  tub: 500,
}

const DEFAULT_UNIT_GRAMS = 250

export function estimateKg(quantity: number, unit: string, category: string): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0
  const normalizedUnit = unit.trim().toLowerCase()
  if (normalizedUnit === 'kg' || normalizedUnit === 'l') return quantity
  if (normalizedUnit === 'g' || normalizedUnit === 'ml') return quantity / 1000
  const gramsPerUnit = normalizedUnit === 'piece'
    ? PIECE_GRAMS[category.trim().toLowerCase()] ?? DEFAULT_UNIT_GRAMS
    : UNIT_GRAMS[normalizedUnit] ?? DEFAULT_UNIT_GRAMS
  return (quantity * gramsPerUnit) / 1000
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryWaste = { category: string; kg: number; items: number; cost: number }
export type PurchasedFood = { name: string; times: number }

export type WeeklyRecap = {
  itemsSaved: number
  itemsExpired: number
  wastedKg: number
  wastedCost: number
}

export type Insights = {
  wastedKg: number
  wastedCost: number
  itemsDiscarded: number
  savedKg: number
  wasteByCategory: CategoryWaste[]
  mostPurchased: PurchasedFood[]
  week: WeeklyRecap
}

const WEEK_MS = 7 * 86_400_000

// ---------------------------------------------------------------------------
// computeInsights
// ---------------------------------------------------------------------------

function expiryOf(item: FoodItemRecord, now: Date): Date | null {
  try {
    return calculateFreshness({
      category: item.category,
      quantity: item.quantity,
      location: item.storageLocation,
      dateAdded: item.dateAdded,
      openedDate: item.openedDate,
      frozenDate: item.frozenDate,
      estimatedExpiry: item.estimatedExpiry,
    }, now).estimatedExpiry
  } catch {
    return null
  }
}

// `items` must include consumed and discarded records, not only active ones.
export function computeInsights(items: FoodItemRecord[], events: FoodEvent[], now = new Date()): Insights {
  const byId = new Map(items.map((item) => [item.id, item]))
  const weekStart = now.getTime() - WEEK_MS
  const inWeek = (iso: string) => {
    const time = new Date(iso).getTime()
    return time >= weekStart && time <= now.getTime()
  }

  let wastedKg = 0
  let wastedCost = 0
  let itemsDiscarded = 0
  let savedKg = 0
  const weekSaved = new Set<string>()
  const week: WeeklyRecap = { itemsSaved: 0, itemsExpired: 0, wastedKg: 0, wastedCost: 0 }
  const categories = new Map<string, CategoryWaste>()
  const purchases = new Map<string, PurchasedFood>()

  for (const event of events) {
    const item = byId.get(event.foodItemId)
    const category = item?.category ?? 'Pantry'
    const unit = item?.unit ?? 'piece'

    if (event.type === 'discarded') {
      const kg = estimateKg(event.quantityBefore ?? item?.quantity ?? 0, unit, category)
      const cost = Number(event.metadata?.estimatedWasteCost ?? 0)
      wastedKg += kg
      wastedCost += cost
      itemsDiscarded += 1
      const row = categories.get(category) ?? { category, kg: 0, items: 0, cost: 0 }
      row.kg += kg
      row.items += 1
      row.cost += cost
      categories.set(category, row)
      if (inWeek(event.createdAt)) {
        week.wastedKg += kg
        week.wastedCost += cost
      }
    }

    if (event.type === 'consumed') {
      const kg = estimateKg(Math.abs(event.quantityChange ?? 0), unit, category)
      savedKg += kg
      if (inWeek(event.createdAt)) weekSaved.add(event.foodItemId)
    }

    // Leftover portions also log an 'added' event; they carry a source item and are not purchases.
    if (event.type === 'added' && item && event.metadata?.sourceFoodItemId === undefined) {
      const key = item.name.trim().toLowerCase()
      const row = purchases.get(key) ?? { name: item.name.trim(), times: 0 }
      row.times += 1
      purchases.set(key, row)
    }
  }

  week.itemsSaved = weekSaved.size
  for (const item of items) {
    if (item.status === 'consumed') continue
    const expiry = expiryOf(item, now)
    if (expiry && expiry.getTime() >= weekStart && expiry.getTime() <= now.getTime()) week.itemsExpired += 1
  }

  return {
    wastedKg,
    wastedCost,
    itemsDiscarded,
    savedKg,
    wasteByCategory: [...categories.values()].sort((a, b) => b.kg - a.kg || b.items - a.items),
    mostPurchased: [...purchases.values()].sort((a, b) => b.times - a.times || a.name.localeCompare(b.name)).slice(0, 5),
    week,
  }
}
