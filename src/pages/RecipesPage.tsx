import { ChefHat } from 'lucide-react'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { recipes } from '../data/mockData'

export function RecipesPage() {
  return <div className="w-full max-w-5xl space-y-8"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]"><ChefHat size={16} /> From your kitchen</p><h1 className="mt-2 text-4xl font-black tracking-tight">Recipes worth rescuing for</h1><p className="mt-3 max-w-xl text-stone-600">Recipes are ranked by how much of your food they use, so the right meal is easier to spot.</p></div><div className="grid gap-5 lg:grid-cols-3">{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div></div>
}
