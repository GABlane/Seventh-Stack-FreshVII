import { ChefHat } from 'lucide-react'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { recipes } from '../data/mockData'
import { useFoodItems } from '../hooks/useFoodItems'

export function RecipesPage() {
  const { items, isLoading, error } = useFoodItems()
  const availableNames = items.filter((item) => item.quantity > 0).map((item) => item.name.toLowerCase())
  const recommendations = recipes.map((recipe) => {
    const rescuedIngredients = recipe.ingredients.filter((ingredient) => availableNames.some((name) => name.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(name)))
    const match = Math.round((rescuedIngredients.length / recipe.ingredients.length) * 100)
    return { ...recipe, match, rescue: rescuedIngredients.length ? `Uses ${rescuedIngredients.join(', ')}` : 'Add ingredients to start this recipe' }
  }).sort((a, b) => b.match - a.match)

  return <div className="w-full max-w-5xl space-y-8"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]"><ChefHat size={16} /> From your kitchen</p><h1 className="mt-2 text-4xl font-black tracking-tight">Recipes worth rescuing for</h1><p className="mt-3 max-w-xl text-stone-600">Recommendations now reflect what is actually available in your inventory.</p></div>{error && <p role="alert" className="rounded-2xl bg-[#f9ddd9] p-4 text-sm text-[#7c3733]">{error}</p>}{isLoading ? <div className="rounded-3xl border border-[#e5e1d5] bg-white p-10 text-center text-stone-500">Finding recipes for your kitchen...</div> : <div className="grid gap-5 lg:grid-cols-3">{recommendations.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>}</div>
}
