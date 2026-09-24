import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToRecipes, type FirestoreRecipe } from '../firebase/services/recipe.service'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecipeContextValue = {
  recipes: FirestoreRecipe[]
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RecipeContext = createContext<RecipeContextValue | null>(null)

export function useRecipeContext(): RecipeContextValue {
  const ctx = useContext(RecipeContext)
  if (!ctx) throw new Error('useRecipeContext must be used inside RecipeProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<FirestoreRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Recipes are a global collection — subscribe once on mount.
  // AppLayout already guards this behind auth, so a user is always present here.
  useEffect(() => {
    const unsub = subscribeToRecipes((data) => {
      setRecipes(data)
      setIsLoading(false)
    })
    return unsub
  }, [])

  return (
    <RecipeContext.Provider value={{ recipes, isLoading }}>
      {children}
    </RecipeContext.Provider>
  )
}
