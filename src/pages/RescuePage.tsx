import { ArrowRight, ChefHat, Clock3, Flame, XCircle } from 'lucide-react'
import { Link } from 'react-router'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { recipes, type FoodItem } from '../data/mockData'
import { useFoodItems } from '../hooks/useFoodItems'

const stateCopy = {
  'rescue-today': { title: 'Rescue Today', hint: 'Use these today', color: 'bg-[#fff0dc] text-[#bd6720]', dot: 'bg-[#ff9d3d]', Icon: Flame },
  'use-soon': { title: 'Use Soon', hint: 'Expiring in the next 2 days', color: 'bg-[#fff8d8] text-[#9b7800]', dot: 'bg-[#ffd34e]', Icon: Clock3 },
  expired: { title: 'Expired', hint: 'Past the tracked expiration date', color: 'bg-[#ffe9e8] text-[#c52e31]', dot: 'bg-[#ee5c63]', Icon: XCircle },
}

function RescueItemCard({ item }: { item: FoodItem }) {
  const copy = stateCopy[item.freshness as keyof typeof stateCopy]
  const Icon = copy.Icon
  return <article className="rounded-[1.15rem] border border-[#d7e4e8] bg-white p-3 shadow-[0_5px_14px_rgba(31,78,93,0.05)] sm:p-4"><div className="flex items-start gap-3"><div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f7fa] text-[#4f8ca3]"><span className={`absolute left-1 top-1 size-2.5 rounded-full ${copy.dot}`} /><ChefHat size={23} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="truncate text-sm font-black text-[#173d4e]">{item.name}</h3><p className="mt-1 text-xs font-semibold text-[#6f8b95]">{item.quantity} {item.unit} · {item.location === 'fridge' ? 'Fridge' : item.location}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${copy.color}`}><Icon size={11} /> {item.freshness === 'rescue-today' ? 'Rescue Today' : item.freshness === 'use-soon' ? 'Use Soon' : 'Expired'}</span></div><p className="mt-2 text-xs font-bold text-[#bd6720]">{item.expires}</p></div></div><p className="mt-3 rounded-lg bg-[#eaf8fa] px-3 py-2 text-xs font-semibold text-[#477d8d]">{item.freshness === 'expired' ? 'Check it before using. Discard if it smells or looks off.' : item.freshness === 'rescue-today' ? 'Use it in a quick recipe or eat it today.' : 'Cook it today or freeze it to pause the timer.'}</p><div className="mt-3 grid grid-cols-2 gap-2"><Link to="/app/recipes" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[#20bed0] px-3 text-xs font-black text-[#063e4d] hover:bg-[#0db3c8]"><ChefHat size={14} /> {item.freshness === 'expired' ? 'Find recipe' : 'Cook this'}</Link><Link to={`/app/food/${item.id}`} className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-[#b8d7de] bg-[#f0fafb] px-3 text-xs font-bold text-[#173d4e] hover:bg-white">{item.freshness === 'expired' ? 'Still good' : item.location === 'freezer' ? 'In freezer' : 'View food'} <ArrowRight size={13} /></Link></div></article>
}

export function RescuePage() {
  const { items, isLoading, error } = useFoodItems()
  const urgent = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).sort((a, b) => b.rescueScore - a.rescueScore)
  const rescueToday = items.filter((item) => item.quantity > 0 && item.freshness === 'rescue-today')
  const useSoon = items.filter((item) => item.quantity > 0 && item.freshness === 'use-soon')
  const expired = items.filter((item) => item.quantity > 0 && item.freshness === 'expired')
  const availableNames = urgent.map((item) => item.name.toLowerCase())
  const recommendations = recipes.map((recipe) => { const rescuedIngredients = recipe.ingredients.filter((ingredient) => availableNames.some((name) => name.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(name))); return { ...recipe, match: Math.round((rescuedIngredients.length / recipe.ingredients.length) * 100), rescuedIngredients, rescue: rescuedIngredients.length ? `Rescues ${rescuedIngredients.join(', ')}` : 'A fresh idea for tonight' } }).sort((a, b) => b.match - a.match).slice(0, 3)

  function group(title: keyof typeof stateCopy, data: FoodItem[]) {
    const copy = stateCopy[title]
    const Icon = copy.Icon
    if (!data.length) return null
    return <section className="space-y-3"><div className="flex items-center gap-2 px-1"><span className={`flex size-7 items-center justify-center rounded-lg ${copy.color}`}><Icon size={15} /></span><div><h2 className="text-base font-black text-[#173d4e]">{copy.title} ({data.length})</h2><p className="text-[11px] font-semibold text-[#477d8d]">{copy.hint}</p></div></div><div className="space-y-3">{data.map((item) => <RescueItemCard key={item.id} item={item} />)}</div></section>
  }

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-6 bg-[#eefafd] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-8"><header><p className="text-xs font-bold text-[#4f8ca3]">Food rescue</p><h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#14384a]">Rescue my food</h1><p className="mt-3 text-sm font-semibold text-[#477d8d]">{urgent.length} items need attention · help prevent waste</p></header>{error && <p role="alert" className="rounded-2xl bg-[#fff0ef] p-4 text-sm text-[#ad4147]">{error}</p>}{isLoading ? <div className="rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#5e7f8b]">Checking your kitchen...</div> : <>{recommendations.length > 0 && <section className="space-y-3"><div className="flex items-center justify-between px-1"><div><p className="text-xs font-black uppercase tracking-[0.1em] text-[#4f8ca3]">Cook before it goes to waste</p><h2 className="mt-1 text-lg font-black text-[#173d4e]">Dinner ideas</h2></div><Link to="/app/recipes" className="text-xs font-black text-[#087c91]">See all</Link></div><div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">{recommendations.map((recipe) => <div key={recipe.id} className="w-[18rem] shrink-0 snap-start"><RecipeCard recipe={recipe} compact /></div>)}</div></section>}{group('rescue-today', rescueToday)}{group('use-soon', useSoon)}{group('expired', expired)}{urgent.length === 0 && expired.length === 0 && <div className="rounded-3xl border border-dashed border-[#b9dce7] bg-white p-10 text-center text-[#5e7f8b]">Nothing needs rescuing yet.</div>}</>}</div>
}
