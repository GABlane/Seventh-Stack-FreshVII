import { Clock3, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { useFoodContext } from '../context/FoodContext'
import { useAIRecommendations } from '../hooks/useAIRecommendations'

export function RecipesPage() {
  const { rawItems, loading } = useFoodContext()
  const { recommendations, isLoading: aiLoading } = useAIRecommendations(rawItems)
  const isLoading = loading || aiLoading

  const topResult = recommendations[0]

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-5 bg-[#eaf8fa] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-8"><header className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#193b5a]">From your kitchen</p><h1 className="mt-1 text-[2rem] font-black leading-none text-[#193b5a]">Recipes</h1><p className="mt-2 text-sm font-semibold text-[#6f8b95]">Ranked by what needs using first</p></div><button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#b8d4df] bg-white px-3 text-xs font-bold text-[#193b5a]"><SlidersHorizontal size={15} /> Filters</button></header>{topResult && <section className="rounded-[1.25rem] border border-[#bdebf0] bg-[#d9eef3] p-4"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#193b5a]"><Clock3 size={14} /> Dinner planning</p><p className="mt-2 text-sm font-black text-[#193b5a]">Your {topResult.title.toLowerCase()} uses what needs attention first.</p><p className="mt-1 text-xs font-semibold text-[#6f8b95]">Here is a {topResult.time}-minute recipe matched to your kitchen.</p><Link to={`/app/recipes/${topResult.id}`} className="mt-3 inline-flex h-9 items-center rounded-xl bg-[#193b5a] px-3 text-xs font-black text-white">View recipe</Link></section>}{isLoading ? <div className="rounded-3xl border border-[#c6dde5] bg-white p-10 text-center text-[#6f8b95]">Finding recipes for your kitchen...</div> : <div className="grid gap-4 sm:grid-cols-2">{recommendations.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} compact />)}</div>}</div>
}
