import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateFreshness } from '../domain/freshness'
import type { FoodItemRecord } from '../domain/food'
import type { AIRecipe, InventoryItem } from '../../api/recommend-recipes'
import { useRecipeContext } from '../context/RecipeContext'
import { computeRescueRecommendations } from '../domain/rescue'
import type { RescueRecipeResult } from '../domain/rescue'

// Shape that RecipeCard and the pages already expect.
export type RecipeCardData = {
  id: string
  title: string
  description?: string
  time: number
  match: number
  ingredients: string[]
  rescuedIngredients: string[]
  rescue: string
}

const URGENCY_RANK: Record<string, number> = {
  'rescue-today': 0,
  'use-soon': 1,
  fresh: 2,
  expired: 3,
}

function getFreshnessState(item: FoodItemRecord): string {
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

function toInventoryItem(item: FoodItemRecord): InventoryItem {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    location: item.storageLocation,
    freshnessState: getFreshnessState(item),
  }
}

function toRecipeCardData(ai: AIRecipe): RecipeCardData {
  const allIngredients = [...ai.usedIngredients, ...ai.otherIngredients]
  const matchPercent =
    allIngredients.length > 0
      ? Math.round((ai.usedIngredients.length / allIngredients.length) * 100)
      : 0
  return {
    id: ai.id,
    title: ai.title,
    description: ai.description,
    time: ai.cookTimeMinutes,
    match: matchPercent,
    ingredients: allIngredients,
    rescuedIngredients: ai.usedIngredients,
    rescue: ai.rescueLabel,
  }
}

function fingerprint(items: InventoryItem[]): string {
  return items.map((i) => `${i.name}:${i.quantity}`).join('|')
}

function rescueResultToCardData(result: RescueRecipeResult): RecipeCardData {
  return {
    id: result.recipe.id,
    title: result.recipe.title,
    time: result.recipe.minutes,
    match: result.matchPercent,
    ingredients: result.recipe.ingredients.map((i) => i.name),
    rescuedIngredients: result.matchedIngredients.map((m) => m.ingredient.name),
    rescue: result.rescueLabel,
  }
}

export function useAIRecommendations(rawItems: FoodItemRecord[]) {
  const { recipes } = useRecipeContext()
  const [recommendations, setRecommendations] = useState<RecipeCardData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the last fingerprint we fetched so we don't re-fetch on every render.
  const lastFingerprintRef = useRef<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const activeItems = rawItems
    .filter((item) => item.status === 'active' && item.quantity > 0)
    .map(toInventoryItem)
    .sort((a, b) => (URGENCY_RANK[a.freshnessState ?? ''] ?? 4) - (URGENCY_RANK[b.freshnessState ?? ''] ?? 4))

  const fetch = useCallback(async (items: InventoryItem[], rawItemsSnap: FoodItemRecord[], force = false) => {
    if (items.length === 0) {
      setRecommendations([])
      setIsLoading(false)
      setError(null)
      return
    }

    const fp = fingerprint(items)
    if (!force && fp === lastFingerprintRef.current) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    lastFingerprintRef.current = fp
    setIsLoading(true)
    setError(null)

    try {
      const res = await window.fetch('/api/recommend-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        signal: abortRef.current.signal,
      })
      const data = await res.json() as { recipes?: AIRecipe[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to get recommendations')
      const aiRecipes = (data.recipes ?? []).map(toRecipeCardData)
      console.log('[AI recs] success →', aiRecipes.map((r) => r.title))
      setRecommendations(aiRecipes)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      // Fallback to Firestore recipe matching when AI is unavailable.
      const fallback = computeRescueRecommendations(rawItemsSnap, recipes).map(rescueResultToCardData)
      console.warn('[AI recs] fallback to Firestore →', (err as Error).message, fallback.map((r) => r.title))
      setRecommendations(fallback)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  // recipes is intentionally excluded — changing the recipe list mid-session
  // shouldn't trigger a re-fetch; it only matters during a fallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-fetch whenever active inventory changes.
  useEffect(() => {
    void fetch(activeItems, rawItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint(activeItems)])

  const refresh = useCallback(() => {
    void fetch(activeItems, rawItems, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint(activeItems), fetch])

  return { recommendations, isLoading, error, refresh }
}
