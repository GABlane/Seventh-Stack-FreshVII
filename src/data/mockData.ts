import { calculateFreshness, calculateRescueScore } from '../domain/freshness'

export type FreshnessState = 'fresh' | 'use-soon' | 'rescue-today' | 'expired'
export type StorageLocation = 'fridge' | 'freezer' | 'pantry'

export type FoodItem = {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  location: StorageLocation
  shelf: string
  opened: boolean
  dateAdded: string
  openedDate?: string
  frozenDate?: string
  freshness: FreshnessState
  freshnessPercentage: number
  expires: string
  rescueScore: number
  rescueReasons: string[]
  accent: string
}

type RawFoodItem = Omit<FoodItem, 'freshness' | 'freshnessPercentage' | 'expires' | 'rescueScore' | 'rescueReasons'>

const rawFoodItems: RawFoodItem[] = [
  { id: 'spinach', name: 'Baby spinach', category: 'Produce', quantity: 1, unit: 'bag', location: 'fridge', shelf: 'Top shelf', opened: true, dateAdded: '2026-09-18', openedDate: '2026-09-20', accent: '#dce9de' },
  { id: 'berries', name: 'Mixed berries', category: 'Produce', quantity: 280, unit: 'g', location: 'fridge', shelf: 'Top shelf', opened: false, dateAdded: '2026-09-19', accent: '#eadcf0' },
  { id: 'eggs', name: 'Free-range eggs', category: 'Dairy & eggs', quantity: 8, unit: 'eggs', location: 'fridge', shelf: 'Middle shelf', opened: false, dateAdded: '2026-09-15', accent: '#f4e6c9' },
  { id: 'yogurt', name: 'Greek yogurt', category: 'Dairy & eggs', quantity: 1, unit: 'tub', location: 'fridge', shelf: 'Middle shelf', opened: true, dateAdded: '2026-09-19', openedDate: '2026-09-21', accent: '#dce7ef' },
  { id: 'chicken', name: 'Chicken thighs', category: 'Meat', quantity: 450, unit: 'g', location: 'freezer', shelf: 'Drawer 1', opened: false, dateAdded: '2026-09-20', frozenDate: '2026-09-20', accent: '#f0ddd2' },
  { id: 'rice', name: 'Jasmine rice', category: 'Grains', quantity: 1, unit: 'bag', location: 'pantry', shelf: 'Dry goods', opened: true, dateAdded: '2026-08-01', openedDate: '2026-09-01', accent: '#eee9d9' },
]

export const foodItems: FoodItem[] = rawFoodItems.map((item) => {
  const freshness = calculateFreshness(item)
  const rescue = calculateRescueScore(item)
  return {
    ...item,
    ...freshness,
    freshnessPercentage: freshness.freshnessPercentage,
    expires: freshness.expiresLabel,
    rescueScore: rescue.score,
    rescueReasons: rescue.reasons,
  }
})

export const recipes = [
  { id: 'green-frittata', title: 'Green herb frittata', description: 'A soft, savory skillet dinner for the whole table.', time: 25, match: 94, ingredients: ['Baby spinach', 'Free-range eggs', 'Greek yogurt', 'Parmesan'], rescue: 'Uses your spinach today' },
  { id: 'berry-yogurt', title: 'Berry breakfast bowl', description: 'Creamy yogurt, bright berries, and a little crunch.', time: 8, match: 82, ingredients: ['Mixed berries', 'Greek yogurt', 'Granola', 'Honey'], rescue: 'Uses your berries tomorrow' },
  { id: 'chicken-rice', title: 'Crispy chicken rice bowl', description: 'A freezer-friendly bowl with fresh herbs and greens.', time: 35, match: 68, ingredients: ['Chicken thighs', 'Jasmine rice', 'Baby spinach', 'Lime'], rescue: 'Good freezer-to-table option' },
]