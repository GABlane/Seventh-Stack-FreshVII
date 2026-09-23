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
  freshness: FreshnessState
  expires: string
  rescueScore: number
  accent: string
}

export const foodItems: FoodItem[] = [
  { id: 'spinach', name: 'Baby spinach', category: 'Produce', quantity: 1, unit: 'bag', location: 'fridge', shelf: 'Top shelf', opened: true, freshness: 'rescue-today', expires: 'Today', rescueScore: 92, accent: '#dce9de' },
  { id: 'berries', name: 'Mixed berries', category: 'Produce', quantity: 280, unit: 'g', location: 'fridge', shelf: 'Top shelf', opened: false, freshness: 'use-soon', expires: 'Tomorrow', rescueScore: 74, accent: '#eadcf0' },
  { id: 'eggs', name: 'Free-range eggs', category: 'Dairy & eggs', quantity: 8, unit: 'eggs', location: 'fridge', shelf: 'Middle shelf', opened: false, freshness: 'fresh', expires: 'in 8 days', rescueScore: 18, accent: '#f4e6c9' },
  { id: 'yogurt', name: 'Greek yogurt', category: 'Dairy & eggs', quantity: 1, unit: 'tub', location: 'fridge', shelf: 'Middle shelf', opened: true, freshness: 'use-soon', expires: 'in 2 days', rescueScore: 61, accent: '#dce7ef' },
  { id: 'chicken', name: 'Chicken thighs', category: 'Meat', quantity: 450, unit: 'g', location: 'freezer', shelf: 'Drawer 1', opened: false, freshness: 'fresh', expires: 'in 3 months', rescueScore: 12, accent: '#f0ddd2' },
  { id: 'rice', name: 'Jasmine rice', category: 'Grains', quantity: 1, unit: 'bag', location: 'pantry', shelf: 'Dry goods', opened: true, freshness: 'fresh', expires: 'in 11 months', rescueScore: 5, accent: '#eee9d9' },
]

export const recipes = [
  { id: 'green-frittata', title: 'Green herb frittata', description: 'A soft, savory skillet dinner for the whole table.', time: 25, match: 94, ingredients: ['Baby spinach', 'Free-range eggs', 'Greek yogurt', 'Parmesan'], rescue: 'Uses your spinach today' },
  { id: 'berry-yogurt', title: 'Berry breakfast bowl', description: 'Creamy yogurt, bright berries, and a little crunch.', time: 8, match: 82, ingredients: ['Mixed berries', 'Greek yogurt', 'Granola', 'Honey'], rescue: 'Uses your berries tomorrow' },
  { id: 'chicken-rice', title: 'Crispy chicken rice bowl', description: 'A freezer-friendly bowl with fresh herbs and greens.', time: 35, match: 68, ingredients: ['Chicken thighs', 'Jasmine rice', 'Baby spinach', 'Lime'], rescue: 'Good freezer-to-table option' },
]