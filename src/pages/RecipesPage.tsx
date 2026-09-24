import { Clock3, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { useFoodContext } from '../context/FoodContext'
import { useRecipeContext } from '../context/RecipeContext'
import { computeRescueRecommendations } from '../domain/rescue'

export function RecipesPage() {
  const { rawItems, loading } = useFoodContext()
  const { recipes, isLoading: recipesLoading } = useRecipeContext()
  const isLoading = loading || recipesLoading

  const results = computeRescueRecommendations(rawItems, recipes)
  const recommendations = results.map((result) => ({
    id: result.recipe.id,
    title: result.recipe.title,
    time: result.recipe.minutes,
    match: result.matchPercent,
    ingredients: result.recipe.ingredients.map((i) => i.name),
    rescuedIngredients: result.matchedIngredients.map((m) => m.ingredient.name),
    rescue: result.rescueLabel,
  }))
  const topResult = results[0]

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-5 bg-[#eefafd] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:space-y-6 sm:px-8 sm:py-8"><header className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#4f8ca3]">From your kitchen</p><h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#14384a]">Recipes</h1><p className="mt-2 text-sm font-semibold text-[#477d8d]">Ranked by what needs using first</p></div><button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#b9dce7] bg-[#f0fafb] px-3 text-xs font-bold text-[#145d72]"><SlidersHorizontal size={15} /> Filters</button></header>{topResult && <section className="rounded-[1.25rem] border border-[#20bed0] bg-[#d9f5f8] p-4"><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#145d72]"><Clock3 size={14} /> 4:30 PM · Dinner planning</div><p className="mt-2 text-sm font-black leading-5 text-[#173d4e]">Your {topResult.recipe.title.toLowerCase()} uses what needs attention first.</p><p className="mt-1 text-xs font-semibold text-[#477d8d]">Here is a {topResult.estimatedMinutes}-minute recipe matched to your kitchen.</p><Link to={`/app/recipes/${topResult.recipe.id}`} className="mt-3 inline-flex h-9 items-center rounded-xl border border-[#20bed0] bg-white px-3 text-xs font-black text-[#145d72]">View recipe</Link></section>}{isLoading ? <div className="rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#5e7f8b]">Finding recipes for your kitchen...</div> : <div className="grid gap-4 sm:grid-cols-2">{recommendations.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} compact />)}</div>}</div>
}
