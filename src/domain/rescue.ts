import { calculateFreshness } from './freshness'
import type { FoodItemRecord } from './food'
import type { FreshnessState } from '../data/mockData'
import type { FirestoreRecipe, RecipeIngredient } from '../firebase/services/recipe.service'

export type { FirestoreRecipe, RecipeIngredient }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchedIngredient = {
  ingredient: RecipeIngredient
  inventoryItem: FoodItemRecord
  matchedBy: 'subcategory_id' | 'name'
}

export type RescueRecipeResult = {
  recipe: FirestoreRecipe
  matchedIngredients: MatchedIngredient[]
  missingIngredients: RecipeIngredient[]
  matchPercent: number
  estimatedMinutes: number
  rescueLabel: string
  topUrgency: FreshnessState | null
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const URGENCY_ORDER: FreshnessState[] = ['rescue-today', 'use-soon', 'fresh', 'expired']
const URGENCY_RANK: Record<FreshnessState, number> = {
  'rescue-today': 0,
  'use-soon': 1,
  'fresh': 2,
  'expired': 3,
}

function getFreshness(item: FoodItemRecord): FreshnessState {
  return calculateFreshness({
    category: item.category,
    quantity: item.quantity,
    location: item.storageLocation,
    dateAdded: item.dateAdded,
    openedDate: item.openedDate,
    frozenDate: item.frozenDate,
    estimatedExpiry: item.estimatedExpiry,
  }).freshness
}

// Tries subcategory_id match first, then falls back to name substring match.
// `inventory` should already be sorted by urgency so the first match is the most urgent.
function matchIngredient(
  ingredient: RecipeIngredient,
  inventory: FoodItemRecord[],
): { item: FoodItemRecord; by: 'subcategory_id' | 'name' } | null {
  if (ingredient.subcategoryId) {
    for (const item of inventory) {
      if (item.subcategory_id && item.subcategory_id === ingredient.subcategoryId) {
        return { item, by: 'subcategory_id' }
      }
    }
  }
  for (const item of inventory) {
    const ingName = ingredient.name.toLowerCase()
    const itemName = item.name.toLowerCase()
    if (ingName.includes(itemName) || itemName.includes(ingName)) {
      return { item, by: 'name' }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function matchRecipes(
  inventory: FoodItemRecord[],
  recipes: FirestoreRecipe[],
): RescueRecipeResult[] {
  const active = inventory
    .filter((item) => item.status === 'active' && item.quantity > 0)
    .sort((a, b) => URGENCY_RANK[getFreshness(a)] - URGENCY_RANK[getFreshness(b)])

  return recipes.map((recipe) => {
    const matchedIngredients: MatchedIngredient[] = []
    const missingIngredients: RecipeIngredient[] = []

    for (const ingredient of recipe.ingredients) {
      const match = matchIngredient(ingredient, active)
      if (match) {
        matchedIngredients.push({ ingredient, inventoryItem: match.item, matchedBy: match.by })
      } else {
        missingIngredients.push(ingredient)
      }
    }

    const matchPercent =
      recipe.ingredients.length > 0
        ? Math.round((matchedIngredients.length / recipe.ingredients.length) * 100)
        : 0

    const urgencies = matchedIngredients.map((m) => getFreshness(m.inventoryItem))
    const topUrgency = URGENCY_ORDER.find((u) => urgencies.includes(u)) ?? null

    const rescueLabel =
      matchedIngredients.length === 0
        ? 'Add ingredients to start this recipe'
        : topUrgency === 'rescue-today'
          ? 'Rescues items expiring today'
          : `Uses ${matchedIngredients.map((m) => m.ingredient.name).join(', ')}`

    return {
      recipe,
      matchedIngredients,
      missingIngredients,
      matchPercent,
      estimatedMinutes: recipe.minutes,
      rescueLabel,
      topUrgency,
    }
  })
}

export function rankRescueResults(results: RescueRecipeResult[]): RescueRecipeResult[] {
  return [...results].sort((a, b) => {
    const rankA = a.topUrgency !== null ? URGENCY_RANK[a.topUrgency] : 4
    const rankB = b.topUrgency !== null ? URGENCY_RANK[b.topUrgency] : 4
    if (rankA !== rankB) return rankA - rankB
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent
    return a.recipe.title.localeCompare(b.recipe.title)
  })
}

export function computeRescueRecommendations(
  inventory: FoodItemRecord[],
  recipes: FirestoreRecipe[],
): RescueRecipeResult[] {
  return rankRescueResults(matchRecipes(inventory, recipes))
}
