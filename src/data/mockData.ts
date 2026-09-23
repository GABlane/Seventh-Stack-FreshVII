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

export const foodItems: FoodItem[] = []

export const recipes = [
  { id: 'green-frittata', title: 'Green herb frittata', description: 'A soft, savory skillet dinner for the whole table.', time: 25, match: 94, ingredients: ['Baby spinach', 'Free-range eggs', 'Greek yogurt', 'Parmesan'], rescue: 'Uses your spinach today' },
  { id: 'berry-yogurt', title: 'Berry breakfast bowl', description: 'Creamy yogurt, bright berries, and a little crunch.', time: 8, match: 82, ingredients: ['Mixed berries', 'Greek yogurt', 'Granola', 'Honey'], rescue: 'Uses your berries tomorrow' },
  { id: 'chicken-rice', title: 'Crispy chicken rice bowl', description: 'A freezer-friendly bowl with fresh herbs and greens.', time: 35, match: 68, ingredients: ['Chicken thighs', 'Jasmine rice', 'Baby spinach', 'Lime'], rescue: 'Good freezer-to-table option' },
]