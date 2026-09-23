import { ArrowRight, Flame, Lightbulb } from 'lucide-react'
import { Link } from 'react-router'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { recipes } from '../data/mockData'
import { useFoodItems } from '../hooks/useFoodItems'

export function RescuePage() {
  const { items, isLoading, error } = useFoodItems()
  const urgent = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).sort((a, b) => {
    const statePriority: Record<string, number> = { 'rescue-today': 0, 'use-soon': 1 }
    return statePriority[a.freshness] - statePriority[b.freshness] || b.rescueScore - a.rescueScore
  })
  const availableNames = urgent.map((item) => item.name.toLowerCase())
  const recommendations = recipes.map((recipe) => {
    const rescuedIngredients = recipe.ingredients.filter((ingredient) => availableNames.some((name) => name.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(name)))
    const match = Math.round((rescuedIngredients.length / recipe.ingredients.length) * 100)
    return { ...recipe, match, rescuedIngredients, rescue: rescuedIngredients.length ? `Rescues ${rescuedIngredients.join(', ')}` : 'No urgent ingredients matched yet' }
  }).filter((recipe) => recipe.rescuedIngredients.length > 0).sort((a, b) => b.match - a.match)

  return <div className="w-full max-w-4xl space-y-8">
    <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#b84f49]"><Flame size={16} /> Food rescue</p><h1 className="mt-2 text-4xl font-black tracking-tight">Rescue my food</h1><p className="mt-3 max-w-xl text-stone-600">A live list of food approaching its estimated expiry, paired with recipes that can use it.</p></div>
    {urgent.length > 0 && <div className="flex items-start gap-3 rounded-3xl bg-[#f9ddd9] p-5 text-[#7c3733]"><Lightbulb size={20} className="mt-0.5 shrink-0" /><p className="text-sm leading-6"><strong>Start with {urgent[0].name}.</strong> It has the highest priority in your kitchen right now.</p></div>}
    {error && <p role="alert" className="rounded-2xl bg-[#f9ddd9] p-4 text-sm text-[#7c3733]">{error}</p>}
    {isLoading ? <div className="rounded-3xl border border-[#e5e1d5] bg-white p-10 text-center text-stone-500">Checking your kitchen...</div> : urgent.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8d1c0] bg-white p-10 text-center"><p className="font-bold text-stone-800">Nothing needs rescuing yet.</p><p className="mt-2 text-sm text-stone-500">Food will appear here when it reaches the estimated use-soon window.</p></div> : <div className="space-y-3">{urgent.map((item, index) => <Link key={item.id} to={`/app/food/${item.id}`} className="group flex items-center gap-4 rounded-3xl border border-[#e5e1d5] bg-white p-4 transition-transform hover:-translate-y-0.5 sm:p-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f6e8c9] text-sm font-black text-[#9b6c22]">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{item.name}</h2><FreshnessBadge state={item.freshness} /></div><p className="mt-1 text-sm text-stone-500">{item.quantity} {item.unit} remaining - {item.expires} - {item.category}</p></div><div className="text-right"><p className="text-2xl font-black text-[#b84f49]">{item.rescueScore}</p><p className="text-[11px] font-bold uppercase text-stone-400">score</p></div><ArrowRight size={18} className="text-stone-400" /></Link>)}</div>}
    {!isLoading && recommendations.length > 0 && <section className="space-y-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]">Cook before it fades</p><h2 className="mt-1 text-2xl font-black">Recipes for your urgent food</h2></div><div className="grid gap-5 lg:grid-cols-2">{recommendations.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div></section>}
  </div>
}
